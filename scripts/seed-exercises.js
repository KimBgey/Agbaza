#!/usr/bin/env node
// Seed AGBAZA exercises into Firestore using the Admin SDK (bypasses security rules).
//
// Setup (one-time):
//   1. Firebase Console → Project Settings → Service accounts → Generate new private key
//   2. Save the JSON file as  scripts/service-account.json
//   3. Run:  npm run seed
//
// The service-account.json is gitignored — never commit it.

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, 'service-account.json')

if (!existsSync(SA_PATH)) {
  console.error(`
❌  Service account key not found at scripts/service-account.json

Steps to fix:
  1. Open https://console.firebase.google.com/project/akwe-95417/settings/serviceaccounts/adminsdk
  2. Click "Generate new private key" → save as  scripts/service-account.json
  3. Re-run  npm run seed
`)
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(SA_PATH, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const EXERCISES = [
  // POITRINE
  { name_fr: "Développé couché barre",      name_en: "Barbell Bench Press",          muscleGroup: "chest",     type: "compound",  equipment: "barbell"    },
  { name_fr: "Développé couché haltères",   name_en: "Dumbbell Bench Press",         muscleGroup: "chest",     type: "compound",  equipment: "dumbbell"   },
  { name_fr: "Développé incliné barre",     name_en: "Incline Barbell Press",        muscleGroup: "chest",     type: "compound",  equipment: "barbell"    },
  { name_fr: "Développé incliné haltères",  name_en: "Incline Dumbbell Press",       muscleGroup: "chest",     type: "compound",  equipment: "dumbbell"   },
  { name_fr: "Dips",                        name_en: "Dips",                         muscleGroup: "chest",     type: "compound",  equipment: "bodyweight" },
  { name_fr: "Écarté haltères",             name_en: "Dumbbell Fly",                 muscleGroup: "chest",     type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Écarté câble",                name_en: "Cable Fly",                    muscleGroup: "chest",     type: "isolation", equipment: "cable"      },
  { name_fr: "Pec Deck",                    name_en: "Pec Deck Machine",             muscleGroup: "chest",     type: "isolation", equipment: "machine"    },

  // DOS
  { name_fr: "Tractions prise large",        name_en: "Wide Grip Pull-Up",            muscleGroup: "back",      type: "compound",  equipment: "bodyweight" },
  { name_fr: "Tractions prise neutre",       name_en: "Neutral Grip Pull-Up",         muscleGroup: "back",      type: "compound",  equipment: "bodyweight" },
  { name_fr: "Rowing barre",                 name_en: "Barbell Row",                  muscleGroup: "back",      type: "compound",  equipment: "barbell"    },
  { name_fr: "Rowing haltère une main",      name_en: "Single Arm Dumbbell Row",      muscleGroup: "back",      type: "compound",  equipment: "dumbbell"   },
  { name_fr: "Tirage vertical poulie",       name_en: "Lat Pulldown",                 muscleGroup: "back",      type: "compound",  equipment: "cable"      },
  { name_fr: "Tirage câble assis",           name_en: "Seated Cable Row",             muscleGroup: "back",      type: "isolation", equipment: "cable"      },
  { name_fr: "Pullover haltères",            name_en: "Dumbbell Pullover",            muscleGroup: "back",      type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Face Pull câble",              name_en: "Cable Face Pull",              muscleGroup: "back",      type: "isolation", equipment: "cable"      },

  // ÉPAULES
  { name_fr: "Développé militaire barre",    name_en: "Barbell Overhead Press",       muscleGroup: "shoulders", type: "compound",  equipment: "barbell"    },
  { name_fr: "Développé militaire haltères", name_en: "Dumbbell Overhead Press",      muscleGroup: "shoulders", type: "compound",  equipment: "dumbbell"   },
  { name_fr: "Arnold Press",                 name_en: "Arnold Press",                 muscleGroup: "shoulders", type: "compound",  equipment: "dumbbell"   },
  { name_fr: "Élévations latérales haltères",name_en: "Dumbbell Lateral Raise",       muscleGroup: "shoulders", type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Élévations latérales câble",   name_en: "Cable Lateral Raise",          muscleGroup: "shoulders", type: "isolation", equipment: "cable"      },
  { name_fr: "Oiseau haltères",              name_en: "Rear Delt Fly",                muscleGroup: "shoulders", type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Élévations frontales",         name_en: "Front Raise",                  muscleGroup: "shoulders", type: "isolation", equipment: "dumbbell"   },

  // JAMBES
  { name_fr: "Squat barre",                  name_en: "Barbell Back Squat",           muscleGroup: "legs",      type: "compound",  equipment: "barbell"    },
  { name_fr: "Goblet Squat",                 name_en: "Goblet Squat",                 muscleGroup: "legs",      type: "compound",  equipment: "dumbbell"   },
  { name_fr: "Fentes",                       name_en: "Lunges",                       muscleGroup: "legs",      type: "compound",  equipment: "bodyweight" },
  { name_fr: "Presse à cuisses",             name_en: "Leg Press",                    muscleGroup: "legs",      type: "compound",  equipment: "machine"    },
  { name_fr: "Soulevé de terre roumain",     name_en: "Romanian Deadlift",            muscleGroup: "legs",      type: "compound",  equipment: "barbell"    },
  { name_fr: "Hip Thrust",                   name_en: "Hip Thrust",                   muscleGroup: "legs",      type: "compound",  equipment: "barbell"    },
  { name_fr: "Leg Extension",                name_en: "Leg Extension",                muscleGroup: "legs",      type: "isolation", equipment: "machine"    },
  { name_fr: "Leg Curl",                     name_en: "Leg Curl",                     muscleGroup: "legs",      type: "isolation", equipment: "machine"    },
  { name_fr: "Mollets debout",               name_en: "Standing Calf Raise",          muscleGroup: "legs",      type: "isolation", equipment: "machine"    },
  { name_fr: "Mollets assis",                name_en: "Seated Calf Raise",            muscleGroup: "legs",      type: "isolation", equipment: "machine"    },

  // BICEPS
  { name_fr: "Curl barre droite",            name_en: "Barbell Bicep Curl",           muscleGroup: "biceps",    type: "compound",  equipment: "barbell"    },
  { name_fr: "Curl barre EZ",                name_en: "EZ Bar Curl",                  muscleGroup: "biceps",    type: "compound",  equipment: "barbell"    },
  { name_fr: "Curl haltères alternés",       name_en: "Alternating Dumbbell Curl",    muscleGroup: "biceps",    type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Curl marteau",                 name_en: "Hammer Curl",                  muscleGroup: "biceps",    type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Curl concentration",           name_en: "Concentration Curl",           muscleGroup: "biceps",    type: "isolation", equipment: "dumbbell"   },
  { name_fr: "Curl pupitre",                 name_en: "Preacher Curl",                muscleGroup: "biceps",    type: "isolation", equipment: "machine"    },

  // TRICEPS
  { name_fr: "Dips triceps",                 name_en: "Tricep Dips",                  muscleGroup: "triceps",   type: "compound",  equipment: "bodyweight" },
  { name_fr: "Développé serré",              name_en: "Close Grip Bench Press",       muscleGroup: "triceps",   type: "compound",  equipment: "barbell"    },
  { name_fr: "Skull Crushers",               name_en: "Skull Crushers",               muscleGroup: "triceps",   type: "compound",  equipment: "barbell"    },
  { name_fr: "Pushdown câble barre",         name_en: "Cable Tricep Pushdown Bar",    muscleGroup: "triceps",   type: "isolation", equipment: "cable"      },
  { name_fr: "Pushdown câble corde",         name_en: "Cable Tricep Pushdown Rope",   muscleGroup: "triceps",   type: "isolation", equipment: "cable"      },
  { name_fr: "Extension overhead câble",     name_en: "Overhead Cable Extension",     muscleGroup: "triceps",   type: "isolation", equipment: "cable"      },

  // CORE
  { name_fr: "Planche",                      name_en: "Plank",                        muscleGroup: "core",      type: "compound",  equipment: "bodyweight" },
  { name_fr: "Dead Bug",                     name_en: "Dead Bug",                     muscleGroup: "core",      type: "compound",  equipment: "bodyweight" },
  { name_fr: "Pallof Press câble",           name_en: "Cable Pallof Press",           muscleGroup: "core",      type: "compound",  equipment: "cable"      },
  { name_fr: "Crunch machine",               name_en: "Machine Crunch",               muscleGroup: "core",      type: "isolation", equipment: "machine"    },
  { name_fr: "Leg Raises suspendu",          name_en: "Hanging Leg Raises",           muscleGroup: "core",      type: "isolation", equipment: "bodyweight" },
  { name_fr: "Russian Twist",                name_en: "Russian Twist",                muscleGroup: "core",      type: "isolation", equipment: "bodyweight" },
  { name_fr: "Gainage latéral",              name_en: "Side Plank",                   muscleGroup: "core",      type: "isolation", equipment: "bodyweight" },

  // CARDIO
  { name_fr: "Vélo stationnaire",            name_en: "Stationary Bike",              muscleGroup: "cardio",    type: "cardio",    equipment: "cardio_machine" },
  { name_fr: "Tapis de course",              name_en: "Treadmill",                    muscleGroup: "cardio",    type: "cardio",    equipment: "cardio_machine" },
  { name_fr: "Rameur",                       name_en: "Rowing Machine",               muscleGroup: "cardio",    type: "cardio",    equipment: "cardio_machine" },
  { name_fr: "Elliptique",                   name_en: "Elliptical",                   muscleGroup: "cardio",    type: "cardio",    equipment: "cardio_machine" },
  { name_fr: "Corde à sauter",               name_en: "Jump Rope",                    muscleGroup: "cardio",    type: "cardio",    equipment: "bodyweight"     },
  { name_fr: "Stair Master",                 name_en: "Stair Master",                 muscleGroup: "cardio",    type: "cardio",    equipment: "cardio_machine" },
  { name_fr: "Course à pied",               name_en: "Running",                      muscleGroup: "cardio",    type: "cardio",    equipment: "bodyweight"     },
]

async function seed() {
  const force = process.argv.includes('--force')
  console.log('🌱 Seeding AGBAZA exercises into Firestore…\n')
  const col = db.collection('agbaza_exercises')

  // Check if already seeded
  const existing = await col.where('isCustom', '==', false).limit(1).get()
  if (!existing.empty) {
    if (!force) {
      console.log(`⚠️  Already seeded. Run  npm run seed -- --force  to wipe and re-seed.`)
      process.exit(0)
    }
    // --force: delete all non-custom exercises first
    console.log('   Deleting existing seed exercises…')
    const all = await col.where('isCustom', '==', false).get()
    let delBatch = db.batch()
    let n = 0
    for (const d of all.docs) {
      delBatch.delete(d.ref)
      n++
      if (n % 500 === 0) { await delBatch.commit(); delBatch = db.batch() }
    }
    if (n % 500 !== 0) await delBatch.commit()
    console.log(`   Deleted ${n} existing exercises.\n`)
  }

  // Batch writes (max 500 per batch)
  let batch = db.batch()
  let count = 0

  for (const ex of EXERCISES) {
    const ref = col.doc()
    batch.set(ref, { ...ex, isCustom: false, createdBy: null })
    count++
    if (count % 50 === 0) {
      await batch.commit()
      batch = db.batch()
    }
    process.stdout.write(`\r   ${count}/${EXERCISES.length} — ${ex.name_fr}                    `)
  }

  if (count % 50 !== 0) await batch.commit()

  console.log(`\n\n✅ Done! Seeded ${count} exercises into agbaza_exercises.`)
  process.exit(0)
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
