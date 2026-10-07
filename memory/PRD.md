# Médical o2 – App éducation patients PPC & ventilation

## Problème initial
Créer une application mobile pour former les patients à l'utilisation et l'entretien du matériel PPC et ventilation (société Médical o2, tél. 04 28 41 01 10).

## Choix utilisateur
Guides + entretien + rappels + FAQ + suivi quotidien + assistant IA (Claude Sonnet 4.5) ; pas de compte (données locales) ; PPC, VNI, masques, humidificateur ; style médical rassurant, gros textes seniors. Terminologie : « bulle (membrane) » du masque, pas « coussin ».

## Architecture
- Expo Router : (tabs) Accueil / Guides / Suivi / Assistant ; écrans guide/[id], entretien, faq, chat
- Données locales (storage) : suivi des nuits, dates d'entretien
- Backend FastAPI : /api/chat/stream (SSE, Claude claude-sonnet-4-5-20250929), /api/chat/{sid}/messages, DELETE /api/chat/{sid} ; historique dans MongoDB

## Fait (oct. 2026)
- MVP complet, testé (iteration_1 : tout OK)
- Photo d'accueil = appareil PPC + masque (asset local), carte « Appeler le 04 28 41 01 10 »
- « Coussin » remplacé par « bulle (membrane) » partout

## Points ouverts
- Notifications locales à valider sur build natif (pas testables sur web)

- Rappels d'entretien : notifications locales chaque matin à 9 h (expo-notifications), carte d'activation dans Entretien
- Nom de l'app : « Médical o2 Provence »
- Photo d'accueil générée par IA (technicien + patient 30-50 ans, PPC sur la table)
- Assistant Claude opérationnel (solde rechargé), réponses en texte brut

- Questionnaire hebdomadaire de ressenti (6 questions + Epworth), données locales, rappel notification à 10 h
- Bilan des 3 mois (/bilan) : utilisation, évolution du ressenti, Epworth, gênes, partage texte

- Eau de l'humidificateur : déminéralisée, bouteille ou robinet (au choix)
- Rappels personnalisables : heure (6 h–22 h, pas de 30 min) et type (entretien / questionnaire)
- Bilan : 1er à 3 mois après la date de début du traitement (modifiable), puis tous les 6 mois, avec choix de période

## Backlog
- P1 : demande de consommables (bulle, filtres) envoyée à Médical o2
- P2 : export PDF du suivi pour le médecin, vidéos tutoriels
