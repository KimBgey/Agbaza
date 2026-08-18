// Copy & photo assets for the AGBAZA landing page.
// Photos live in /public/img/ (1.jpg – 6.jpg), supplied by the client.

export const IMG = {
  athlete: '/img/1.jpg',        // athlète dos musclé, lumière dramatique
  orangeBlur: '/img/2.jpg',     // gradient orange chaud flou (texture)
  gymDark: '/img/3.jpg',        // salle sombre, lumière rasante
  runner: '/img/4.jpg',         // runner motion blur
  groupTraining: '/img/5.jpg',  // salle group training, ambiance chaude
  orangeVivid: '/img/6.jpg',    // gradient orange vif (texture)
  mockup: '/img/mockup.png',    // mockup iPhone incliné — écran Home de l'app
}

export const PROBLEM_ROW_1 = [
  'Tu arrives en salle. Tu ne sais pas par où commencer.',
  'Tu fais toujours les mêmes machines.',
  'Tu cherches sur TikTok entre chaque série.',
  'Tu ne sais pas si tu progresses vraiment.',
  'Tu paies 15$/mois pour débloquer les vraies fonctions.',
]

export const PROBLEM_ROW_2 = [
  'Tu quittes la salle sans plan.',
  'Tu improvises à chaque séance.',
  'Tu oublies tes charges de la semaine dernière.',
  'Tu ne sais pas quels muscles tu travailles.',
  'Tu perds ta concentration entre les séries.',
]

export const SOLUTION_STATS = [
  { value: '50+', label: 'exercices' },
  { value: '4', label: 'templates' },
  { value: '100%', label: 'gratuit' },
]

export const FEATURES = [
  {
    n: '01',
    bg: 'bg',
    imageSide: 'right',
    fade: 'left',
    image: IMG.gymDark,
    title: 'Chaque exercice expliqué.',
    text: '50+ mouvements avec vidéo YouTube intégrée et schéma anatomique. Tu sais exactement quoi faire et comment.',
  },
  {
    n: '02',
    bg: 'surface',
    imageSide: 'left',
    fade: 'right',
    image: IMG.runner,
    title: 'Séance guidée. Série par série.',
    text: 'Valide chaque série. Le timer de repos se déclenche automatiquement. Tu restes concentré sur l’effort.',
  },
  {
    n: '03',
    bg: 'bg',
    imageSide: 'right',
    fade: 'left',
    image: IMG.groupTraining,
    title: 'Ton programme, ton rythme.',
    text: 'Crée ton schéma ou choisis un template (Sèche, Full Body, Prise de masse, Upper/Lower). L’app s’adapte.',
  },
  {
    n: '04',
    bg: 'surface',
    imageSide: 'left',
    fade: 'right',
    image: IMG.gymDark,
    tint: true,
    title: 'La preuve que tu avances.',
    text: 'Tes charges, semaine après semaine. Le graphique ne ment pas — tu vois ta progression en temps réel.',
  },
]

export const PWA_STEPS = [
  'Ouvre AGBAZA dans Safari ou Chrome',
  'Appuie sur "Partager" (iOS) ou le menu ⋮ (Android)',
  '"Ajouter à l’écran d’accueil" — c’est fait',
]

export const COMPARISON_ROWS = [
  { label: 'Bibliothèque d’exercices', us: '50+ exercices', them: 'Abonnement requis' },
  { label: 'Vidéos de démonstration', us: 'YouTube intégré', them: 'Abonnement requis' },
  { label: 'Suivi séance live', us: 'Inclus', them: 'Abonnement requis' },
  { label: 'Timer de repos auto', us: 'Inclus', them: 'Abonnement requis' },
  { label: 'Templates de programmes', us: '4 inclus', them: 'Abonnement requis' },
  { label: 'Schéma anatomique', us: 'Inclus', them: 'Abonnement requis' },
  { label: 'Prix', us: 'Gratuit', them: '10–20$/mois' },
]

export const TESTIMONIALS = [
  { quote: 'Le timer de repos automatique a changé ma séance. Je ne regarde plus mon téléphone entre les séries.', name: 'Aïcha', goal: 'Prise de masse' },
  { quote: 'Enfin une app qui m’explique comment faire chaque exercice sans me faire payer pour ça.', name: 'Junior', goal: 'Sèche' },
  { quote: 'J’arrivais en salle sans plan. Maintenant j’ai un programme complet qui tient dans ma poche.', name: 'Marlène', goal: 'Full Body' },
  { quote: 'La vidéo intégrée pour chaque exercice c’est exactement ce qu’il me fallait. Fini TikTok entre les séries.', name: 'Kofi', goal: 'Débutant' },
  { quote: 'Le suivi de progression m’a motivé à continuer. Je vois vraiment que je m’améliore semaine après semaine.', name: 'Rania', goal: 'Upper/Lower' },
]
