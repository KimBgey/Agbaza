// Programme Sèche 4 jours — templates pré-remplis
// exerciseId sera résolu dynamiquement à l'import via fuzzy-match sur le nom

export const PROGRAM_TEMPLATES = [
  {
    id: 'seche_j1',
    name: 'Sèche · J1 — Pecto / Triceps',
    tag: 'Sèche & Définition',
    exercises: [
      { exerciseName: 'Développé couché barre',        exerciseName_en: 'Barbell Bench Press',           muscleGroup: 'chest',    sets: 4, repsMin: 8,  repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Développé incliné haltères',    exerciseName_en: 'Incline Dumbbell Press',         muscleGroup: 'chest',    sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Écarté haltères à plat',        exerciseName_en: 'Dumbbell Fly',                  muscleGroup: 'chest',    sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exerciseName: 'Écarté haltères incliné',       exerciseName_en: 'Incline Dumbbell Fly',          muscleGroup: 'chest',    sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exerciseName: 'Extension triceps poulie haute',exerciseName_en: 'Triceps Pushdown',              muscleGroup: 'triceps',  sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exerciseName: 'Dips entre bancs',              exerciseName_en: 'Bench Dips',                    muscleGroup: 'triceps',  sets: 3, repsMin: 8,  repsMax: 15, restSeconds: 60 },
    ]
  },
  {
    id: 'seche_j2',
    name: 'Sèche · J2 — Dos / Biceps',
    tag: 'Sèche & Définition',
    exercises: [
      { exerciseName: 'Tirage poulie haute',           exerciseName_en: 'Lat Pulldown',                  muscleGroup: 'back',     sets: 4, repsMin: 8,  repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Rowing barre',                  exerciseName_en: 'Barbell Row',                   muscleGroup: 'back',     sets: 3, repsMin: 8,  repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Rowing haltère unilatéral',     exerciseName_en: 'Dumbbell Row',                  muscleGroup: 'back',     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exerciseName: 'Tirage horizontal machine',     exerciseName_en: 'Seated Cable Row',              muscleGroup: 'back',     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exerciseName: 'Curl haltères alterné',         exerciseName_en: 'Alternating Dumbbell Curl',     muscleGroup: 'biceps',   sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exerciseName: 'Curl barre droite',             exerciseName_en: 'Barbell Curl',                  muscleGroup: 'biceps',   sets: 3, repsMin: 8,  repsMax: 12, restSeconds: 60 },
    ]
  },
  {
    id: 'seche_j4',
    name: 'Sèche · J4 — Épaules / Abdos',
    tag: 'Sèche & Définition',
    exercises: [
      { exerciseName: 'Développé militaire haltères',  exerciseName_en: 'Dumbbell Shoulder Press',       muscleGroup: 'shoulders', sets: 4, repsMin: 8,  repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Élévations latérales',          exerciseName_en: 'Lateral Raise',                 muscleGroup: 'shoulders', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exerciseName: 'Élévations frontales',          exerciseName_en: 'Front Raise',                   muscleGroup: 'shoulders', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exerciseName: 'Élévations arrière (oiseau)',   exerciseName_en: 'Reverse Fly',                   muscleGroup: 'shoulders', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exerciseName: 'Crunch au sol',                 exerciseName_en: 'Crunch',                        muscleGroup: 'core',     sets: 3, repsMin: 15, repsMax: 20, restSeconds: 45 },
      { exerciseName: 'Planche',                       exerciseName_en: 'Plank',                         muscleGroup: 'core',     sets: 3, repsMin: 30, repsMax: 45, restSeconds: 45 },
      { exerciseName: 'Relevé de jambes suspendu',     exerciseName_en: 'Hanging Leg Raise',             muscleGroup: 'core',     sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
    ]
  },
  {
    id: 'seche_j5',
    name: 'Sèche · J5 — Jambes Complet',
    tag: 'Sèche & Définition',
    exercises: [
      { exerciseName: 'Squat barre',                   exerciseName_en: 'Barbell Squat',                 muscleGroup: 'legs',     sets: 4, repsMin: 8,  repsMax: 12, restSeconds: 90 },
      { exerciseName: 'Goblet Squat haltère',          exerciseName_en: 'Goblet Squat',                  muscleGroup: 'legs',     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Fentes haltères',               exerciseName_en: 'Dumbbell Lunges',               muscleGroup: 'legs',     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Bulgarian Split Squat',         exerciseName_en: 'Bulgarian Split Squat',         muscleGroup: 'legs',     sets: 3, repsMin: 8,  repsMax: 12, restSeconds: 75 },
      { exerciseName: 'Soulevé de terre jambes tendues',exerciseName_en: 'Romanian Deadlift',            muscleGroup: 'legs',     sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exerciseName: 'Mollets debout haltères',       exerciseName_en: 'Standing Calf Raise',           muscleGroup: 'legs',     sets: 4, repsMin: 15, repsMax: 20, restSeconds: 45 },
    ]
  },
]
