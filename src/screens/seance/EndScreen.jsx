import { useTranslation } from 'react-i18next'
import { IconTrophy, IconClock, IconWeight, IconDumbbell } from '../../components/Icons'

const END_IMG = 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=860&q=80'

export default function EndScreen({ exercisesDone, totalVolume, durationMinutes, weightUnit, onFinish }) {
  const { t } = useTranslation()

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--ag-bg)',
      display: 'flex', flexDirection: 'column',
      zIndex: 60, maxWidth: 430, margin: '0 auto'
    }}>
      {/* Hero image + mascot overlay */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
        <img
          src={END_IMG}
          alt="Session complete"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,15,15,0.4), rgba(15,15,15,0.98) 88%)'
        }} />
        {/* Mascot centré */}
        <img
          src="/icons/mascot.png"
          alt=""
          style={{
            position: 'absolute',
            bottom: 16, right: 16,
            height: 180,
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            opacity: 0.15,
            pointerEvents: 'none'
          }}
        />
        {/* Logo AGBAZA en haut à gauche */}
        <div style={{ position: 'absolute', top: 20, left: 16 }}>
          <img src="/icons/textW.png" alt="AGBAZA" style={{ height: 24, width: 'auto', opacity: 0.8 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: 'var(--ag-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            {t('end_screen.congrats')}
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-1px', lineHeight: 1 }}>
            {t('end_screen.title_1')}{' '}
            <span style={{ color: 'var(--ag-orange)' }}>{t('end_screen.title_2')}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 'auto' }}>
          <StatItem
            icon={<IconDumbbell size={18} color="var(--ag-orange)" />}
            label={t('end_screen.exercises_done')}
            value={exercisesDone}
            unit=""
          />
          <StatItem
            icon={<IconWeight size={18} color="var(--ag-orange)" />}
            label={t('end_screen.total_volume')}
            value={totalVolume}
            unit={weightUnit}
          />
          <StatItem
            icon={<IconClock size={18} color="var(--ag-orange)" />}
            label={t('end_screen.duration')}
            value={durationMinutes}
            unit="min"
          />
        </div>

        <button className="btn-primary" onClick={onFinish} style={{ marginTop: 32 }}>
          <IconTrophy size={16} />
          {t('end_screen.finish')}
        </button>
      </div>
    </div>
  )
}

function StatItem({ icon, label, value, unit }) {
  return (
    <div style={{
      background: 'var(--ag-surface)',
      borderRadius: 'var(--ag-radius)',
      border: '1px solid var(--ag-border)',
      padding: '14px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
    }}>
      {icon}
      <div style={{ fontSize: 24, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-1px', lineHeight: 1, textAlign: 'center' }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: 'var(--ag-orange)', marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10, color: 'var(--ag-muted)', textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        {label}
      </div>
    </div>
  )
}
