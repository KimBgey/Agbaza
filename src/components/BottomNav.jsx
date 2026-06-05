import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconHome, IconList, IconPlay, IconChart, IconUser } from './Icons'

const SIDE_TABS = [
  [
    { path: '/',          labelKey: 'nav.home',      Icon: IconHome  },
    { path: '/programme', labelKey: 'nav.programme', Icon: IconList  },
  ],
  [
    { path: '/progres',   labelKey: 'nav.progres',   Icon: IconChart },
    { path: '/profil',    labelKey: 'nav.profil',    Icon: IconUser  },
  ],
]

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isSeanceActive = location.pathname === '/seance'

  return (
    <nav style={{
      position: 'fixed',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 24px)',
      maxWidth: 406,
      background: 'var(--ag-surface)',
      border: '1px solid var(--ag-border)',
      borderRadius: 16,
      padding: '6px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 30,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      {/* Left tabs */}
      {SIDE_TABS[0].map(({ path, labelKey, Icon }) => (
        <SideTab key={path} path={path} labelKey={labelKey} Icon={Icon}
          active={location.pathname === path} navigate={navigate} t={t} />
      ))}

      {/* Center FAB — Séance */}
      <button
        onClick={() => navigate('/seance')}
        aria-label={t('nav.seance')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '0',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          position: 'relative',
          flex: 'none',
          width: 64,
        }}
      >
        {/* Elevated orange disc */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: isSeanceActive
            ? 'var(--ag-orange)'
            : 'var(--ag-orange-dim)',
          boxShadow: isSeanceActive
            ? '0 0 0 4px rgba(245,94,0,0.25), 0 4px 16px rgba(245,94,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 150ms, box-shadow 150ms',
          marginTop: -20,
          border: `2px solid ${isSeanceActive ? 'rgba(255,255,255,0.2)' : 'rgba(245,94,0,0.4)'}`,
        }}>
          <IconPlay size={20} color="#fff" />
        </div>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'Syne, sans-serif',
          color: isSeanceActive ? 'var(--ag-orange)' : 'var(--ag-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          transition: 'color 150ms',
        }}>
          {t('nav.seance')}
        </span>
      </button>

      {/* Right tabs */}
      {SIDE_TABS[1].map(({ path, labelKey, Icon }) => (
        <SideTab key={path} path={path} labelKey={labelKey} Icon={Icon}
          active={location.pathname === path} navigate={navigate} t={t} />
      ))}
    </nav>
  )
}

function SideTab({ path, labelKey, Icon, active, navigate, t }) {
  return (
    <button
      onClick={() => navigate(path)}
      aria-label={t(labelKey)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '6px 4px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: active ? 'var(--ag-orange-soft)' : 'transparent',
        transition: 'background 150ms',
        minHeight: 48,
        minWidth: 44,
      }}
    >
      <Icon size={20} color={active ? 'var(--ag-orange)' : 'var(--ag-muted)'} />
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'Syne, sans-serif',
        color: active ? 'var(--ag-orange)' : 'var(--ag-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        transition: 'color 150ms',
      }}>
        {t(labelKey)}
      </span>
    </button>
  )
}
