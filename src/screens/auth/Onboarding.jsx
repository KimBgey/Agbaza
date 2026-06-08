import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { IconChevronLeft } from '../../components/Icons'

const GOALS = ['cut', 'bulk', 'maintain']
const DAYS  = [2, 3, 4, 5, 6]

export default function Onboarding() {
  const { t }                   = useTranslation()
  const { user, userProfile, saveProfile } = useAuth()
  const navigate                = useNavigate()
  const [step,        setStep]        = useState(0)
  const [name,        setName]        = useState(userProfile?.name  || '')
  const [weight,      setWeight]      = useState(userProfile?.weight?.toString() || '')
  const [weightUnit,  setWeightUnit]  = useState(userProfile?.weightUnit || 'kg')
  const [goal,        setGoal]        = useState(userProfile?.goal || 'bulk')
  const [trainingDays,setTrainingDays]= useState(userProfile?.trainingDays || 4)
  const [loading,     setLoading]     = useState(false)

  // Random tip — stable for this render
  const tip = useMemo(() => {
    const tips = t('onboarding.tips', { returnObjects: true })
    return tips[Math.floor(Math.random() * tips.length)]
  }, [])

  /* ── Returning user: motivational welcome ────────────────────── */
  if (userProfile) {
    return (
      <div className="auth-screen" style={{ textAlign: 'center' }}>
        <div style={{ paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <img src="/icons/textW.png" alt="AGBAZA" style={{ height: 34, width: 'auto' }} />

          <img
            src="/icons/mascot.png"
            alt=""
            style={{
              width: 130, height: 130, objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
              marginTop: 8
            }}
          />

          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
              {t('onboarding.welcome_back')}
              {userProfile.name ? ` ${userProfile.name}.` : ''}
            </div>
          </div>

          {/* Tip card */}
          <div style={{
            background: 'var(--ag-surface)',
            border: '1px solid var(--ag-border)',
            borderLeft: '3px solid var(--ag-orange)',
            borderRadius: 'var(--ag-radius)',
            padding: '16px 18px',
            textAlign: 'left',
            width: '100%',
          }}>
            <div style={{ fontSize: 11, color: 'var(--ag-orange)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              Conseil du jour
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{tip.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ag-muted)', lineHeight: 1.6 }}>{tip.body}</div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate('/')}
            style={{ marginTop: 8 }}
          >
            {t('onboarding.lets_go')}
          </button>
        </div>
      </div>
    )
  }

  /* ── New user: profile form ──────────────────────────────────── */
  const steps = [
    {
      key: 'name',
      label: t('onboarding.name'),
      content: (
        <div className="input-group">
          <label className="input-label">{t('onboarding.name')}</label>
          <input
            className="input"
            style={{ fontSize: 20, fontWeight: 700, padding: '16px 14px' }}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jordan"
            autoFocus
          />
        </div>
      ),
      valid: name.trim().length > 0
    },
    {
      key: 'weight',
      label: t('onboarding.weight'),
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">{t('onboarding.weight')}</label>
            <input
              className="input"
              style={{ fontSize: 20, fontWeight: 700, padding: '16px 14px' }}
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="80"
              min="30" max="300"
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['kg', 'lbs'].map(u => (
              <button key={u} onClick={() => setWeightUnit(u)}
                className={`pill ${weightUnit === u ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
                {u}
              </button>
            ))}
          </div>
        </div>
      ),
      valid: weight !== '' && Number(weight) > 0
    },
    {
      key: 'goal',
      label: t('onboarding.goal'),
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GOALS.map(g => (
            <button key={g} onClick={() => setGoal(g)} style={{
              background: goal === g ? 'var(--ag-orange-soft)' : 'var(--ag-surface)',
              border: `1px solid ${goal === g ? 'var(--ag-orange)' : 'var(--ag-border)'}`,
              borderRadius: 'var(--ag-radius)',
              padding: '16px 20px',
              color: goal === g ? 'var(--ag-orange)' : 'var(--ag-text)',
              fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              cursor: 'pointer', textAlign: 'left', transition: 'all 150ms'
            }}>
              {t(`onboarding.goals.${g}`)}
            </button>
          ))}
        </div>
      ),
      valid: true
    },
    {
      key: 'days',
      label: t('onboarding.training_days'),
      content: (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {DAYS.map(d => (
            <button key={d} onClick={() => setTrainingDays(d)}
              className={`pill ${trainingDays === d ? 'active' : ''}`}
              style={{ fontSize: 16, padding: '12px 20px', fontWeight: 800 }}>
              {d}
            </button>
          ))}
        </div>
      ),
      valid: true
    }
  ]

  const currentStep = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = async () => {
    if (!currentStep.valid) return
    if (!isLast) { setStep(s => s + 1); return }
    setLoading(true)
    try {
      await saveProfile({
        name: name.trim(),
        weight: Number(weight),
        weightUnit,
        goal,
        trainingDays,
        language: 'fr',
      })
      navigate('/')
    } catch (_) {}
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div style={{ paddingTop: 50 }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1,
              background: i <= step ? 'var(--ag-orange)' : 'var(--ag-border)',
              borderRadius: 2, transition: 'background 300ms'
            }} />
          ))}
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
          {t('onboarding.title')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ag-muted)', marginBottom: 36 }}>
          {currentStep.label}
        </div>

        {currentStep.content}

        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!currentStep.valid || loading}
          style={{ marginTop: 32 }}
        >
          {loading ? t('common.loading') : isLast ? t('onboarding.finish') : t('onboarding.continue')}
        </button>

        {step > 0 && (
          <button className="btn-ghost" onClick={() => setStep(s => s - 1)}
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            <IconChevronLeft size={16} />
            {t('common.back')}
          </button>
        )}
      </div>
    </div>
  )
}
