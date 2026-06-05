import { useState, useEffect, useRef, useCallback } from 'react'
import { IconCheck } from '../../components/Icons'

export default function CardioTimer({ exName, onComplete }) {
  const [running, setRunning]   = useState(false)
  const [elapsed, setElapsed]   = useState(0)
  const [distance, setDistance] = useState('')
  const [started, setStarted]   = useState(false)
  const startRef   = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const toggle = useCallback(() => {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      if (!started) setStarted(true)
      startRef.current = Date.now() - elapsed * 1000
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      }, 200)
      setRunning(true)
    }
  }, [running, elapsed, started])

  const handleComplete = () => {
    clearInterval(intervalRef.current)
    onComplete({ elapsed, distance: distance ? Number(distance) : null })
  }

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const formatted = h > 0
    ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`

  const fontSize = h > 0 ? 46 : 64

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Exercise name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#00C4A7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Cardio
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>{exName}</div>
      </div>

      {/* Big tap-to-toggle timer */}
      <button
        onClick={toggle}
        style={{
          cursor: 'pointer', border: 'none', background: 'transparent',
          width: '100%', padding: 0, WebkitTapHighlightColor: 'transparent'
        }}
        aria-label={running ? 'Pause' : started ? 'Reprendre' : 'Démarrer'}
      >
        <div style={{
          borderRadius: 'var(--ag-radius)',
          background: running ? 'rgba(0,196,167,0.07)' : 'var(--ag-surface)',
          border: `2px solid ${running ? '#00C4A7' : (started ? 'var(--ag-border)' : 'var(--ag-border)')}`,
          padding: '32px 24px 28px',
          textAlign: 'center',
          transition: 'border-color 300ms, background 300ms',
          animation: running ? 'cardio-pulse 2s ease-in-out infinite' : 'none',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Running glow */}
          {running && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(0,196,167,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
          )}

          {/* Time digits */}
          <div style={{
            fontSize,
            fontWeight: 800,
            fontStyle: 'italic',
            letterSpacing: '-2px',
            color: running ? '#00C4A7' : (started ? 'var(--ag-text)' : 'var(--ag-muted)'),
            lineHeight: 1,
            transition: 'color 300ms',
            fontFamily: 'Syne, sans-serif',
            position: 'relative', zIndex: 1,
          }}>
            {formatted}
          </div>

          {/* Status label */}
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            color: running ? '#00C4A7' : 'var(--ag-muted)',
            marginTop: 14, transition: 'color 300ms',
            position: 'relative', zIndex: 1,
          }}>
            {running
              ? '● EN COURS'
              : started
                ? 'EN PAUSE · TAP POUR REPRENDRE'
                : 'TAP POUR DÉMARRER'
            }
          </div>
        </div>
      </button>

      {/* Distance input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: 'var(--ag-surface)',
        borderRadius: 'var(--ag-radius)',
        border: '1px solid var(--ag-border)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Distance</div>
          <div style={{ fontSize: 11, color: 'var(--ag-muted)' }}>optionnel</div>
        </div>
        <input
          type="number" min="0" step="0.1"
          value={distance}
          onChange={e => setDistance(e.target.value)}
          placeholder="0.0"
          className="num-input"
          style={{ width: 72 }}
        />
        <span style={{ fontSize: 13, color: 'var(--ag-muted)', fontWeight: 700, minWidth: 24 }}>km</span>
      </div>

      {/* Done button */}
      <button
        className="btn-primary"
        onClick={handleComplete}
        disabled={!started}
        style={{
          opacity: started ? 1 : 0.4,
          background: started ? '#00C4A7' : undefined,
          borderColor: started ? '#00C4A7' : undefined,
        }}
      >
        <IconCheck size={16} />
        Terminé{elapsed > 0 ? ` — ${formatted}` : ''}
      </button>
    </div>
  )
}
