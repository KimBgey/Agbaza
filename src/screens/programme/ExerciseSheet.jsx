import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AnatomyChart from '../../components/AnatomyChart'
import { IconChevronLeft, IconPlus } from '../../components/Icons'

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48', cardio:'#00C4A7' }
  return map[group] || '#888'
}

function VideoHero({ videoId, title }) {
  const [ready, setReady] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#111', overflow: 'hidden' }}>
      {/* Skeleton while iframe loads */}
      {!ready && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      )}

      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setReady(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          border: 'none',
          opacity: ready ? 1 : 0,
          transition: 'opacity 350ms',
        }}
      />
    </div>
  )
}

function VideoPlaceholder() {
  return (
    <div style={{
      width: '100%', height: 180, background: '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img
        src="/icons/mascot.png"
        alt=""
        style={{ width: 72, objectFit: 'contain', opacity: 0.12, filter: 'brightness(0) invert(1)' }}
      />
    </div>
  )
}

export default function ExerciseSheet({ exercise, onClose, onAdd }) {
  const { t, i18n } = useTranslation()

  const lang    = i18n.language || 'fr'
  const name    = lang === 'fr' ? exercise.name_fr : (exercise.name_en || exercise.name_fr)
  const mgColor = muscleColor(exercise.muscleGroup)

  const tMuscle = (rawName) => {
    if (!rawName) return ''
    const key = `exercise.muscle_names.${rawName.toLowerCase().replace(/[\s-]+/g, '_')}`
    const result = t(key)
    return result === key ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : result
  }

  const hasVideo   = !!exercise.youtubeVideoId
  const hasMuscles = !!exercise.targetMuscle

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--ag-bg)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 220ms cubic-bezier(.32,.72,0,1)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderBottom: '1px solid var(--ag-border)',
        flexShrink: 0,
      }}>
        <button className="btn-icon" onClick={onClose} aria-label={t('common.back')} style={{ flexShrink: 0 }}>
          <IconChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </div>
        </div>
        <span
          className="pill"
          style={{ flexShrink: 0, fontSize: 11, background: `${mgColor}22`, color: mgColor, borderColor: `${mgColor}44` }}
        >
          {t(`exercise.muscles.${exercise.muscleGroup}`)}
        </span>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: onAdd ? 88 : 24 }}>

        {/* Video hero — YouTube embed or placeholder */}
        {hasVideo
          ? <VideoHero videoId={exercise.youtubeVideoId} title={name} />
          : <VideoPlaceholder />
        }

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Type + equipment pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {exercise.type && (
              <span className="pill" style={{ fontSize: 12 }}>{t(`exercise.${exercise.type}`)}</span>
            )}
            {exercise.equipment && (
              <span className="pill" style={{ fontSize: 12 }}>{t(`exercise.equipment.${exercise.equipment}`)}</span>
            )}
          </div>

          {/* Anatomy chart */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ag-muted)', marginBottom: 12 }}>
              {t('exercise.sheet.target_muscles')}
            </div>
            <AnatomyChart
              targetMuscle={exercise.targetMuscle}
              secondaryMuscles={exercise.secondaryMuscles}
              muscleGroup={exercise.muscleGroup}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8003D', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--ag-muted)' }}>{t('exercise.sheet.primary')}</span>
              </div>
              {(exercise.secondaryMuscles?.length > 0) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B6B', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--ag-muted)' }}>{t('exercise.sheet.secondary')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Muscle name tags */}
          {hasMuscles && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ag-muted)', marginBottom: 10 }}>
                {t('exercise.sheet.muscles')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="pill" style={{ background: 'rgba(232,0,61,0.15)', color: '#E8003D', borderColor: 'rgba(232,0,61,0.3)' }}>
                  {tMuscle(exercise.targetMuscle)}
                </span>
                {exercise.secondaryMuscles?.map(m => (
                  <span key={m} className="pill" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', borderColor: 'rgba(255,107,107,0.25)' }}>
                    {tMuscle(m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasMuscles && !hasVideo && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--ag-muted)' }}>
              <div style={{ fontSize: 13 }}>{t('exercise.sheet.empty_state')}</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>{t('exercise.sheet.empty_hint')}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky add button ───────────────────────────────────────────── */}
      {onAdd && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(to top, var(--ag-bg) 75%, transparent)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}>
          <button className="btn-primary" onClick={() => { onAdd(exercise); onClose() }}>
            <IconPlus size={16} />
            {t('exercise.sheet.add_to_session')}
          </button>
        </div>
      )}
    </div>
  )
}
