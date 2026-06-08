import { useEffect, useRef } from 'react'
import createBodyHighlighter from 'body-highlighter'

const PRIMARY    = '#E8003D'
const SECONDARY  = '#FF6B6B'
const BODY_COLOR = '#2D2D2D'

// ExerciseDB target muscle → body-highlighter muscle string
const MUSCLE_MAP = {
  'pectorals':             'chest',
  'upper back':            'upper-back',
  'lats':                  'upper-back',
  'lower back':            'lower-back',
  'delts':                 'front-deltoids',
  'biceps':                'biceps',
  'triceps':               'triceps',
  'forearms':              'forearm',
  'abs':                   'abs',
  'obliques':              'obliques',
  'quads':                 'quadriceps',
  'hamstrings':            'hamstring',
  'glutes':                'gluteal',
  'calves':                'calves',
  'cardiovascular system': null,
}

// muscleGroup pill → body-highlighter muscle string (fallback when targetMuscle absent)
const MUSCLE_GROUP_FALLBACK = {
  'chest':     'chest',
  'back':      'upper-back',
  'legs':      'quadriceps',
  'shoulders': 'front-deltoids',
  'biceps':    'biceps',
  'triceps':   'triceps',
  'core':      'abs',
}

export default function AnatomyChart({ targetMuscle, secondaryMuscles = [], muscleGroup }) {
  const frontRef = useRef(null)
  const backRef  = useRef(null)
  const secStr   = (secondaryMuscles || []).join(',')

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return

    const map = (name) => name ? (MUSCLE_MAP[name.toLowerCase()] ?? null) : null

    const primary   = map(targetMuscle) ?? (muscleGroup ? MUSCLE_GROUP_FALLBACK[muscleGroup] : null)
    const secondary = (secondaryMuscles || []).map(map).filter(Boolean)

    const data = []
    if (primary)          data.push({ name: 'primary',   muscles: [primary],  frequency: 2 })
    if (secondary.length) data.push({ name: 'secondary', muscles: secondary,  frequency: 1 })

    const cfg = {
      data,
      // index 0 (frequency=1) → secondary, index 1 (frequency=2) → primary
      highlightedColors: [SECONDARY, PRIMARY],
      bodyColor: BODY_COLOR,
      svgStyle:  { height: '210px', width: 'auto', display: 'block' },
    }

    const front = createBodyHighlighter({ container: frontRef.current,  type: 'anterior',  ...cfg })
    const back  = createBodyHighlighter({ container: backRef.current,   type: 'posterior', ...cfg })

    return () => {
      front.destroy()
      back.destroy()
    }
  }, [targetMuscle, secStr, muscleGroup])

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      <div style={{
        background: '#1A1A1A', borderRadius: 12, padding: '8px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontSize: 9, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Avant
        </div>
        <div ref={frontRef} />
      </div>

      <div style={{
        background: '#1A1A1A', borderRadius: 12, padding: '8px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontSize: 9, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Arrière
        </div>
        <div ref={backRef} />
      </div>
    </div>
  )
}
