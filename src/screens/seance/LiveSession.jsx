import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useExercises } from '../../hooks/useFirestore'
import { useRestTimer, useStopwatch } from '../../hooks/useTimer'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import {
  IconCheck, IconChevronLeft, IconPlus, IconX
} from '../../components/Icons'
import ExerciseLibrary from '../programme/ExerciseLibrary'
import EndScreen from './EndScreen'
import CardioTimer from './CardioTimer'

function muscleColor(g) {
  const m = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48', cardio:'#00C4A7' }
  return m[g] || '#777'
}

function makeTrackedExercise(ex) {
  return {
    exerciseId:     ex.id,
    exerciseName:   ex.name_fr,
    exerciseName_en:ex.name_en,
    muscleGroup:    ex.muscleGroup,
    type:           ex.type,
    equipment:      ex.equipment,
    repsMin:        8,
    repsMax:        12,
    restSeconds:    90,
    sets: Array(3).fill(null).map(() => ({ weight: '', reps: 10, completed: false }))
  }
}

const SESSION_KEY = 'ag_active_session'

export default function LiveSession({ program, resume, onFinish, onCancel }) {
  const { t, i18n }   = useTranslation()
  const { user, userProfile } = useAuth()
  const { exercises: exerciseDb } = useExercises()
  const lang = i18n.language || 'fr'

  const stopwatch  = useStopwatch()
  const restTimer  = useRestTimer()

  const [exerciseList, setExerciseList] = useState(() => {
    if (resume?.exerciseList) return resume.exerciseList
    if (!program?.exercises?.length) return []
    return program.exercises.map(ex => ({
      ...ex,
      sets: Array(ex.sets || 3).fill(null).map(() => ({
        weight: '', reps: ex.repsMax || 10, completed: false
      }))
    }))
  })

  const [currentExIdx, setCurrentExIdx] = useState(resume?.currentExIdx ?? 0)
  const [currentSetIdx, setCurrentSetIdx] = useState(resume?.currentSetIdx ?? 0)
  const [showEnd,     setShowEnd]     = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [lastPerf,    setLastPerf]    = useState({}) // { [exerciseId]: [{weight,reps},...] }
  const [maxEver,     setMaxEver]     = useState({}) // { [exerciseId]: maxWeight }
  const [prFlash,     setPrFlash]     = useState(null) // exercise name string

  // Fetch session history → last perf + all-time max weight per exercise
  useEffect(() => {
    if (!user) return
    getDocs(collection(db, `agbaza_sessions/${user.uid}/sessions`))
      .then(snap => {
        const sorted = snap.docs.sort((a, b) => {
          const aT = a.data().startedAt?.toMillis?.() || 0
          const bT = b.data().startedAt?.toMillis?.() || 0
          return bT - aT
        })
        const perf = {}
        const maxW = {}
        sorted.forEach(docSnap => {
          const { exercises = [] } = docSnap.data()
          exercises.forEach(ex => {
            if (!perf[ex.exerciseId]) {
              const doneSets = (ex.sets || []).filter(s => s.completed && (Number(s.weight) > 0 || Number(s.reps) > 0))
              if (doneSets.length) perf[ex.exerciseId] = ex.sets
            }
            ;(ex.sets || []).filter(s => s.completed).forEach(s => {
              const w = Number(s.weight) || 0
              if (w > (maxW[ex.exerciseId] || 0)) maxW[ex.exerciseId] = w
            })
          })
        })
        setLastPerf(perf)
        setMaxEver(maxW)
      })
      .catch(() => {})
  }, [user?.uid])

  // Start or resume stopwatch
  useEffect(() => {
    if (resume?.elapsedSeconds) stopwatch.startFrom(resume.elapsedSeconds)
    else stopwatch.start()
  }, [])

  // Persist session state to localStorage on every meaningful change
  useEffect(() => {
    if (exerciseList.length === 0) return
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      savedAt:        Date.now(),
      elapsedSeconds: stopwatch.elapsed,
      program:        program ? { id: program.id, name: program.name } : null,
      exerciseList,
      currentExIdx,
      currentSetIdx,
    }))
  }, [exerciseList, currentExIdx, currentSetIdx])

  // Keep elapsedSeconds fresh in localStorage every 10 s while running
  useEffect(() => {
    if (!stopwatch.running) return
    const id = setInterval(() => {
      try {
        const raw = localStorage.getItem(SESSION_KEY)
        if (!raw) return
        const data = JSON.parse(raw)
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, elapsedSeconds: stopwatch.elapsed }))
      } catch {}
    }, 10000)
    return () => clearInterval(id)
  }, [stopwatch.running, stopwatch.elapsed])

  const currentEx       = exerciseList[currentExIdx]
  const allExsDone      = exerciseList.length > 0 && currentExIdx >= exerciseList.length
  const isFreeEmpty     = exerciseList.length === 0

  const getExName = useCallback((ex) =>
    lang === 'fr'
      ? (ex.exerciseName  || ex.name_fr  || ex.exerciseName_en || '')
      : (ex.exerciseName_en || ex.name_en || ex.exerciseName   || ''),
  [lang])

  /* ─── Add exercise from library ──────────────────────────────── */
  const addExerciseToSession = useCallback((ex) => {
    const newIdx = exerciseList.length   // index BEFORE appending
    setExerciseList(prev => [...prev, makeTrackedExercise(ex)])
    setCurrentExIdx(newIdx)
    setCurrentSetIdx(0)
    restTimer.stop()
    setShowLibrary(false)
  }, [exerciseList.length, restTimer])

  /* ─── Update set value ───────────────────────────────────────── */
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

  /* ─── Validate set ───────────────────────────────────────────── */
  const validateSet = () => {
    const ex = exerciseList[currentExIdx]
    if (!ex) return

    // PR check — before state update so we read current values
    const weight = Number(ex.sets[currentSetIdx]?.weight) || 0
    if (weight > 0 && weight > (maxEver[ex.exerciseId] || 0)) {
      setPrFlash(getExName(ex))
      setMaxEver(prev => ({ ...prev, [ex.exerciseId]: weight }))
    }

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

    const restSec = ex.restSeconds || 90
    restTimer.start(restSec)

    const nextSet = currentSetIdx + 1
    if (nextSet < ex.sets.length) {
      setCurrentSetIdx(nextSet)
    } else {
      const nextEx = currentExIdx + 1
      if (nextEx < exerciseList.length) {
        setCurrentExIdx(nextEx)
        setCurrentSetIdx(0)
      } else {
        // All done → go to "add more?" panel (don't auto-close)
        setCurrentExIdx(exerciseList.length)
      }
    }
  }

  /* ─── Add / remove set on-the-fly ───────────────────────────── */
  const addSet = () => {
    setExerciseList(prev => {
      const next = [...prev]
      const ex = next[currentExIdx]
      const lastSet = ex.sets[ex.sets.length - 1]
      next[currentExIdx] = {
        ...ex,
        sets: [...ex.sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || 10, completed: false }]
      }
      return next
    })
  }

  const removeSet = () => {
    setExerciseList(prev => {
      const next = [...prev]
      const ex = next[currentExIdx]
      const removable = ex.sets.filter(s => !s.completed)
      if (removable.length <= 1) return prev
      // Remove last non-completed set
      const lastIdx = [...ex.sets].map((s, i) => (!s.completed ? i : -1)).filter(i => i >= 0).pop()
      const newSets = ex.sets.filter((_, i) => i !== lastIdx)
      next[currentExIdx] = { ...ex, sets: newSets }
      if (currentSetIdx >= newSets.length) setCurrentSetIdx(newSets.length - 1)
      return next
    })
  }

  const skipExercise = () => {
    restTimer.stop()
    setExerciseList(prev => {
      const next = [...prev]
      const [skipped] = next.splice(currentExIdx, 1)
      next.push(skipped)
      return next
    })
    // currentExIdx unchanged — the next exercise slides into this position
    // If we just pushed the last exercise, it'll loop back; if list had 1 item,
    // show the "all done" panel.
    if (exerciseList.length <= 1) {
      setCurrentExIdx(exerciseList.length)
    }
    setCurrentSetIdx(0)
  }

  /* ─── Complete cardio exercise ──────────────────────────────── */
  const completeCardioExercise = ({ elapsed, distance }) => {
    setExerciseList(prev => {
      const next = [...prev]
      next[currentExIdx] = {
        ...next[currentExIdx],
        durationSeconds: elapsed,
        distance,
        sets: next[currentExIdx].sets.map(s => ({ ...s, completed: true }))
      }
      return next
    })
    const nextEx = currentExIdx + 1
    if (nextEx < exerciseList.length) {
      setCurrentExIdx(nextEx)
      setCurrentSetIdx(0)
    } else {
      setCurrentExIdx(exerciseList.length)
    }
  }

  /* ─── Finish session ─────────────────────────────────────────── */
  const handleFinish = async () => {
    stopwatch.stop()
    const completedExercises = exerciseList.map(ex => ({
      exerciseId:   ex.exerciseId,
      exerciseName: ex.exerciseName,
      muscleGroup:  ex.muscleGroup,
      sets:         ex.sets
    }))
    const totalVolume = exerciseList.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completed)
        .reduce((s2, set) => s2 + (Number(set.weight)||0) * (Number(set.reps)||0), 0), 0
    )
    await onFinish({
      programId:       program?.id || null,
      programName:     program?.name || 'Libre',
      durationMinutes: Math.round(stopwatch.elapsed / 60),
      totalVolume:     Math.round(totalVolume),
      finishedAt:      new Date().toISOString(),
      exercises:       completedExercises
    })
  }

  /* ─── Bonus (muscles non travaillés) ─────────────────────────── */
  const trainedMuscles = new Set(exerciseList.map(e => e.muscleGroup).filter(Boolean))
  const bonusExercises = useMemo(() =>
    exerciseDb.filter(e => !trainedMuscles.has(e.muscleGroup)).slice(0, 8),
  [exerciseDb, trainedMuscles])

  /* ─── Progress ───────────────────────────────────────────────── */
  const completedSets = exerciseList.reduce((s, ex) => s + ex.sets.filter(s => s.completed).length, 0)
  const totalSets     = exerciseList.reduce((s, ex) => s + ex.sets.length, 0)
  const progress      = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  /* ─── End screen ─────────────────────────────────────────────── */
  if (showEnd) {
    const totalVolume = exerciseList.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completed)
        .reduce((s2, set) => s2 + (Number(set.weight)||0) * (Number(set.reps)||0), 0), 0
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

  /* ─── Library overlay ────────────────────────────────────────── */
  if (showLibrary) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'var(--ag-bg)',
        display: 'flex', flexDirection: 'column', zIndex: 60,
        maxWidth: 430, margin: '0 auto'
      }}>
        {/* Chrono visible pendant la sélection */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--ag-border)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <button className="btn-icon" onClick={() => setShowLibrary(false)}>
            <IconX size={16} />
          </button>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
            Ajouter un exercice
          </div>
          <div style={{ fontSize: 12, color: 'var(--ag-orange)', fontWeight: 800, fontStyle: 'italic' }}>
            {stopwatch.formatted}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ExerciseLibrary
            selected={exerciseList}
            onSelect={addExerciseToSession}
            onClose={() => setShowLibrary(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--ag-bg)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      maxWidth: 430, margin: '0 auto'
    }}>
      {prFlash && (
        <PRFlash name={prFlash} onDone={() => setPrFlash(null)} />
      )}
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--ag-border)'
      }}>
        <button
          className="btn-icon"
          onClick={() => { if (confirm('Abandonner la séance ?')) { stopwatch.stop(); onCancel() } }}
          aria-label={t('common.back')}
        >
          <IconChevronLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {program?.name || 'Libre'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ag-muted)' }}>
            {exerciseList.length > 0
              ? `${t('seance.exercise')} ${Math.min(currentExIdx + 1, exerciseList.length)}/${exerciseList.length}`
              : t('seance.free_training')
            } · {stopwatch.formatted}
          </div>
        </div>
        {/* Add exercise button — always visible */}
        <button
          className="btn-icon"
          onClick={() => setShowLibrary(true)}
          aria-label="Ajouter un exercice"
          style={{ borderColor: 'rgba(245,94,0,0.3)' }}
        >
          <IconPlus size={18} color="var(--ag-orange)" />
        </button>
        <button
          className="btn-ghost"
          onClick={() => setShowEnd(true)}
          style={{ color: 'var(--ag-orange)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}
        >
          {t('common.done')}
        </button>
      </div>

      {/* Progress bar */}
      {totalSets > 0 && (
        <>
          <div className="progress-bar-track" style={{ margin: '0 16px', borderRadius: 0 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ textAlign: 'right', padding: '4px 16px 0', fontSize: 11, color: 'var(--ag-orange)', fontWeight: 800, fontStyle: 'italic' }}>
            {Math.round(progress)}%
          </div>
        </>
      )}

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

        {/* ── EMPTY STATE (free training, no exercise yet) ── */}
        {isFreeEmpty && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 16, padding: '32px 16px', textAlign: 'center'
          }}>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              {/* Orange glow behind barbell area */}
              <div style={{
                position: 'absolute',
                bottom: 8, left: '50%', transform: 'translateX(-50%)',
                width: 90, height: 36,
                background: 'var(--ag-orange)',
                borderRadius: '50%',
                filter: 'blur(22px)',
                opacity: 0.5,
              }} />
              <img
                src="/icons/mascot.png"
                alt=""
                style={{
                  width: 130, height: 130, objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                  position: 'relative', zIndex: 1,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
                {t('seance.free_training')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ag-muted)', lineHeight: 1.5 }}>
                Choisis ton premier exercice<br />pour commencer le suivi.
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowLibrary(true)}>
              <IconPlus size={16} />
              Choisir un exercice
            </button>
          </div>
        )}

        {/* ── CURRENT EXERCISE ── */}
        {currentEx && (
          <div>
            {/* Header card — commun à tous les types */}
            <div className="card card-active" style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
                backgroundImage: `url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60)`,
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15
              }} />
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
                background: currentEx.type === 'cardio'
                  ? 'linear-gradient(to left, transparent, rgba(0,196,167,0.1) 100%)'
                  : 'linear-gradient(to left, transparent, var(--ag-orange-soft) 100%)'
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 11, color: muscleColor(currentEx.muscleGroup), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  {t(`exercise.muscles.${currentEx.muscleGroup}`)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>{getExName(currentEx)}</div>
                {currentEx.type !== 'cardio' && (
                  <div style={{ fontSize: 12, color: 'var(--ag-muted)', marginTop: 4 }}>
                    {currentEx.repsMin}–{currentEx.repsMax} reps · repos {currentEx.restSeconds}s
                  </div>
                )}
              </div>
            </div>

            {/* Cardio : gros chrono tap-to-start/stop */}
            {currentEx.type === 'cardio' ? (
              <CardioTimer
                exName={getExName(currentEx)}
                onComplete={completeCardioExercise}
              />
            ) : (
              <>
                {/* YouTube demo — inline above sets */}
                {(() => {
                  const full = exerciseDb.find(e => e.id === currentEx.exerciseId)
                  return full?.youtubeVideoId ? (
                    <SessionVideoPlayer videoId={full.youtubeVideoId} title={getExName(currentEx)} />
                  ) : null
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {currentEx.sets.map((set, si) => (
                    <SetRow
                      key={si}
                      set={set} setIdx={si} exIdx={currentExIdx}
                      isActive={si === currentSetIdx && !set.completed}
                      unit={userProfile?.weightUnit || 'kg'}
                      onChange={updateSet}
                      lastSet={lastPerf[currentEx.exerciseId]?.[si]}
                    />
                  ))}
                </div>

                {/* +/- séries */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <button
                    className="btn-icon"
                    onClick={removeSet}
                    disabled={currentEx.sets.filter(s => !s.completed).length <= 1}
                    style={{ opacity: currentEx.sets.filter(s => !s.completed).length <= 1 ? 0.3 : 1 }}
                    aria-label="Supprimer une série"
                  >
                    <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>−</span>
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--ag-muted)', flex: 1, textAlign: 'center' }}>
                    {currentEx.sets.length} {currentEx.sets.length > 1 ? 'séries' : 'série'}
                  </span>
                  <button
                    className="btn-icon"
                    onClick={addSet}
                    aria-label="Ajouter une série"
                  >
                    <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</span>
                  </button>
                </div>

                {!currentEx.sets[currentSetIdx]?.completed && (
                  <button className="btn-primary" onClick={validateSet} style={{ marginBottom: 10 }}>
                    <IconCheck size={16} />
                    {t('seance.validate_set')} — {t('seance.set')} {currentSetIdx + 1}
                  </button>
                )}

                <button className="btn-secondary" onClick={skipExercise}>
                  Passer cet exercice
                </button>
              </>
            )}
          </div>
        )}

        {/* ── ALL EXERCISES DONE → "Add more / Finish" panel ── */}
        {allExsDone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'var(--ag-orange-soft)',
              border: '1px solid rgba(245,94,0,0.25)',
              borderRadius: 'var(--ag-radius)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ag-orange)', marginBottom: 4 }}>
                Programme terminé
              </div>
              <div style={{ fontSize: 12, color: 'var(--ag-muted)' }}>
                {exerciseList.length} exercice{exerciseList.length > 1 ? 's' : ''} · {stopwatch.formatted}
              </div>
            </div>

            <button className="btn-secondary" onClick={() => setShowLibrary(true)}>
              <IconPlus size={16} />
              Ajouter un exercice
            </button>

            <button className="btn-primary" onClick={() => setShowEnd(true)}>
              {t('seance.finish_session')}
            </button>
          </div>
        )}

        {/* ── UPCOMING ── */}
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

        {/* ── BONUS EXERCISES (with "+" button) ── */}
        {bonusExercises.length > 0 && !isFreeEmpty && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t('seance.bonus_title')}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ag-muted)', marginBottom: 12 }}>{t('seance.bonus_subtitle')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bonusExercises.map(ex => (
                <div key={ex.id} className="set-row">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: muscleColor(ex.muscleGroup), flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {lang === 'fr' ? ex.name_fr : ex.name_en}
                    </div>
                    <div style={{ fontSize: 11, color: muscleColor(ex.muscleGroup), fontWeight: 600, marginTop: 1 }}>
                      {t(`exercise.muscles.${ex.muscleGroup}`)}
                      <span style={{ color: 'var(--ag-muted)', fontWeight: 400 }}>
                        {' · '}{t(`exercise.${ex.type}`)}
                      </span>
                    </div>
                  </div>
                  {/* One-tap add */}
                  <button
                    onClick={() => addExerciseToSession(ex)}
                    style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--ag-orange-soft)',
                      border: '1px solid rgba(245,94,0,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'background 150ms'
                    }}
                    aria-label={`Ajouter ${lang === 'fr' ? ex.name_fr : ex.name_en}`}
                  >
                    <IconPlus size={14} color="var(--ag-orange)" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function PRFlash({ name, onDone }) {
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="pr-flash">
      <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>🏆</div>
      <div style={{
        fontSize: 22, fontWeight: 900, color: '#fff',
        letterSpacing: '-0.5px', textTransform: 'uppercase', marginBottom: 6
      }}>
        Nouveau record !
      </div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textAlign: 'center', maxWidth: 240 }}>
        {name}
      </div>
    </div>
  )
}

