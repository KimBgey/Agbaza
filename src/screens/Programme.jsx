import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrograms } from '../hooks/useFirestore'
import { IconPlus, IconPlay, IconEdit, IconTrash, IconDumbbell, IconClock, IconChevronRight } from '../components/Icons'
import CreateProgram from './programme/CreateProgram'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#777'
}

export default function Programme() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { programs, loading, deleteProgram, refetch } = usePrograms()
  const [showCreate, setShowCreate] = useState(false)
  const [editProgram, setEditProgram] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

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
