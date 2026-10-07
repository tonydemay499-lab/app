export type Option = { label: string; score: number | null };
export type Question = { id: string; section: "ressenti" | "epworth"; text: string; options: Option[] };

const scale = (labels: string[]): Option[] => labels.map((label, i) => ({ label, score: labels.length - 1 - i }));
const EPWORTH_OPTIONS: Option[] = [
  { label: "Jamais", score: 0 },
  { label: "Faible risque", score: 1 },
  { label: "Risque moyen", score: 2 },
  { label: "Risque élevé", score: 3 },
];

export const ISSUE_QUESTION_ID = "gene";

export const QUESTIONS: Question[] = [
  { id: "sommeil", section: "ressenti", text: "Depuis le début du traitement, comment dormez-vous ?", options: scale(["Beaucoup mieux", "Un peu mieux", "Pareil", "Moins bien"]) },
  { id: "journee", section: "ressenti", text: "Comment vous sentez-vous dans la journée ?", options: scale(["En pleine forme", "Plutôt en forme", "Un peu fatigué", "Très fatigué"]) },
  { id: "masque", section: "ressenti", text: "Votre masque est-il confortable ?", options: scale(["Très confortable", "Plutôt confortable", "Peu confortable", "Pas du tout"]) },
  {
    id: ISSUE_QUESTION_ID,
    section: "ressenti",
    text: "Quelle gêne avez-vous eue cette semaine ?",
    options: [
      { label: "Aucune gêne", score: 3 },
      { label: "Bouche ou nez sec", score: 1 },
      { label: "Fuites d'air", score: 1 },
      { label: "Rougeurs ou douleurs", score: 1 },
    ],
  },
  {
    id: "ronflement",
    section: "ressenti",
    text: "Votre entourage remarque-t-il moins de ronflements ?",
    options: [
      { label: "Oui, nettement", score: 3 },
      { label: "Un peu", score: 2 },
      { label: "Non", score: 0 },
      { label: "Je dors seul(e)", score: null },
    ],
  },
  { id: "satisfaction", section: "ressenti", text: "Êtes-vous satisfait de votre traitement ?", options: scale(["Très satisfait", "Plutôt satisfait", "Peu satisfait", "Pas satisfait"]) },
  ...[
    "Assis en train de lire",
    "En regardant la télévision",
    "Assis, inactif, dans un lieu public (cinéma, réunion)",
    "Passager d'une voiture pendant une heure sans arrêt",
    "Allongé l'après-midi pour vous reposer",
    "Assis en parlant avec quelqu'un",
    "Assis calmement après un repas sans alcool",
    "Au volant, arrêté quelques minutes dans un embouteillage",
  ].map((text, i) => ({ id: `epworth-${i + 1}`, section: "epworth" as const, text, options: EPWORTH_OPTIONS })),
];

export const SURVEY_INTERVAL_DAYS = 7;

export function computeScores(answers: Record<string, number>) {
  let got = 0;
  let max = 0;
  let epworth = 0;
  for (const q of QUESTIONS) {
    const opt = q.options[answers[q.id]];
    if (!opt || opt.score === null) continue;
    if (q.section === "epworth") epworth += opt.score;
    else {
      got += opt.score;
      max += 3;
    }
  }
  const issueOpt = QUESTIONS.find((q) => q.id === ISSUE_QUESTION_ID)!.options[answers[ISSUE_QUESTION_ID]];
  return {
    wellbeing: max ? Math.round((got / max) * 100) : 0,
    epworth,
    issue: issueOpt && issueOpt.score !== 3 ? issueOpt.label : null,
  };
}

export function epworthLabel(score: number) {
  if (score <= 10) return { label: "Somnolence normale", tone: "brand" as const };
  if (score <= 15) return { label: "Somnolence modérée", tone: "warning" as const };
  return { label: "Somnolence importante", tone: "error" as const };
}