function SessionVideoPlayer({ videoId, title }) {
  const [ready, setReady] = useState(false)
  return (
    <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', background: '#111' }}>
      {!ready && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
      )}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setReady(true)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          border: 'none', opacity: ready ? 1 : 0, transition: 'opacity 350ms',
        }}
      />
    </div>
  )
}

function SetRow({ set, setIdx, exIdx, isActive, unit, onChange, lastSet }) {
  const prevWeight = lastSet ? Number(lastSet.weight) : 0
  const prevReps   = lastSet ? Number(lastSet.reps)   : 0
  const hasLastPerf = prevWeight > 0 || prevReps > 0

  return (
    <div
      className={`set-row ${set.completed ? 'done' : ''}`}
      style={{ borderColor: isActive ? 'var(--ag-orange)' : undefined, flexWrap: 'wrap', gap: '10px 12px' }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: set.completed ? 'var(--ag-orange)' : (isActive ? 'var(--ag-orange-soft)' : 'transparent'),
        border: `2px solid ${set.completed ? 'var(--ag-orange)' : (isActive ? 'var(--ag-orange)' : 'var(--ag-border)')}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms'
      }}>
        {set.completed
          ? <IconCheck size={12} color="#fff" />
          : <span style={{ fontSize: 10, fontWeight: 800, color: isActive ? 'var(--ag-orange)' : 'var(--ag-muted)' }}>{setIdx + 1}</span>
        }
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{unit}</span>
          <input
            className="num-input" type="number"
            value={set.weight} placeholder={prevWeight > 0 ? String(prevWeight) : '0'} min="0" step="0.5"
            disabled={set.completed}
            onChange={e => onChange(exIdx, setIdx, 'weight', e.target.value)}
            style={{ color: set.completed ? 'var(--ag-orange)' : undefined }}
          />
        </div>
        <span style={{ color: 'var(--ag-muted)', fontSize: 14 }}>×</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase' }}>reps</span>
          <input
            className="num-input" type="number"
            value={set.reps} placeholder="10" min="1"
            disabled={set.completed}
            onChange={e => onChange(exIdx, setIdx, 'reps', e.target.value)}
            style={{ color: set.completed ? 'var(--ag-orange)' : undefined }}
          />
        </div>
      </div>

      {set.completed && <span style={{ fontSize: 11, color: 'var(--ag-orange)', fontWeight: 700 }}>✓</span>}

      {/* Last perf hint */}
      {hasLastPerf && !set.completed && (
        <div style={{ flexBasis: '100%', paddingLeft: 34, fontSize: 10, color: 'var(--ag-muted)', opacity: 0.7, marginTop: -4 }}>
          Dernière&nbsp;: {prevWeight > 0 ? `${prevWeight} ${unit}` : '—'} × {prevReps}
        </div>
      )}
    </div>
  )
}
