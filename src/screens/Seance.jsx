import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrograms } from '../hooks/useFirestore'
import { useSessions } from '../hooks/useFirestore'
import { IconPlay, IconDumbbell, IconChevronRight, IconClock, IconPlus } from '../components/Icons'
import LiveSession from './seance/LiveSession'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#777'
}

export default function Seance() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { programs, loading } = usePrograms()
  const { saveSession } = useSessions()
  const [activeSession, setActiveSession] = useState(
    location.state?.program ? { program: location.state.program } : null
  )

  const handleStartProgram = (program) => {
    setActiveSession({ program })
  }

  const handleFinishSession = async (sessionData) => {
    try {
      await saveSession(sessionData)
    } catch (_) {}
    setActiveSession(null)
  }

  if (activeSession) {
    return (
      <LiveSession
        program={activeSession.program}
        onFinish={handleFinishSession}
        onCancel={() => setActiveSession(null)}
      />
    )
  }

  return (
    <div className="screen">
      <div className="px pt" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 className="t-title">{t('seance.title')}</h1>

        {/* Free training */}
        <button
          onClick={() => handleStartProgram(null)}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            background: 'var(--ag-orange-soft)',
            border: '1px solid rgba(245,94,0,0.35)',
            borderRadius: 'var(--ag-radius)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
          }}
        >
          {/* Mascot disc */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--ag-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(245,94,0,0.4)',
            overflow: 'hidden',
          }}>
            <img src="/icons/mascot.png" alt="" style={{ width: 46, height: 46, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <img src="/icons/text.png" alt="AGBAZA" style={{ height: 20, width: 'auto', marginBottom: 4 }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ag-orange)', letterSpacing: '-0.3px' }}>
              {t('seance.free_training')}
            </div>
            <div className="t-label" style={{ marginTop: 2, color: 'rgba(245,94,0,0.6)' }}>
              Choisis tes exercices au fil de la séance
            </div>
          </div>
          <IconChevronRight size={18} color="var(--ag-orange)" />
        </button>

        {/* Programs */}
        <div>
          <div className="section-header">
            <span className="t-card-h">{t('seance.choose_program')}</span>
          </div>

          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 10 }} />
            ))
          ) : programs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ag-muted)' }}>
              <div style={{ fontSize: 13 }}>Crée d'abord un programme dans l'onglet Programme.</div>
            </div>
          ) : (
            programs.map(p => {
              const muscles = [...new Set((p.exercises || []).map(e => e.muscleGroup).filter(Boolean))]
              const estMin = (p.exercises || []).reduce((sum, e) => {
                const setTime = (e.sets || 3) * ((e.restSeconds || 90) + 40)
                return sum + Math.round(setTime / 60)
              }, 0)

              return (
                <div
                  key={p.id}
                  className="card"
                  style={{ marginBottom: 10, cursor: 'pointer' }}
                  onClick={() => handleStartProgram(p)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div className="t-card-h">{p.name}</div>
                      <div className="t-label" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconDumbbell size={11} color="var(--ag-muted)" />
                        {p.exercises?.length || 0} {t('programme.exercises')}
                        <span>·</span>
                        <IconClock size={11} color="var(--ag-muted)" />
                        ~{estMin} min
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ width: 'auto', padding: '10px 16px', fontSize: 13 }}
                      onClick={e => { e.stopPropagation(); handleStartProgram(p) }}
                    >
                      <IconPlay size={14} color="#fff" />
                      {t('seance.start')}
                    </button>
                  </div>

                  {muscles.length > 0 && (
                    <div className="scroll-row" style={{ marginTop: 10 }}>
                      {muscles.map(mg => (
                        <span key={mg} className="pill" style={{ fontSize: 11, padding: '3px 8px', background: `${muscleColor(mg)}22`, color: muscleColor(mg), borderColor: `${muscleColor(mg)}40` }}>
                          {t(`exercise.muscles.${mg}`)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
