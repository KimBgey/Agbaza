// node scripts/seed-templates.js
const admin = require('firebase-admin')
const serviceAccount = require('./service-account.json')

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

const TEMPLATES = [
  {
    id: 'seche_4j',
    name: 'Sèche · 4 jours',
    category: 'seche',
    level: 'debutant',
    goal: 'cut',
    daysPerWeek: 4,
    description: 'Programme push/pull optimisé pour perdre du gras en préservant le muscle. Repos 60–90s entre séries.',
    days: [
      {
        dayNumber: 1,
        name: 'J1 — Pecto / Triceps',
        muscleGroups: ['chest', 'triceps'],
        exercises: [
          { exerciseName: 'Développé couché barre',      sets: 4, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Développé incliné haltères',  sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Écarté haltères',             sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Dips triceps',                sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Pushdown câble corde',        sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Skull Crushers',              sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 2,
        name: 'J2 — Dos / Biceps',
        muscleGroups: ['back', 'biceps'],
        exercises: [
          { exerciseName: 'Tractions prise large',       sets: 4, repsMin: 6,  repsMax: 8,  restSeconds: 90 },
          { exerciseName: 'Rowing barre',                sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Tirage vertical poulie',      sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Tirage câble assis',          sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Curl barre EZ',               sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Curl marteau',                sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 3,
        name: 'J3 — Épaules / Core',
        muscleGroups: ['shoulders', 'core'],
        exercises: [
          { exerciseName: 'Développé militaire haltères',sets: 4, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Élévations latérales',        sets: 4, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Oiseau haltères',             sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Face Pull câble',             sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Planche',                     sets: 3, repsMin: 30, repsMax: 45, restSeconds: 60 },
          { exerciseName: 'Leg Raises suspendu',         sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Russian Twist',               sets: 3, repsMin: 20, repsMax: 30, restSeconds: 45 },
        ]
      },
      {
        dayNumber: 4,
        name: 'J4 — Jambes Complet',
        muscleGroups: ['legs'],
        exercises: [
          { exerciseName: 'Squat barre',                    sets: 4, repsMin: 8,  repsMax: 10, restSeconds: 120 },
          { exerciseName: 'Soulevé de terre roumain',       sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Fentes',                         sets: 3, repsMin: 12, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Leg Extension',                  sets: 3, repsMin: 15, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Leg Curl',                       sets: 3, repsMin: 15, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Mollets debout',                 sets: 4, repsMin: 20, repsMax: 20, restSeconds: 45 },
        ]
      },
    ]
  },

  {
    id: 'full_body_3j',
    name: 'Full Body · 3 jours',
    category: 'full_body',
    level: 'debutant',
    goal: 'maintain',
    daysPerWeek: 3,
    description: 'Tout le corps à chaque séance. Idéal pour débuter ou les semaines chargées. Lundi / Mercredi / Vendredi.',
    days: [
      {
        dayNumber: 1,
        name: 'J1 — Full Body A',
        muscleGroups: ['chest', 'back', 'legs', 'shoulders'],
        exercises: [
          { exerciseName: 'Squat barre',                   sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Développé couché barre',        sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Rowing barre',                  sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Développé militaire haltères',  sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Curl barre EZ',                 sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Pushdown câble corde',          sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Planche',                       sets: 3, repsMin: 30, repsMax: 45, restSeconds: 45 },
        ]
      },
      {
        dayNumber: 2,
        name: 'J2 — Full Body B',
        muscleGroups: ['legs', 'back', 'chest', 'core'],
        exercises: [
          { exerciseName: 'Soulevé de terre roumain',      sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Tractions prise neutre',        sets: 3, repsMin: 6,  repsMax: 8,  restSeconds: 90 },
          { exerciseName: 'Développé incliné haltères',   sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Élévations latérales',         sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Curl marteau',                 sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Dips triceps',                 sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 60 },
          { exerciseName: 'Dead Bug',                     sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 45 },
        ]
      },
      {
        dayNumber: 3,
        name: 'J3 — Full Body C',
        muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'core'],
        exercises: [
          { exerciseName: 'Goblet Squat',                 sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Hip Thrust',                   sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Tirage vertical poulie',       sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Écarté câble',                 sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Arnold Press',                 sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Leg Raises suspendu',          sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
          { exerciseName: 'Gainage latéral',              sets: 3, repsMin: 20, repsMax: 30, restSeconds: 45 },
        ]
      },
    ]
  },

  {
    id: 'masse_4j',
    name: 'Prise de masse · 4 jours',
    category: 'masse',
    level: 'intermediaire',
    goal: 'bulk',
    daysPerWeek: 4,
    description: 'Volume élevé, charges lourdes, repos 2 min entre séries. Objectif : construire du muscle.',
    days: [
      {
        dayNumber: 1,
        name: 'J1 — Push A (Pecto focus)',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        exercises: [
          { exerciseName: 'Développé couché barre',       sets: 5, repsMin: 5,  repsMax: 8,  restSeconds: 120 },
          { exerciseName: 'Développé incliné haltères',   sets: 4, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Écarté câble',                 sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Développé militaire haltères', sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Élévations latérales câble',   sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Skull Crushers',               sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Pushdown câble barre',         sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 2,
        name: 'J2 — Pull A (Dos focus)',
        muscleGroups: ['back', 'biceps'],
        exercises: [
          { exerciseName: 'Tractions prise large',        sets: 4, repsMin: 6,  repsMax: 8,  restSeconds: 120 },
          { exerciseName: 'Rowing barre',                 sets: 4, repsMin: 6,  repsMax: 8,  restSeconds: 120 },
          { exerciseName: 'Tirage vertical poulie',       sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Tirage câble assis',           sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Face Pull câble',              sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Curl barre droite',            sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 60 },
          { exerciseName: 'Curl concentration',           sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 3,
        name: 'J3 — Push B (Épaules focus)',
        muscleGroups: ['shoulders', 'chest', 'triceps'],
        exercises: [
          { exerciseName: 'Développé militaire barre',    sets: 5, repsMin: 5,  repsMax: 8,  restSeconds: 120 },
          { exerciseName: 'Arnold Press',                 sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Élévations latérales',        sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Oiseau haltères',              sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Développé couché haltères',   sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Extension overhead câble',    sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Dips triceps',                 sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 4,
        name: 'J4 — Jambes + Biceps',
        muscleGroups: ['legs', 'biceps'],
        exercises: [
          { exerciseName: 'Squat barre',                  sets: 5, repsMin: 5,  repsMax: 8,  restSeconds: 120 },
          { exerciseName: 'Presse à cuisses',             sets: 4, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Soulevé de terre roumain',     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Leg Extension',                sets: 3, repsMin: 15, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Leg Curl',                     sets: 3, repsMin: 15, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Mollets assis',                sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Curl pupitre',                 sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
        ]
      },
    ]
  },

  {
    id: 'upper_lower_4j',
    name: 'Upper / Lower · 4 jours',
    category: 'upper_lower',
    level: 'intermediaire',
    goal: 'maintain',
    daysPerWeek: 4,
    description: 'Haut du corps ×2 / Bas du corps ×2 par semaine. Excellent pour la force et le maintien musculaire.',
    days: [
      {
        dayNumber: 1,
        name: 'J1 — Upper A (Force)',
        muscleGroups: ['chest', 'back', 'shoulders'],
        exercises: [
          { exerciseName: 'Développé couché barre',       sets: 4, repsMin: 5,  repsMax: 6,  restSeconds: 120 },
          { exerciseName: 'Rowing barre',                 sets: 4, repsMin: 5,  repsMax: 6,  restSeconds: 120 },
          { exerciseName: 'Développé militaire barre',    sets: 3, repsMin: 6,  repsMax: 8,  restSeconds: 90 },
          { exerciseName: 'Tractions prise large',        sets: 3, repsMin: 6,  repsMax: 8,  restSeconds: 90 },
          { exerciseName: 'Curl barre droite',            sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 60 },
          { exerciseName: 'Skull Crushers',               sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 2,
        name: 'J2 — Lower A (Force)',
        muscleGroups: ['legs'],
        exercises: [
          { exerciseName: 'Squat barre',                  sets: 4, repsMin: 5,  repsMax: 6,  restSeconds: 120 },
          { exerciseName: 'Soulevé de terre roumain',     sets: 4, repsMin: 5,  repsMax: 6,  restSeconds: 120 },
          { exerciseName: 'Fentes',                       sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 90 },
          { exerciseName: 'Leg Curl',                     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
          { exerciseName: 'Mollets debout',               sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 3,
        name: 'J3 — Upper B (Volume)',
        muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        exercises: [
          { exerciseName: 'Développé incliné haltères',   sets: 4, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Tirage vertical poulie',       sets: 4, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Élévations latérales',        sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Tirage câble assis',           sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Écarté câble',                 sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Curl haltères alternés',       sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
          { exerciseName: 'Pushdown câble corde',         sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
        ]
      },
      {
        dayNumber: 4,
        name: 'J4 — Lower B (Volume)',
        muscleGroups: ['legs', 'core'],
        exercises: [
          { exerciseName: 'Hip Thrust',                   sets: 4, repsMin: 10, repsMax: 12, restSeconds: 90 },
          { exerciseName: 'Presse à cuisses',             sets: 4, repsMin: 12, repsMax: 15, restSeconds: 90 },
          { exerciseName: 'Leg Extension',                sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Leg Curl',                     sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Mollets assis',                sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
          { exerciseName: 'Planche',                      sets: 3, repsMin: 30, repsMax: 60, restSeconds: 45 },
          { exerciseName: 'Dead Bug',                     sets: 3, repsMin: 8,  repsMax: 10, restSeconds: 45 },
        ]
      },
    ]
  },
]

async function seed() {
  const col = db.collection('agbaza_templates')
  for (const tpl of TEMPLATES) {
    const { id, ...data } = tpl
    await col.doc(id).set(data)
    console.log(`✓ ${tpl.name} (${tpl.days.length} jours)`)
  }
  console.log('\nDone — agbaza_templates seeded.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
