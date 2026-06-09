import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrograms, useExercises, useTemplates } from '../hooks/useFirestore'
import { IconPlus, IconPlay, IconEdit, IconTrash, IconDumbbell, IconClock, IconChevronDown } from '../components/Icons'
import CreateProgram from './programme/CreateProgram'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48', cardio:'#00C4A7' }
  return map[group] || '#777'
}

const LEVEL_META = {
  debutant:     { label: 'Débutant',      color: '#2DA854' },
  intermediaire:{ label: 'Intermédiaire', color: '#F55E00' },
}
const GOAL_META = {
  cut:     { label: 'Sèche',   color: '#4A6CF7' },
  bulk:    { label: 'Masse',   color: '#E11D48' },
  maintain:{ label: 'Maintien',color: '#2DA854' },
}

export default function Programme() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { programs, loading, createProgram, deleteProgram, refetch } = usePrograms()
  const { exercises: exerciseDb } = useExercises()
  const { templates, loading: tplLoading } = useTemplates()
  const [showCreate, setShowCreate] = useState(false)
  const [editProgram, setEditProgram] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [importingId, setImportingId] = useState(null)

  const normalize = (s = '') =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

  const findExercise = (name) => {
    const n = normalize(name)
    return exerciseDb.find(e =>
      normalize(e.name_fr) === n ||
      normalize(e.name_en) === n ||
      normalize(e.name_fr).includes(n.slice(0, 9)) ||
      normalize(e.name_en).includes(n.slice(0, 9))
    )
  }

  const importTemplate = async (tpl) => {
    setImportingId(tpl.id)
    for (const day of tpl.days) {
      const exercises = day.exercises.map(te => {
        const match = findExercise(te.exerciseName)
        const primaryMuscle = day.muscleGroups?.[0] || 'chest'
        return {
          exerciseId:      match?.id || null,
          exerciseName:    te.exerciseName,
          exerciseName_en: match?.name_en || te.exerciseName,
          muscleGroup:     match?.muscleGroup || primaryMuscle,
          sets:            te.sets,
          repsMin:         te.repsMin,
          repsMax:         te.repsMax,
          restSeconds:     te.restSeconds,
        }
      })
      await createProgram({
        name:             day.name,
        exercises,
        templateId:       tpl.id,
        templateDayNumber:day.dayNumber,
      })
    }
    refetch()
    setImportingId(null)
  }

  const formatLastUsed = (ts) => {
    if (!ts) return t('programme.never')
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (showCreate || editProgram) {
    return (
      <CreateProgram
        existing={editProgram}
        onClose={() => { setShowCreate(false); setEditProgram(null) }}
        onSaved={() => { setShowCreate(false); setEditProgram(null); refetch() }}
      />
    )
  }

  return (
    <div className="screen">
      <div className="px pt" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div className="section-header">
          <h1 className="t-title">{t('programme.title')}</h1>
          <button className="btn-icon" onClick={() => setShowCreate(true)} aria-label={t('programme.create')}>
            <IconPlus size={18} />
          </button>
        </div>

        {/* Programs list */}
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
          ))
        ) : programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <IconDumbbell size={36} color="var(--ag-hint)" />
            <div style={{ marginTop: 12, color: 'var(--ag-muted)', fontSize: 14 }}>{t('programme.no_programs')}</div>
            <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: 16 }}>
              <IconPlus size={16} />
              {t('programme.create_first')}
            </button>
          </div>
        ) : (
          programs.map(p => (
            <ProgramCard
              key={p.id}
              program={p}
              t={t}
              formatLastUsed={formatLastUsed}
              muscleColor={muscleColor}
              onStart={() => navigate('/seance', { state: { program: p } })}
              onEdit={() => setEditProgram(p)}
              onDelete={() => setConfirmDelete(p)}
            />
          ))
        )}

        {programs.length > 0 && (
          <button className="btn-secondary" onClick={() => setShowCreate(true)}>
            <IconPlus size={16} />
            {t('programme.create')}
          </button>
        )}

        {/* ── Templates ── */}
        <div>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <span className="t-card-h">Templates</span>
            <span style={{ fontSize: 11, color: 'var(--ag-muted)' }}>{templates.length} programmes</span>
          </div>

          {tplLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14, marginBottom: 10 }} />
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {templates.map(tpl => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  t={t}
                  muscleColor={muscleColor}
                  alreadyImported={programs.some(p => p.templateId === tpl.id)}
                  importing={importingId === tpl.id}
                  onImport={() => importTemplate(tpl)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {t('programme.confirm_delete')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ag-muted)', marginBottom: 24 }}>
              {confirmDelete.name}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>
                {t('common.cancel')}
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, background: '#E11D48' }}
                onClick={async () => {
                  await deleteProgram(confirmDelete.id)
                  setConfirmDelete(null)
                }}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ tpl, t, muscleColor, alreadyImported, importing, onImport }) {
  const [expanded, setExpanded] = useState(false)
  const level  = LEVEL_META[tpl.level]  || { label: tpl.level,  color: '#888' }
  const goal   = GOAL_META[tpl.goal]    || { label: tpl.goal,   color: '#888' }
  const allMuscles = [...new Set((tpl.days || []).flatMap(d => d.muscleGroups || []))]

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>{tpl.name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: `${level.color}22`, color: level.color, border: `1px solid ${level.color}44`
            }}>{level.label}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: `${goal.color}22`, color: goal.color, border: `1px solid ${goal.color}44`
            }}>{goal.label}</span>
            <span style={{ fontSize: 10, color: 'var(--ag-muted)', padding: '2px 0' }}>
              {tpl.daysPerWeek}j / semaine
            </span>
          </div>
        </div>
        <button
          className={alreadyImported ? 'btn-secondary' : 'btn-primary'}
          disabled={alreadyImported || importing}
          onClick={onImport}
          style={{ width: 'auto', padding: '8px 14px', fontSize: 12, flexShrink: 0 }}
        >
          {alreadyImported ? 'Importé ✓' : importing ? '…' : <><IconPlus size={12} /> Utiliser</>}
        </button>
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: 'var(--ag-muted)', lineHeight: 1.5, marginBottom: 10 }}>
        {tpl.description}
      </div>

      {/* Muscle pills */}
      <div className="scroll-row" style={{ gap: 4, marginBottom: 10 }}>
        {allMuscles.map(mg => (
          <span key={mg} className="pill" style={{
            fontSize: 10, padding: '2px 7px',
            background: `${muscleColor(mg)}22`, color: muscleColor(mg), borderColor: `${muscleColor(mg)}40`
          }}>
            {t(`exercise.muscles.${mg}`)}
          </span>
        ))}
      </div>

      {/* Days toggle */}
      <button
        className="btn-ghost"
        onClick={() => setExpanded(e => !e)}
        style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--ag-border)', marginTop: 2, color: 'var(--ag-muted)', fontSize: 12 }}
      >
        <span>Voir les {tpl.days?.length} jours</span>
        <IconChevronDown size={14} color="var(--ag-muted)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
      </button>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {(tpl.days || []).map(day => (
            <div key={day.dayNumber} style={{
              background: 'var(--ag-surface)', borderRadius: 10, padding: '10px 12px',
              border: '1px solid var(--ag-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3,
                  background: 'var(--ag-orange)', color: '#fff', letterSpacing: '0.5px', flexShrink: 0
                }}>J{day.dayNumber}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{day.name.replace(/^J\d+\s*[—–]\s*/, '')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {day.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--ag-text)' }}>{ex.exerciseName}</span>
                    <span style={{ fontSize: 11, color: 'var(--ag-muted)', flexShrink: 0, marginLeft: 8 }}>
                      {ex.sets}×{ex.repsMin}{ex.repsMin !== ex.repsMax ? `–${ex.repsMax}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program, t, formatLastUsed, muscleColor, onStart, onEdit, onDelete }) {
  const muscles = [...new Set((program.exercises || []).map(e => e.muscleGroup).filter(Boolean))]

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="t-card-h" style={{ fontSize: 16 }}>{program.name}</div>
          <div className="t-label" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconDumbbell size={11} color="var(--ag-muted)" />
            {program.exercises?.length || 0} {t('programme.exercises')}
            <span style={{ margin: '0 2px' }}>·</span>
            <IconClock size={11} color="var(--ag-muted)" />
            {t('programme.last_used')}: {formatLastUsed(program.lastUsed)}
          </div>
        </div>
        <button className="btn-primary" onClick={onStart} style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
          <IconPlay size={14} color="#fff" />
          {t('programme.start')}
        </button>
      </div>

      {muscles.length > 0 && (
        <div className="scroll-row">
          {muscles.map(mg => (
            <span key={mg} className="pill" style={{ fontSize: 11, padding: '3px 8px', background: `${muscleColor(mg)}22`, color: muscleColor(mg), borderColor: `${muscleColor(mg)}40` }}>
              {t(`exercise.muscles.${mg}`)}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--ag-border)', paddingTop: 10 }}>
        <button className="btn-ghost" onClick={onEdit}>
          <IconEdit size={14} />
          {t('programme.edit')}
        </button>
        <button className="btn-ghost" onClick={onDelete} style={{ color: '#E11D48', marginLeft: 'auto' }}>
          <IconTrash size={14} />
          {t('programme.delete')}
        </button>
      </div>
    </div>
  )
}
