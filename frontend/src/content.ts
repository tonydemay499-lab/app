import type { IconName } from "@/src/ui";

export type Guide = {
  id: string;
  category: "utilisation" | "entretien";
  title: string;
  subtitle: string;
  icon: IconName;
  intro: string;
  steps: { title: string; text: string }[];
  tips?: string[];
  warning?: string;
};

export const GUIDES: Guide[] = [
  {
    id: "ppc",
    category: "utilisation",
    title: "Utiliser ma PPC",
    subtitle: "Démarrer et arrêter l'appareil chaque nuit",
    icon: "moon",
    intro:
      "La PPC envoie un léger flux d'air qui garde vos voies respiratoires ouvertes pendant le sommeil. Pour être efficace, elle doit être utilisée toutes les nuits, au moins 4 heures.",
    steps: [
      { title: "Installer l'appareil", text: "Posez la PPC sur une surface plane et stable, plus bas que votre lit, loin des rideaux. Laissez l'arrière dégagé pour l'entrée d'air." },
      { title: "Brancher le tuyau", text: "Reliez le tuyau à la sortie d'air de l'appareil (ou de l'humidificateur), puis à votre masque." },
      { title: "Mettre le masque", text: "Installez-vous dans le lit, mettez le masque avant d'allumer l'appareil (voir le guide « Mettre mon masque »)." },
      { title: "Allumer", text: "Appuyez sur le bouton de mise en marche. La pression peut monter doucement : respirez calmement par le nez." },
      { title: "Le matin", text: "Retirez le masque, puis éteignez l'appareil. Videz l'humidificateur et laissez sécher le masque." },
    ],
    tips: [
      "Utilisez la PPC aussi pendant la sieste.",
      "Si vous vous levez la nuit, déconnectez le tuyau au niveau du masque puis remettez-le en vous recouchant.",
      "Ne modifiez jamais vous-même les réglages de pression.",
    ],
  },
  {
    id: "vni",
    category: "utilisation",
    title: "Utiliser ma ventilation (VNI)",
    subtitle: "Ventilateur, circuit et alarmes",
    icon: "pulse",
    intro:
      "La ventilation non invasive aide vos muscles respiratoires à faire entrer et sortir l'air. Elle s'utilise selon la durée prescrite par votre médecin (souvent la nuit, parfois aussi le jour).",
    steps: [
      { title: "Vérifier avant usage", text: "Contrôlez que le circuit (tuyau) n'est ni percé ni plié, que le filtre est propre et que l'appareil est bien branché sur le secteur." },
      { title: "Mettre le masque", text: "Installez le masque confortablement, sans trop serrer." },
      { title: "Démarrer la ventilation", text: "Appuyez sur Marche. Laissez la machine rythmer votre respiration, ne luttez pas contre elle." },
      { title: "Comprendre les alarmes", text: "Une alarme signale souvent une fuite, un tuyau débranché ou une coupure de courant. Vérifiez le masque et les branchements." },
      { title: "Après usage", text: "Arrêtez l'appareil, retirez le masque et nettoyez-le selon le guide d'entretien." },
    ],
    tips: [
      "Gardez toujours le numéro d'astreinte Médical o2 près de l'appareil.",
      "Si vous avez une batterie, vérifiez qu'elle est chargée.",
    ],
    warning:
      "Si vous êtes très essoufflé, si une alarme ne s'arrête pas ou si l'appareil tombe en panne alors que vous en dépendez : appelez le 15.",
  },
  {
    id: "masque",
    category: "utilisation",
    title: "Mettre et ajuster mon masque",
    subtitle: "Éviter les fuites et les marques",
    icon: "happy",
    intro:
      "Un masque bien ajusté est la clé du confort. Il doit être étanche sans être serré : un masque trop serré provoque souvent plus de fuites et de rougeurs.",
    steps: [
      { title: "Desserrer le harnais", text: "Avant de mettre le masque, desserrez légèrement les sangles." },
      { title: "Positionner le masque", text: "Placez la bulle (membrane) sur le nez (ou nez et bouche), puis passez le harnais derrière la tête." },
      { title: "Ajuster doucement", text: "Serrez les sangles une par une, de façon égale à gauche et à droite. Vous devez pouvoir glisser un doigt sous les sangles." },
      { title: "Tester allongé", text: "Allumez l'appareil et allongez-vous dans votre position habituelle. Ajustez si l'air fuit vers les yeux." },
    ],
    tips: [
      "Si l'air fuit, décollez légèrement le masque du visage puis reposez-le : la bulle se remet en place.",
      "Une peau propre, sans crème, améliore l'étanchéité.",
      "Les hommes : une barbe peut gêner l'étanchéité, parlez-en à votre technicien.",
    ],
  },
  {
    id: "humidificateur",
    category: "utilisation",
    title: "Utiliser l'humidificateur",
    subtitle: "Contre le nez sec et la bouche sèche",
    icon: "water",
    intro:
      "L'humidificateur chauffe et humidifie l'air pour éviter la sécheresse du nez et de la gorge.",
    steps: [
      { title: "Remplir la cuve", text: "Remplissez avec de l'eau déminéralisée ou distillée, jusqu'au trait maximum. Jamais d'eau chaude." },
      { title: "Remettre la cuve", text: "Replacez la cuve en vous assurant qu'elle est bien enclenchée, appareil éteint." },
      { title: "Régler le confort", text: "Si votre appareil le permet, ajustez le niveau d'humidification indiqué par votre technicien." },
      { title: "Le matin", text: "Videz l'eau restante, rincez et laissez sécher la cuve à l'air libre." },
    ],
    tips: [
      "Gouttes d'eau dans le tuyau ? Baissez un peu l'humidification ou couvrez le tuyau sous la couette.",
      "Ne transportez jamais l'appareil avec de l'eau dans la cuve.",
    ],
  },
  {
    id: "entretien-quotidien",
    category: "entretien",
    title: "Entretien quotidien",
    subtitle: "Chaque matin, 5 minutes",
    icon: "sunny",
    intro: "Un nettoyage simple chaque jour garde votre masque confortable et évite les irritations.",
    steps: [
      { title: "Bulle du masque", text: "Lavez la bulle (membrane en contact avec le visage) à l'eau tiède et au savon doux, ou avec une lingette prévue à cet effet." },
      { title: "Rincer", text: "Rincez abondamment à l'eau claire." },
      { title: "Sécher", text: "Laissez sécher à l'air libre, à l'abri du soleil." },
      { title: "Humidificateur", text: "Videz la cuve, rincez-la et laissez-la sécher ouverte." },
    ],
    warning: "N'utilisez jamais d'alcool, d'eau de Javel, de produits parfumés ni le lave-vaisselle.",
  },
  {
    id: "entretien-hebdo",
    category: "entretien",
    title: "Entretien hebdomadaire",
    subtitle: "Une fois par semaine",
    icon: "calendar",
    intro: "Une fois par semaine, nettoyez l'ensemble du matériel en contact avec l'air que vous respirez.",
    steps: [
      { title: "Démonter le masque", text: "Séparez la bulle, la coque et le harnais." },
      { title: "Laver", text: "Lavez toutes les pièces et le tuyau à l'eau tiède savonneuse (savon de Marseille ou liquide vaisselle)." },
      { title: "Rincer le tuyau", text: "Faites couler de l'eau claire dans le tuyau pour retirer le savon." },
      { title: "Sécher", text: "Suspendez le tuyau en U pour qu'il s'égoutte. Séchez les pièces à l'air libre, à l'abri du soleil." },
      { title: "Détartrer la cuve", text: "Si besoin, laissez tremper la cuve 20 minutes dans un mélange d'eau et de vinaigre blanc (1 volume pour 2), puis rincez bien." },
    ],
  },
  {
    id: "entretien-mensuel",
    category: "entretien",
    title: "Filtres et appareil",
    subtitle: "Chaque mois et selon l'usure",
    icon: "construct",
    intro: "Les filtres protègent l'appareil et vos poumons des poussières.",
    steps: [
      { title: "Vérifier le filtre", text: "Regardez le filtre à l'arrière de l'appareil. S'il est gris ou abîmé, remplacez-le." },
      { title: "Filtre lavable", text: "Certains filtres (mousse) se rincent à l'eau claire. Bien sécher avant de le remettre." },
      { title: "Nettoyer l'appareil", text: "Appareil débranché, essuyez l'extérieur avec un chiffon légèrement humide." },
      { title: "Surveiller l'usure", text: "Une bulle durcie, fissurée ou qui fuit doit être remplacée. Contactez Médical o2 pour vos consommables." },
    ],
  },
  {
    id: "problemes",
    category: "entretien",
    title: "Problèmes fréquents",
    subtitle: "Fuites, sécheresse, rougeurs...",
    icon: "help-buoy",
    intro: "La plupart des petits soucis se règlent facilement. Voici les solutions les plus courantes.",
    steps: [
      { title: "Fuites d'air", text: "Repositionnez le masque, vérifiez la bulle (usée ?) et la taille du masque. Ne serrez pas trop." },
      { title: "Nez ou bouche sèche", text: "Utilisez l'humidificateur. Si vous ouvrez la bouche, une mentonnière ou un masque facial peut aider : parlez-en au technicien." },
      { title: "Rougeurs sur le nez", text: "Desserrez légèrement le harnais et nettoyez la bulle chaque jour." },
      { title: "Ventre gonflé (aérophagie)", text: "Cela peut arriver au début. Si cela persiste, signalez-le à votre médecin ou technicien." },
      { title: "Bruit de l'appareil", text: "Vérifiez que le filtre n'est pas encrassé et que les raccords sont bien emboîtés." },
    ],
    warning: "Si un problème persiste plus de quelques jours, contactez votre technicien Médical o2.",
  },
];

