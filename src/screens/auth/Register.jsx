import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { IconGoogle, IconChevronLeft } from '../../components/Icons'

export default function Register() {
  const { t } = useTranslation()
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const mapError = (code) => {
    const map = {
      'auth/email-already-in-use': t('auth.errors.email_in_use'),
      'auth/invalid-email': t('auth.errors.invalid_email'),
      'auth/weak-password': t('auth.errors.weak_password')
    }
    return map[code] || t('common.error')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError(t('auth.errors.passwords_mismatch'))
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/onboarding')
    } catch (err) {
      setError(mapError(err.code))
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/onboarding')
    } catch (_) {
      setError(t('common.error'))
    }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <Link to="/" className="btn-icon" aria-label={t('auth.back_home')} style={{ marginTop: 24, textDecoration: 'none' }}>
        <IconChevronLeft size={18} />
      </Link>

      <div style={{ paddingTop: 20, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <img src="/icons/fav.png" alt="AGBAZA" style={{ width: 44, height: 44, borderRadius: 10 }} />
          <img src="/icons/textW.png" alt="AGBAZA" style={{ height: 28, width: 'auto' }} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
          {t('auth.create_account')}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--ag-muted)' }}>
          {t('tagline')}
        </div>
      </div>

      <button className="btn-secondary" onClick={handleGoogle} disabled={loading} style={{ gap: 10 }}>
        <IconGoogle size={18} />
        {t('auth.google_sign_in')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div className="divider" style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ag-muted)' }}>{t('auth.or')}</span>
        <div className="divider" style={{ flex: 1 }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="input-group">
          <label className="input-label">{t('auth.email')}</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="input-group">
          <label className="input-label">{t('auth.password')}</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
        </div>
        <div className="input-group">
          <label className="input-label">{t('auth.confirm_password')}</label>
          <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
        </div>

        {error && (
          <div style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', borderRadius: 'var(--ag-radius-xs)', padding: '10px 14px', fontSize: 13, color: '#F43F5E' }}>
            {error}
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? t('common.loading') : t('auth.register')}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ag-muted)' }}>
        {t('auth.have_account')}{' '}
        <Link to="/login" style={{ color: 'var(--ag-orange)', fontWeight: 700, textDecoration: 'none' }}>
          {t('auth.login')}
        </Link>
      </div>
    </div>
  )
}
