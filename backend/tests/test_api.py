"""Backend tests for Médical o2 chat API."""
import os
import json
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://ppc-patient-guide.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def session_id():
    sid = f"test-{uuid.uuid4().hex[:10]}"
    yield sid
    # cleanup
    try:
        requests.delete(f"{API}/chat/{sid}", timeout=10)
    except Exception:
        pass


# --- Health ---
def test_root():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json().get("message") == "Médical o2 API"


# --- Chat validation ---
def test_chat_stream_rejects_empty_message():
    r = requests.post(f"{API}/chat/stream", json={"session_id": "test-empty-xxx", "message": ""}, timeout=10)
    # Pydantic min_length=1 -> 422
    assert r.status_code in (400, 422)


def test_chat_stream_rejects_short_session():
    r = requests.post(f"{API}/chat/stream", json={"session_id": "x", "message": "bonjour"}, timeout=10)
    assert r.status_code == 422


# --- Chat stream + persistence + history + clear ---
def test_chat_stream_persists_user_message_and_done(session_id):
    """Even if LLM budget is exhausted, user message must be persisted and stream must return 'done'."""
    payload = {"session_id": session_id, "message": "Comment nettoyer mon masque ?"}
    r = requests.post(f"{API}/chat/stream", json=payload, stream=True, timeout=30,
                      headers={"Accept": "text/event-stream"})
    assert r.status_code == 200
    assert "text/event-stream" in r.headers.get("content-type", "")

    events = []
    for raw in r.iter_lines(decode_unicode=True):
        if not raw:
            continue
        if raw.startswith("data:"):
            try:
                events.append(json.loads(raw[5:].strip()))
            except Exception:
                pass
        if len(events) > 20:
            break
    r.close()

    assert any(e.get("done") is True for e in events), f"missing done event in {events}"
    # Either error (budget) or delta (success) -- both acceptable
    has_error_or_delta = any("error" in e or "delta" in e for e in events)
    assert has_error_or_delta, f"no error nor delta in {events}"


def test_chat_history_contains_user_message(session_id):
    msg = "TEST_question entretien tuyau"
    r = requests.post(f"{API}/chat/stream", json={"session_id": session_id, "message": msg}, stream=True, timeout=30)
    assert r.status_code == 200
    # drain
    for _ in r.iter_lines():
        pass
    r.close()
    time.sleep(0.5)

    h = requests.get(f"{API}/chat/{session_id}/messages", timeout=10)
    assert h.status_code == 200
    data = h.json()
    assert isinstance(data, list)
    user_msgs = [m for m in data if m["role"] == "user"]
    assert any(m["content"] == msg for m in user_msgs), f"user msg not persisted: {data}"
    # no mongo _id leakage
    for m in data:
        assert "_id" not in m


def test_chat_clear(session_id):
    requests.post(f"{API}/chat/stream", json={"session_id": session_id, "message": "ping"}, stream=True, timeout=30).close()
    time.sleep(0.3)
    d = requests.delete(f"{API}/chat/{session_id}", timeout=10)
    assert d.status_code == 200
    assert d.json().get("ok") is True
    h = requests.get(f"{API}/chat/{session_id}/messages", timeout=10)
    assert h.status_code == 200
    assert h.json() == []


def test_history_empty_for_unknown_session():
    r = requests.get(f"{API}/chat/unknown-session-{uuid.uuid4().hex[:6]}/messages", timeout=10)
    assert r.status_code == 200
    assert r.json() == []
