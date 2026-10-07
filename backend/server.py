from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import List, Optional, Annotated
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude={"id"})
        return data

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)


class ChatMessage(BaseDocument):
    session_id: str
    role: str  # "user" | "assistant"
    content: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=4, max_length=100)
    message: str = Field(min_length=1, max_length=2000)


SYSTEM_PROMPT = """Tu es l'assistant virtuel de la société Médical o2, prestataire de santé à domicile.
Tu aides les patients (souvent âgés) à utiliser et entretenir leur matériel : PPC (pression positive continue) pour l'apnée du sommeil, ventilation non invasive (VNI), masques (nasal, narinaire, facial), humidificateur chauffant, tuyau/circuit et filtres.

Règles :
- Réponds toujours en français simple, chaleureux et rassurant, sans jargon. Phrases courtes.
- Réponses brèves (moins de 150 mots), avec des étapes numérotées quand c'est utile.
- Texte brut uniquement : pas de markdown (pas d'astérisques, pas de #), pas d'emoji. Pour une liste, utilise « 1. », « 2. » en début de ligne.
- Ne pose jamais de diagnostic et ne modifie jamais les réglages prescrits (pression, fréquence...). Pour tout réglage, renvoie vers le médecin ou le technicien Médical o2.
- Entretien : eau tiède + savon doux (type liquide vaisselle ou savon de Marseille), rinçage, séchage à l'air libre à l'abri du soleil. Jamais d'alcool, d'eau de Javel ni de lave-vaisselle. Pour l'humidificateur, le patient choisit : eau déminéralisée, eau en bouteille ou eau du robinet, toutes compatibles (avec l'eau du robinet, détartrer plus souvent).
- En cas de difficulté respiratoire importante, douleur thoracique, malaise ou panne d'un ventilateur vital : dis d'appeler immédiatement le 15 (ou le 112).
- Si la question sort du sujet du matériel respiratoire et du sommeil, recentre poliment.
- Vocabulaire : la partie du masque en contact avec le visage s'appelle la « bulle » (ou membrane), jamais le « coussin ».
- Termine si utile par une invitation à contacter Médical o2 au 04 28 41 01 10."""


def build_system_message(history: List[ChatMessage]) -> str:
    if not history:
        return SYSTEM_PROMPT
    lines = []
    for m in history[-20:]:
        who = "Patient" if m.role == "user" else "Assistant"
        lines.append(f"{who} : {m.content}")
    return SYSTEM_PROMPT + "\n\nHistorique récent de la conversation :\n" + "\n".join(lines)


@api_router.get("/")
async def root():
    return {"message": "Médical o2 API"}


@api_router.get("/chat/{session_id}/messages", response_model=List[ChatMessage], response_model_by_alias=False)
async def get_messages(session_id: str):
    docs = await db.chat_messages.find({"session_id": session_id}).sort("created_at", 1).to_list(500)
    return [ChatMessage.from_mongo(d) for d in docs]


@api_router.delete("/chat/{session_id}")
async def clear_messages(session_id: str):
    await db.chat_messages.delete_many({"session_id": session_id})
    return {"ok": True}


@api_router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    text = req.message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message vide")

    docs = await db.chat_messages.find({"session_id": req.session_id}).sort("created_at", 1).to_list(500)
    history = [ChatMessage.from_mongo(d) for d in docs]

    user_msg = ChatMessage(session_id=req.session_id, role="user", content=text)
    await db.chat_messages.insert_one(user_msg.to_mongo())

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=build_system_message(history),
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    async def event_generator():
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=text)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:  # noqa: BLE001
            logger.exception("LLM error: %s", e)
            yield f"data: {json.dumps({'error': 'Assistant indisponible pour le moment.'})}\n\n"
        if full:
            bot = ChatMessage(session_id=req.session_id, role="assistant", content=full)
            await db.chat_messages.insert_one(bot.to_mongo())
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
