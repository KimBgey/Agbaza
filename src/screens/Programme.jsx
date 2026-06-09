import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrograms, useExercises } from '../hooks/useFirestore'
import { IconPlus, IconPlay, IconEdit, IconTrash, IconDumbbell, IconClock, IconChevronRight } from '../components/Icons'
import CreateProgram from './programme/CreateProgram'
import { PROGRAM_TEMPLATES } from '../data/templates'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#777'
}

export default function Programme() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { programs, loading, createProgram, deleteProgram, refetch } = usePrograms()
  const { exercises: exerciseDb } = useExercises()
  const [showCreate, setShowCreate] = useState(false)
  const [editProgram, setEditProgram] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [importingId, setImportingId] = useState(null)

  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

  const importTemplate = async (tpl) => {
    setImportingId(tpl.id)
    const exercises = tpl.exercises.map(te => {
      const normName = normalize(te.exerciseName)
      const normEn   = normalize(te.exerciseName_en)
      const match = exerciseDb.find(e =>
        normalize(e.name_fr || '') === normName ||
        normalize(e.name_en || '') === normEn ||
        normalize(e.name_fr || '').includes(normName.slice(0, 8)) ||
        normalize(e.name_en || '').includes(normEn.slice(0, 8))
      )
      return {
        exerciseId:      match?.id || null,
        exerciseName:    te.exerciseName,
        exerciseName_en: te.exerciseName_en,
        muscleGroup:     te.muscleGroup,
        sets:            te.sets,
        repsMin:         te.repsMin,
        repsMax:         te.repsMax,
        restSeconds:     te.restSeconds,
      }
    })
    await createProgram({ name: tpl.name, exercises })
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

        {/* Templates */}
        <div>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <span className="t-card-h">Templates</span>
            <span style={{ fontSize: 11, color: 'var(--ag-muted)' }}>Sèche 4 jours</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PROGRAM_TEMPLATES.map(tpl => {
              const muscles = [...new Set(tpl.exercises.map(e => e.muscleGroup))]
              const alreadyImported = programs.some(p => p.name === tpl.name)
              return (
                <div key={tpl.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: alreadyImported ? 0.5 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{tpl.name}</div>
                    <div className="scroll-row" style={{ gap: 4 }}>
                      {muscles.map(mg => (
                        <span key={mg} className="pill" style={{ fontSize: 10, padding: '2px 7px', background: `${muscleColor(mg)}22`, color: muscleColor(mg), borderColor: `${muscleColor(mg)}40` }}>
                          {t(`exercise.muscles.${mg}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn-secondary"
                    disabled={alreadyImported || importingId === tpl.id}
                    onClick={() => importTemplate(tpl)}
                    style={{ width: 'auto', padding: '8px 14px', fontSize: 12, flexShrink: 0 }}
                  >
                    {alreadyImported ? '✓' : importingId === tpl.id ? '…' : (
                      <><IconPlus size={12} /> Utiliser</>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
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
