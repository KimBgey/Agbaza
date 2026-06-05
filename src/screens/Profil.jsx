import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import i18n from '../i18n'
import { IconCheck } from '../components/Icons'

const GOALS = ['cut', 'bulk', 'maintain']
const DAYS = [2, 3, 4, 5, 6]

export default function Profil() {
  const { t } = useTranslation()
  const { user, userProfile, saveProfile, logout } = useAuth()

  const [name, setName] = useState(userProfile?.name || '')
  const [weight, setWeight] = useState(userProfile?.weight || '')
  const [weightUnit, setWeightUnit] = useState(userProfile?.weightUnit || 'kg')
  const [goal, setGoal] = useState(userProfile?.goal || 'bulk')
  const [trainingDays, setTrainingDays] = useState(userProfile?.trainingDays || 4)
  const [language, setLanguage] = useState(userProfile?.language || 'fr')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '')
      setWeight(userProfile.weight || '')
      setWeightUnit(userProfile.weightUnit || 'kg')
      setGoal(userProfile.goal || 'bulk')
      setTrainingDays(userProfile.trainingDays || 4)
      setLanguage(userProfile.language || 'fr')
    }
  }, [userProfile])

  const handleSave = async () => {
    setSaving(true)
    await saveProfile({ name, weight: Number(weight), weightUnit, goal, trainingDays, language })
    i18n.changeLanguage(language)
    localStorage.setItem('ag_lang', language)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const initials = (name || user?.email || 'A').slice(0, 2).toUpperCase()

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="screen">
      <div className="px pt" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 className="t-title">{t('profil.title')}</h1>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--ag-orange-soft)',
            border: '2px solid var(--ag-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'var(--ag-orange)'
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{name || user?.displayName || 'Athlète'}</div>
            <div className="t-label">{user?.email}</div>
            {memberSince && (
              <div className="t-label" style={{ marginTop: 2 }}>
                {t('profil.member_since')} {memberSince}
              </div>
            )}
          </div>
        </div>

        <div className="divider" />

        {/* Name */}
        <div className="input-group">
          <label className="input-label">{t('profil.name')}</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Jordan" />
        </div>

        {/* Weight */}
        <div className="input-group">
          <label className="input-label">{t('profil.weight')}</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input"
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="80"
              style={{ flex: 1 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              {['kg', 'lbs'].map(u => (
                <button key={u} className={`pill ${weightUnit === u ? 'active' : ''}`} onClick={() => setWeightUnit(u)}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="input-group">
          <label className="input-label">{t('profil.goal')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {GOALS.map(g => (
              <button key={g} className={`pill ${goal === g ? 'active' : ''}`} onClick={() => setGoal(g)} style={{ flex: 1, justifyContent: 'center' }}>
                {t(`onboarding.goals.${g}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Training days */}
        <div className="input-group">
          <label className="input-label">{t('profil.training_days')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAYS.map(d => (
              <button key={d} className={`pill ${trainingDays === d ? 'active' : ''}`} onClick={() => setTrainingDays(d)} style={{ flex: 1, justifyContent: 'center', fontWeight: 800 }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="input-group">
          <label className="input-label">{t('profil.language')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ val: 'fr', label: '🇫🇷 Français' }, { val: 'en', label: '🇬🇧 English' }].map(l => (
              <button key={l.val} className={`pill ${language === l.val ? 'active' : ''}`} onClick={() => setLanguage(l.val)} style={{ flex: 1, justifyContent: 'center' }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Save */}
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <IconCheck size={16} color="#fff" />
              {t('profil.saved')}
            </>
          ) : saving ? t('common.loading') : t('profil.save')}
        </button>

        {/* Logout */}
        <button
          className="btn-secondary"
          onClick={logout}
          style={{ borderColor: '#E11D48', color: '#E11D48', marginBottom: 24 }}
        >
          {t('profil.logout')}
        </button>
      </div>
    </div>
  )
}
