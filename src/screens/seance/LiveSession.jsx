import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useExercises } from '../../hooks/useFirestore'
import { useRestTimer, useStopwatch } from '../../hooks/useTimer'
import {
  IconCheck, IconSkip, IconX, IconChevronLeft, IconPlus, IconClock
} from '../../components/Icons'
import EndScreen from './EndScreen'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#777'
}

export default function LiveSession({ program, onFinish, onCancel }) {
  const { t, i18n } = useTranslation()
  const { userProfile } = useAuth()
  const { exercises: exerciseDb } = useExercises()
  const lang = i18n.language || 'fr'

  const stopwatch = useStopwatch()
  const restTimer = useRestTimer()

  // Build exercise list with live sets
  const [exerciseList, setExerciseList] = useState(() => {
    if (!program?.exercises?.length) return []
    return program.exercises.map(ex => ({
      ...ex,
      sets: Array(ex.sets || 3).fill(null).map(() => ({
        weight: '',
        reps: ex.repsMax || 10,
        completed: false
      }))
    }))
  })

  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [currentSetIdx, setCurrentSetIdx] = useState(0)
  const [showEnd, setShowEnd] = useState(false)
  const [freeExercises, setFreeExercises] = useState([])

  // Start stopwatch on mount
  useEffect(() => { stopwatch.start() }, [])

  const currentEx = exerciseList[currentExIdx]
  const totalExercises = exerciseList.length

  const getExName = useCallback((ex) => {
    if (lang === 'fr') return ex.exerciseName || ex.name_fr || ex.exerciseName_en || ''
    return ex.exerciseName_en || ex.name_en || ex.exerciseName || ''
  }, [lang])

  // Update a set value
  const updateSet = (exIdx, setIdx, field, val) => {
    setExerciseList(prev => {
      const next = [...prev]
      next[exIdx] = {
        ...next[exIdx],
        sets: next[exIdx].sets.map((s, i) => i === setIdx ? { ...s, [field]: val } : s)
      }
      return next
    })
  }

  // Validate set
  const validateSet = () => {
    const ex = exerciseList[currentExIdx]
    if (!ex) return
    setExerciseList(prev => {
      const next = [...prev]
      next[currentExIdx] = {
        ...next[currentExIdx],
        sets: next[currentExIdx].sets.map((s, i) =>
          i === currentSetIdx ? { ...s, completed: true } : s
        )
      }
      return next
    })

    // Start rest timer
    const restSec = ex.restSeconds || 90
    restTimer.start(restSec)

    // Advance
    const nextSet = currentSetIdx + 1
    if (nextSet < ex.sets.length) {
      setCurrentSetIdx(nextSet)
    } else {
      // Move to next exercise after rest
      const nextEx = currentExIdx + 1
      if (nextEx < exerciseList.length) {
        setCurrentExIdx(nextEx)
        setCurrentSetIdx(0)
      } else {
        // All done — show end
        setTimeout(() => setShowEnd(true), restSec * 1000 + 500)
      }
    }
  }

  const skipExercise = () => {
    restTimer.stop()
    const nextEx = currentExIdx + 1
    if (nextEx < exerciseList.length) {
      setCurrentExIdx(nextEx)
      setCurrentSetIdx(0)
    } else {
      setShowEnd(true)
    }
  }

  const handleFinish = async () => {
    stopwatch.stop()
    const completedExercises = exerciseList.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets
    }))
    const totalVolume = exerciseList.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completed).reduce((s2, set) => s2 + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0
    )
    await onFinish({
      programId: program?.id || null,
      programName: program?.name || 'Libre',
      durationMinutes: Math.round(stopwatch.elapsed / 60),
      totalVolume: Math.round(totalVolume),
      finishedAt: new Date().toISOString(),
      exercises: completedExercises
    })
  }

  // Bonus exercises (muscles not trained today)
  const trainedMuscles = new Set(exerciseList.map(e => e.muscleGroup).filter(Boolean))
  const bonusExercises = useMemo(() =>
    exerciseDb.filter(e => !trainedMuscles.has(e.muscleGroup)).slice(0, 6),
  [exerciseDb, trainedMuscles])

  const completedSets = exerciseList.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)
  const totalSets = exerciseList.reduce((sum, ex) => sum + ex.sets.length, 0)
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  if (showEnd) {
    const totalVolume = exerciseList.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completed).reduce((s2, set) => s2 + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0
    )
    return (
      <EndScreen
        exercisesDone={exerciseList.filter(ex => ex.sets.some(s => s.completed)).length}
        totalVolume={Math.round(totalVolume)}
        durationMinutes={Math.round(stopwatch.elapsed / 60)}
        weightUnit={userProfile?.weightUnit || 'kg'}
        onFinish={handleFinish}
      />
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--ag-bg)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      maxWidth: 430, margin: '0 auto'
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--ag-border)'
      }}>
        <button className="btn-icon" onClick={() => { if (confirm('Abandonner la séance ?')) { stopwatch.stop(); onCancel() } }} aria-label={t('common.back')}>
          <IconChevronLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{program?.name || t('seance.free_training')}</div>
          <div style={{ fontSize: 11, color: 'var(--ag-muted)' }}>
            {t('seance.exercise')} {currentExIdx + 1}/{totalExercises} · {stopwatch.formatted}
          </div>
        </div>
        <button
          className="btn-ghost"
          onClick={() => setShowEnd(true)}
          style={{ color: 'var(--ag-orange)', fontWeight: 700 }}
        >
          {t('seance.finish_session')}
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track" style={{ margin: '0 16px', borderRadius: 0 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div style={{ textAlign: 'right', padding: '4px 16px 0', fontSize: 11, color: 'var(--ag-orange)', fontWeight: 800, fontStyle: 'italic' }}>
        {Math.round(progress)}%
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '16px 16px 24px' }}>
        {/* Rest timer */}
        {restTimer.running && (
          <div className="timer-bloc" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--ag-muted)', marginBottom: 4 }}>{t('seance.rest')}</div>
            <div style={{ fontSize: 48, fontWeight: 800, fontStyle: 'italic', color: 'var(--ag-orange)', letterSpacing: '-2px', lineHeight: 1 }}>
              {restTimer.seconds}s
            </div>
            <div className="progress-bar-track" style={{ marginTop: 10 }}>
              <div className="progress-bar-fill" style={{ width: `${restTimer.progress}%` }} />
            </div>
            <button className="btn-ghost" onClick={restTimer.stop} style={{ marginTop: 10, width: '100%', justifyContent: 'center', color: 'var(--ag-orange)' }}>
              {t('seance.rest_over')}
            </button>
          </div>
        )}

        {/* Current exercise */}
        {currentEx ? (
          <div>
            <div className="card card-active" style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              {/* BG image */}
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
                backgroundImage: `url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60)`,
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15
              }} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, transparent, var(--ag-orange-soft) 100%)' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 11, color: muscleColor(currentEx.muscleGroup), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  {t(`exercise.muscles.${currentEx.muscleGroup}`)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>{getExName(currentEx)}</div>
                <div style={{ fontSize: 12, color: 'var(--ag-muted)', marginTop: 4 }}>
                  {currentEx.repsMin}–{currentEx.repsMax} reps · repos {currentEx.restSeconds}s
                </div>
              </div>
            </div>

            {/* Sets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {currentEx.sets.map((set, si) => (
                <SetRow
                  key={si}
                  set={set}
                  setIdx={si}
                  exIdx={currentExIdx}
                  isActive={si === currentSetIdx && !set.completed}
                  t={t}
                  unit={userProfile?.weightUnit || 'kg'}
                  onChange={updateSet}
                />
              ))}
            </div>

            {/* Validate CTA */}
            {!currentEx.sets[currentSetIdx]?.completed && (
              <button className="btn-primary" onClick={validateSet} style={{ marginBottom: 10 }}>
                <IconCheck size={16} />
                {t('seance.validate_set')} — {t('seance.set')} {currentSetIdx + 1}
              </button>
            )}

            <button className="btn-secondary" onClick={skipExercise}>
              <IconSkip size={16} />
              {t('seance.skip')}
            </button>
          </div>
        ) : (
          /* Free training — just show bonus exercises to add */
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ag-muted)' }}>
            <div style={{ fontSize: 14 }}>Ajoute des exercices depuis la bibliothèque</div>
          </div>
        )}

        {/* Upcoming exercises */}
        {exerciseList.length > 0 && currentExIdx < exerciseList.length - 1 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Suivants
            </div>
            {exerciseList.slice(currentExIdx + 1, currentExIdx + 4).map((ex, i) => (
              <div key={i} className="set-row" style={{ marginBottom: 8, opacity: 0.6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: muscleColor(ex.muscleGroup), flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{getExName(ex)}</div>
                <div style={{ fontSize: 11, color: 'var(--ag-muted)' }}>{ex.sets?.length}×{ex.repsMin}–{ex.repsMax}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bonus section */}
        {bonusExercises.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t('seance.bonus_title')}</div>
            <div style={{ fontSize: 12, color: 'var(--ag-muted)', marginBottom: 12 }}>{t('seance.bonus_subtitle')}</div>
            <div className="scroll-row">
              {bonusExercises.map(ex => (
                <div key={ex.id} className="card" style={{ minWidth: 150, flexShrink: 0, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: muscleColor(ex.muscleGroup), fontWeight: 700 }}>
                    {t(`exercise.muscles.${ex.muscleGroup}`)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                    {lang === 'fr' ? ex.name_fr : ex.name_en}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SetRow({ set, setIdx, exIdx, isActive, t, unit, onChange }) {
  return (
    <div className={`set-row ${set.completed ? 'done' : ''}`} style={{ borderColor: isActive ? 'var(--ag-orange)' : undefined }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: set.completed ? 'var(--ag-orange)' : (isActive ? 'var(--ag-orange-soft)' : 'transparent'),
        border: `2px solid ${set.completed ? 'var(--ag-orange)' : (isActive ? 'var(--ag-orange)' : 'var(--ag-border)')}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms'
      }}>
        {set.completed && <IconCheck size={12} color="#fff" />}
        {!set.completed && <span style={{ fontSize: 10, fontWeight: 800, color: isActive ? 'var(--ag-orange)' : 'var(--ag-muted)' }}>{setIdx + 1}</span>}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{unit}</span>
          <input
            className="num-input"
            type="number"
            value={set.weight}
            placeholder="0"
            min="0"
            step="0.5"
            disabled={set.completed}
            onChange={e => onChange(exIdx, setIdx, 'weight', e.target.value)}
            style={{ color: set.completed ? 'var(--ag-orange)' : undefined }}
          />
        </div>
        <span style={{ color: 'var(--ag-muted)', fontSize: 14 }}>×</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase' }}>reps</span>
          <input
            className="num-input"
            type="number"
            value={set.reps}
            placeholder="10"
            min="1"
            disabled={set.completed}
            onChange={e => onChange(exIdx, setIdx, 'reps', e.target.value)}
            style={{ color: set.completed ? 'var(--ag-orange)' : undefined }}
          />
        </div>
      </div>

      {set.completed && (
        <span style={{ fontSize: 11, color: 'var(--ag-orange)', fontWeight: 700 }}>✓</span>
      )}
    </div>
  )
}
