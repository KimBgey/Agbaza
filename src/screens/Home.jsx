import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useSessions, usePrograms } from '../hooks/useFirestore'
import {
  IconFlame, IconClock, IconWeight, IconTrophy,
  IconArrowRight, IconPlay, IconDumbbell
} from '../components/Icons'

const HERO_IMG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=860&q=80'

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('home.greeting_morning')
  if (h < 18) return t('home.greeting_afternoon')
  return t('home.greeting_evening')
}

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#777'
}

export default function Home() {
  const { t } = useTranslation()
  const { userProfile } = useAuth()
  const { sessions, loading: sessLoading } = useSessions()
  const { programs } = usePrograms()
  const navigate = useNavigate()

  const motivation = useMemo(() => {
    const list = t('home.motivations', { returnObjects: true })
    return list[Math.floor(Math.random() * list.length)]
  }, [])

  // Week stats
  const weekStats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const weekly = sessions.filter(s => {
      const d = s.startedAt?.toDate ? s.startedAt.toDate() : new Date(s.startedAt)
      return d > weekAgo
    })
    const totalVolume = weekly.reduce((sum, s) => sum + (s.totalVolume || 0), 0)
    const avgDuration = weekly.length > 0
      ? Math.round(weekly.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / weekly.length)
      : 0
    const allWeights = weekly.flatMap(s =>
      (s.exercises || []).flatMap(e =>
        (e.sets || []).filter(set => set.completed).map(set => set.weight || 0)
      )
    )
    const pr = allWeights.length > 0 ? Math.max(...allWeights) : 0
    return { count: weekly.length, volume: totalVolume, avgDuration, pr }
  }, [sessions])

  const lastSession = sessions[0]
  const suggestedProgram = programs[0]

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="screen">
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        height: 220,
        overflow: 'hidden',
        borderRadius: '0 0 20px 20px'
      }}>
        <img
          src={HERO_IMG}
          alt="Gym"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="eager"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(15,15,15,0.95) 55%, rgba(15,15,15,0.3))'
        }} />
        <div style={{ position: 'absolute', inset: 0, padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {getGreeting(t)}{userProfile?.name ? `, ${userProfile.name}` : ''}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 4, lineHeight: 1.2, maxWidth: 220 }}>
              {motivation}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/seance')}
            style={{ width: 'auto', padding: '12px 20px' }}
          >
            <IconPlay size={16} color="#fff" />
            {t('home.start_session')}
          </button>
        </div>
      </div>

      <div className="px" style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Week stats */}
        <div>
          <div className="section-header">
            <span className="t-card-h">{t('home.week_stats')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard
              label={t('home.sessions')}
              value={weekStats.count}
              unit=""
              icon={<IconFlame size={14} color="var(--ag-orange)" />}
            />
            <StatCard
              label={t('home.volume')}
              value={weekStats.volume}
              unit={userProfile?.weightUnit || 'kg'}
              icon={<IconWeight size={14} color="var(--ag-orange)" />}
            />
            <StatCard
              label={t('home.avg_duration')}
              value={weekStats.avgDuration}
              unit="min"
              icon={<IconClock size={14} color="var(--ag-orange)" />}
            />
            <StatCard
              label={t('home.pr_today')}
              value={weekStats.pr}
              unit={userProfile?.weightUnit || 'kg'}
              icon={<IconTrophy size={14} color="var(--ag-orange)" />}
            />
          </div>
        </div>

        {/* Last session */}
        {lastSession && (
          <div>
            <div className="section-header">
              <span className="t-card-h">{t('home.last_session')}</span>
              <button className="btn-ghost" onClick={() => navigate('/progres')}>
                {t('common.done')} <IconArrowRight size={14} />
              </button>
            </div>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/progres')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="t-card-h">{lastSession.programName || 'Libre'}</div>
                  <div className="t-label" style={{ marginTop: 4 }}>{formatDate(lastSession.startedAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-1px' }}>
                    {lastSession.totalVolume || 0}
                    <span className="t-unit" style={{ fontSize: 12, marginLeft: 2 }}>{userProfile?.weightUnit || 'kg'}</span>
                  </div>
                  <div className="t-label">{lastSession.durationMinutes || 0} min</div>
                </div>
              </div>
              {/* Muscle summary */}
              {lastSession.exercises?.length > 0 && (
                <div className="scroll-row" style={{ marginTop: 12 }}>
                  {[...new Set(lastSession.exercises.map(e => e.muscleGroup).filter(Boolean))].map(mg => (
                    <span key={mg} className="pill" style={{ fontSize: 11, padding: '3px 8px', background: `${muscleColor(mg)}22`, color: muscleColor(mg), borderColor: `${muscleColor(mg)}40` }}>
                      {t(`exercise.muscles.${mg}`)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested program */}
        {suggestedProgram && (
          <div>
            <div className="section-header">
              <span className="t-card-h">{t('home.next_program')}</span>
            </div>
            <div
              className="card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
              onClick={() => navigate('/seance', { state: { program: suggestedProgram } })}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--ag-radius-sm)',
                background: 'var(--ag-orange-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <IconDumbbell size={20} color="var(--ag-orange)" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t-card-h">{suggestedProgram.name}</div>
                <div className="t-label" style={{ marginTop: 2 }}>
                  {suggestedProgram.exercises?.length || 0} {t('programme.exercises')}
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 16px', fontSize: 13 }}
                onClick={e => { e.stopPropagation(); navigate('/seance', { state: { program: suggestedProgram } }) }}
              >
                <IconPlay size={14} />
                {t('programme.start')}
              </button>
            </div>
          </div>
        )}

        {/* No session nudge */}
        {!sessLoading && sessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ag-muted)' }}>
            <IconDumbbell size={32} color="var(--ag-hint)" />
            <div style={{ marginTop: 12, fontSize: 14 }}>{t('home.no_session_yet')}</div>
            <button className="btn-primary" onClick={() => navigate('/seance')} style={{ marginTop: 16 }}>
              <IconPlay size={16} />
              {t('home.start_session')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="card-stat">
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        {icon}
        <span className="t-label">{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-1.5px', lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span className="t-unit" style={{ fontSize: 13 }}>{unit}</span>}
      </div>
    </div>
  )
}