export type MaintenanceTask = { id: string; title: string; freqDays: number; guideId: string; icon: IconName };

export const TASKS: MaintenanceTask[] = [
  { id: "coussin", title: "Nettoyer la bulle (membrane) du masque", freqDays: 1, guideId: "entretien-quotidien", icon: "happy" },
  { id: "cuve", title: "Vider et rincer la cuve", freqDays: 1, guideId: "entretien-quotidien", icon: "water" },
  { id: "masque-complet", title: "Laver masque et harnais", freqDays: 7, guideId: "entretien-hebdo", icon: "sparkles" },
  { id: "tuyau", title: "Laver le tuyau", freqDays: 7, guideId: "entretien-hebdo", icon: "git-commit" },
  { id: "detartrage", title: "Détartrer la cuve (vinaigre blanc)", freqDays: 7, guideId: "entretien-hebdo", icon: "flask" },
  { id: "filtre", title: "Vérifier le filtre de l'appareil", freqDays: 30, guideId: "entretien-mensuel", icon: "funnel" },
];

export const FAQ: { q: string; a: string }[] = [
  { q: "Combien d'heures dois-je utiliser ma PPC ?", a: "Toutes les nuits, et au moins 4 heures par nuit. L'idéal est de la garder pendant tout votre sommeil, sieste comprise." },
  { q: "Je n'arrive pas à m'endormir avec le masque, est-ce normal ?", a: "Oui, au début c'est fréquent. Portez le masque quelques minutes en journée en regardant la télévision pour vous habituer. Cela s'améliore en quelques semaines." },
  { q: "Puis-je partir en voyage avec mon appareil ?", a: "Oui. Emportez-le en bagage cabine dans sa housse, avec votre ordonnance. Prévenez Médical o2 avant un long séjour." },
  { q: "Quelle eau mettre dans l'humidificateur ?", a: "De l'eau déminéralisée ou distillée, à température ambiante. Videz la cuve chaque matin." },
  { q: "Que faire si je suis enrhumé ?", a: "Continuez si possible. Le nez bouché peut gêner : lavez le nez au sérum physiologique, et contactez votre médecin si vous ne supportez pas l'appareil." },
  { q: "Mon masque fuit, que faire ?", a: "Repositionnez-le sans trop serrer et vérifiez l'usure de la bulle. Si les fuites continuent, la taille ou le modèle n'est peut-être plus adapté : contactez votre technicien." },
  { q: "Quand changer mon masque et mes consommables ?", a: "Selon l'usure et votre prescription. Une bulle durcie, jaunie ou qui fuit doit être changée. Votre technicien Médical o2 vous les renouvelle lors des visites." },
  { q: "En cas de coupure de courant ?", a: "Une PPC s'arrête : retirez simplement le masque. Pour une ventilation vitale, utilisez la batterie si vous en avez une et appelez l'astreinte ou le 15 en cas de difficulté respiratoire." },
];

export const SUGGESTED_QUESTIONS = [
  "Comment nettoyer mon masque ?",
  "Mon masque fuit, que faire ?",
  "J'ai le nez sec le matin",
  "Puis-je voyager avec ma PPC ?",
];

export const HERO_IMAGE = require("../assets/images/hero-ppc.jpg");

export const CONTACT_PHONE = "04 28 41 01 10";
export const CONTACT_TEL = "tel:0428410110";
export const MASK_IMAGE =
  "https://images.unsplash.com/photo-1712232413815-faf411f16011?crop=entropy&cs=srgb&fm=jpg&q=80&w=1080";
