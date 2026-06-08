import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrograms } from '../../hooks/useFirestore'
import { IconChevronLeft, IconPlus, IconTrash, IconGrip } from '../../components/Icons'
import ExerciseLibrary from './ExerciseLibrary'

export default function CreateProgram({ existing, onClose, onSaved }) {
  const { t } = useTranslation()
  const { createProgram, updateProgram } = usePrograms()
  const [name, setName] = useState(existing?.name || '')
  const [exercises, setExercises] = useState(
    existing?.exercises?.map(e => ({ ...e, _key: Math.random() })) || []
  )
  const [showLibrary, setShowLibrary] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

  const handleSelectExercise = (ex) => {
    const already = exercises.some(e => e.exerciseId === ex.id)
    if (already) {
      setExercises(prev => prev.filter(e => e.exerciseId !== ex.id))
    } else {
      setExercises(prev => [...prev, {
        _key: Math.random(),
        exerciseId: ex.id,
        exerciseName: ex.name_fr,
        exerciseName_en: ex.name_en,
        muscleGroup: ex.muscleGroup,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90
      }])
    }
  }

  const updateExercise = (key, field, val) => {
    setExercises(prev => prev.map(e => e._key === key ? { ...e, [field]: Number(val) } : e))
  }

  const removeExercise = (key) => {
    setExercises(prev => prev.filter(e => e._key !== key))
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    const data = {
      name: name.trim(),
      exercises: exercises.map(({ _key, ...rest }) => rest)
    }
    try {
      if (existing) {
        await updateProgram(existing.id, data)
      } else {
        await createProgram(data)
      }
      onSaved ? onSaved() : onClose()
    } catch (_) {}
    setSaving(false)
  }

  if (showLibrary) {
    return (
      <div className="screen" style={{ paddingBottom: 0 }}>
        <ExerciseLibrary
          selected={exercises}
          onSelect={handleSelectExercise}
          onClose={() => setShowLibrary(false)}
        />
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="px pt">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn-icon" onClick={onClose} aria-label={t('common.back')}>
            <IconChevronLeft size={18} />
          </button>
          <h1 className="t-title" style={{ fontSize: 20, flex: 1 }}>{t('create_program.title')}</h1>
        </div>

        {/* Program name */}
        <div className="input-group" style={{ marginBottom: 20 }}>
          <label className="input-label">{t('create_program.program_name')}</label>
          <input
            className="input"
            style={{ fontSize: 18, fontWeight: 700 }}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('create_program.program_name_placeholder')}
            autoFocus={!existing}
          />
        </div>

        {/* Exercises */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {exercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ag-muted)', fontSize: 13 }}>
              {t('create_program.no_exercises_added')}
            </div>
          ) : (
            exercises.map((ex, idx) => (
              <ExerciseRow
                key={ex._key}
                ex={ex}
                idx={idx}
                t={t}
                onUpdate={updateExercise}
                onRemove={removeExercise}
              />
            ))
          )}
        </div>

        {/* Add exercise */}
        <button className="btn-secondary" onClick={() => setShowLibrary(true)}>
          <IconPlus size={16} />
          {t('create_program.add_exercise')}
        </button>

        {/* Save */}
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!name.trim() || saving}
          style={{ marginTop: 14 }}
        >
          {saving ? t('common.loading') : t('create_program.save')}
        </button>
      </div>
    </div>
  )
}

function ExerciseRow({ ex, idx, t, onUpdate, onRemove }) {
  return (
    <div className="card" style={{ gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <IconGrip size={16} color="var(--ag-muted)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{ex.exerciseName}</div>
          {ex.muscleGroup && (
            <div style={{ fontSize: 11, color: 'var(--ag-muted)', marginTop: 1 }}>
              {t(`exercise.muscles.${ex.muscleGroup}`)}
            </div>
          )}
        </div>
        <button className="btn-ghost" onClick={() => onRemove(ex._key)} style={{ color: '#E11D48', padding: '4px' }}>
          <IconTrash size={14} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: t('create_program.sets'), field: 'sets', val: ex.sets, min: 1, max: 10 },
          { label: t('create_program.reps_min'), field: 'repsMin', val: ex.repsMin, min: 1, max: 50 },
          { label: t('create_program.reps_max'), field: 'repsMax', val: ex.repsMax, min: 1, max: 50 },
          { label: t('create_program.rest'), field: 'restSeconds', val: ex.restSeconds, min: 0, max: 600 },
        ].map(({ label, field, val, min, max }) => (
          <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center' }}>{label}</div>
            <input
              className="num-input"
              style={{ width: '100%' }}
              type="number"
              value={val}
              min={min}
              max={max}
              onChange={e => onUpdate(ex._key, field, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
