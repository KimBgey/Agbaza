import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSessions, useExercises, useBodyWeight } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'
import { IconChevronRight, IconClock, IconWeight, IconDumbbell } from '../components/Icons'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#888'
}

const MUSCLE_GROUPS = ['chest','back','legs','shoulders','biceps','triceps','core']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--ag-surface)', border: '1px solid var(--ag-border)', borderRadius: 10, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--ag-muted)', marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || 'var(--ag-orange)' }}>
          {p.value} {p.unit || ''}
        </div>
      ))}
    </div>
  )
}

export default function Progres() {
  const { t, i18n } = useTranslation()
  const { userProfile } = useAuth()
  const { sessions, loading } = useSessions()
  const { exercises: exerciseDb } = useExercises()
  const { entries: weightEntries, saveEntry: saveWeight } = useBodyWeight()
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const lang = i18n.language || 'fr'
  const unit = userProfile?.weightUnit || 'kg'

  // Weekly volume by muscle group
  const weeklyByMuscle = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const recent = sessions.filter(s => {
      const d = s.startedAt?.toDate ? s.startedAt.toDate() : new Date(s.startedAt)
      return d > weekAgo
    })
    const byMuscle = {}
    MUSCLE_GROUPS.forEach(mg => { byMuscle[mg] = 0 })
    recent.forEach(s => {
      ;(s.exercises || []).forEach(ex => {
        const mg = ex.muscleGroup
        if (mg) {
          const vol = (ex.sets || []).filter(s => s.completed)
            .reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0)
          byMuscle[mg] = (byMuscle[mg] || 0) + vol
        }
      })
    })
    return MUSCLE_GROUPS
      .filter(mg => byMuscle[mg] > 0)
      .map(mg => ({ name: t(`exercise.muscles.${mg}`), volume: byMuscle[mg], fill: muscleColor(mg) }))
  }, [sessions, t])

  // PR history for selected exercise
  const prHistory = useMemo(() => {
    if (!selectedExercise) return []
    return sessions
      .map(s => {
        const ex = (s.exercises || []).find(e => e.exerciseId === selectedExercise)
        if (!ex) return null
        const maxWeight = Math.max(...(ex.sets || []).filter(s => s.completed).map(s => Number(s.weight) || 0))
        const date = s.startedAt?.toDate ? s.startedAt.toDate() : new Date(s.startedAt)
        return maxWeight > 0 ? { date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), weight: maxWeight } : null
      })
      .filter(Boolean)
      .reverse()
      .slice(0, 12)
  }, [sessions, selectedExercise])

  const exercisesWithData = useMemo(() => {
    const used = new Set(sessions.flatMap(s => (s.exercises || []).map(e => e.exerciseId).filter(Boolean)))
    return exerciseDb.filter(e => used.has(e.id))
  }, [sessions, exerciseDb])

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  if (showDetail) {
    return <SessionDetail session={showDetail} t={t} unit={unit} lang={lang} onBack={() => setShowDetail(null)} />
  }

  return (
    <div className="screen">
      <div className="px pt" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="t-title">{t('progres.title')}</h1>

        <BodyWeightSection entries={weightEntries} onSave={saveWeight} unit={unit} />

        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />)
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ag-muted)' }}>
            <IconDumbbell size={40} color="var(--ag-hint)" />
            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: 'var(--ag-text)' }}>{t('progres.no_data')}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{t('progres.train_first')}</div>
          </div>
        ) : (
          <>
            {/* Weekly volume chart */}
            {weeklyByMuscle.length > 0 && (
              <div>
                <div className="section-header">
                  <span className="t-card-h">{t('progres.weekly_volume')}</span>
                  <span style={{ fontSize: 11, color: 'var(--ag-muted)' }}>{t('progres.by_muscle')}</span>
                </div>
                <div className="card" style={{ padding: '16px 8px' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weeklyByMuscle} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#777', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#777', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,94,0,0.05)' }} />
                      <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                        {weeklyByMuscle.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* PR history */}
            <div>
              <div className="section-header">
                <span className="t-card-h">{t('progres.pr_history')}</span>
              </div>
              <div className="card" style={{ padding: '14px 16px', marginBottom: 12 }}>
                <select
                  className="input"
                  value={selectedExercise || ''}
                  onChange={e => setSelectedExercise(e.target.value || null)}
                  style={{ marginBottom: 16 }}
                >
                  <option value="">{t('progres.select_exercise')}</option>
                  {exercisesWithData.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {lang === 'fr' ? ex.name_fr : ex.name_en}
                    </option>
                  ))}
                </select>
                {selectedExercise && prHistory.length > 0 && (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={prHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--ag-border)" />
                      <XAxis dataKey="date" tick={{ fill: '#777', fontSize: 9, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#777', fontSize: 9, fontFamily: 'Syne' }} axisLine={false} tickLine={false} unit={unit} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="weight" stroke="var(--ag-orange)" strokeWidth={2} dot={{ fill: 'var(--ag-orange)', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {selectedExercise && prHistory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ag-muted)', fontSize: 13 }}>
                    Pas encore de données pour cet exercice.
                  </div>
                )}
              </div>
            </div>

            {/* Session history */}
            <div>
              <div className="section-header">
                <span className="t-card-h">{t('progres.sessions_history')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.slice(0, 15).map(s => (
                  <div
                    key={s.id}
                    className="card"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    onClick={() => setShowDetail(s)}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="t-card-h" style={{ fontSize: 14 }}>{s.programName || 'Libre'}</div>
                      <div className="t-label" style={{ marginTop: 3, display: 'flex', gap: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <IconClock size={10} color="var(--ag-muted)" />
                          {s.durationMinutes || 0} min
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <IconWeight size={10} color="var(--ag-muted)" />
                          {s.totalVolume || 0} {unit}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ag-muted)' }}>{formatDate(s.startedAt)}</div>
                    <IconChevronRight size={14} color="var(--ag-muted)" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BodyWeightSection({ entries, onSave, unit }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find(e => e.date === today)
  const [value, setValue] = useState(todayEntry ? String(todayEntry.weight) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (todayEntry) setValue(String(todayEntry.weight))
  }, [todayEntry?.weight])

  const handleSave = async () => {
    if (!value || isNaN(Number(value))) return
    setSaving(true)
    await onSave(value)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const chartData = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(e => ({
      date: e.date.slice(5).replace('-', '/'),
      weight: e.weight
    }))

  const minW = chartData.length ? Math.floor(Math.min(...chartData.map(d => d.weight)) - 2) : 0
  const maxW = chartData.length ? Math.ceil(Math.max(...chartData.map(d => d.weight)) + 2) : 100

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="t-card-h">Poids corporel</span>
        {todayEntry && (
          <span style={{ fontSize: 11, color: 'var(--ag-orange)', fontWeight: 700 }}>
            {todayEntry.weight} {unit} aujourd'hui
          </span>
        )}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            className="input"
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={`Ex: 75`}
            min="20" max="300" step="0.1"
            style={{ paddingRight: 36 }}
          />
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, color: 'var(--ag-muted)', fontWeight: 600, pointerEvents: 'none'
          }}>{unit}</span>
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving || !value}
          style={{ width: 'auto', padding: '0 16px', minHeight: 44, fontSize: 13 }}
        >
          {saved ? '✓' : saving ? '…' : 'Enregistrer'}
        </button>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ag-border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#777', fontSize: 9, fontFamily: 'Syne' }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minW, maxW]}
              tick={{ fill: '#777', fontSize: 9, fontFamily: 'Syne' }}
              axisLine={false} tickLine={false}
              unit={unit}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="weight"
              stroke="var(--ag-orange)" strokeWidth={2}
              dot={{ fill: 'var(--ag-orange)', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartData.length === 0 && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ag-muted)', padding: '8px 0' }}>
          Enregistre ton poids chaque jour pour voir l'évolution.
        </div>
      )}
    </div>
  )
}

function SessionDetail({ session, t, unit, lang, onBack }) {
  return (
    <div className="screen">
      <div className="px pt">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-icon" onClick={onBack}>
            <IconDumbbell size={16} />
          </button>
          <div>
            <div className="t-card-h" style={{ fontSize: 16 }}>{session.programName || 'Libre'}</div>
            <div className="t-label" style={{ marginTop: 2 }}>
              {session.startedAt?.toDate ?
                session.startedAt.toDate().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                : ''}
            </div>
          </div>
        </div>

        {/* Summary pills */}
        <div className="scroll-row" style={{ marginBottom: 20 }}>
          <span className="pill">{session.durationMinutes || 0} min</span>
          <span className="pill">{session.totalVolume || 0} {unit}</span>
          <span className="pill">{(session.exercises || []).length} exercices</span>
        </div>

        {/* Exercises detail */}
        {(session.exercises || []).map((ex, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div className="t-card-h" style={{ marginBottom: 10 }}>{ex.exerciseName}</div>
            {(ex.sets || []).map((set, si) => (
              <div key={si} className={`set-row ${set.completed ? 'done' : ''}`} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--ag-muted)', fontWeight: 700, width: 20 }}>{si + 1}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, fontStyle: 'italic', color: set.completed ? 'var(--ag-orange)' : 'var(--ag-text)' }}>
                  {set.weight || 0} {unit} × {set.reps || 0}
                </span>
                {set.completed && <span style={{ fontSize: 11, color: 'var(--ag-orange)' }}>✓</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
