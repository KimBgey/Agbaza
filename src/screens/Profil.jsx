import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { collection, getDocs, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../firebase'
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
  const [confirm, setConfirm] = useState(null) // 'history' | 'all'
  const [clearing, setClearing] = useState(false)

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

  const clearHistory = async () => {
    if (!user) return
    setClearing(true)
    try {
      const snap = await getDocs(collection(db, `agbaza_sessions/${user.uid}/sessions`))
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
      localStorage.removeItem('ag_active_session')
    } finally {
      setClearing(false)
      setConfirm(null)
    }
  }

  const clearAll = async () => {
    if (!user) return
    setClearing(true)
    try {
      // Sessions
      const sessions = await getDocs(collection(db, `agbaza_sessions/${user.uid}/sessions`))
      await Promise.all(sessions.docs.map(d => deleteDoc(d.ref)))
      // Programs
      const programs = await getDocs(collection(db, `agbaza_programs/${user.uid}/programs`))
      await Promise.all(programs.docs.map(d => deleteDoc(d.ref)))
      // Custom exercises
      const customQ = query(collection(db, 'agbaza_exercises'), where('createdBy', '==', user.uid), where('isCustom', '==', true))
      const customs = await getDocs(customQ)
      await Promise.all(customs.docs.map(d => deleteDoc(d.ref)))
      // localStorage
      localStorage.removeItem('ag_active_session')
    } finally {
      setClearing(false)
      setConfirm(null)
    }
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

        {/* ── Danger zone ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ag-muted)' }}>
            Zone danger
          </div>

          <button
            className="btn-secondary"
            onClick={() => setConfirm('history')}
            style={{ borderColor: '#E11D48', color: '#E11D48' }}
          >
            Effacer l'historique
          </button>

          <button
            className="btn-secondary"
            onClick={() => setConfirm('all')}
            style={{ borderColor: '#E11D48', color: '#E11D48' }}
          >
            Tout effacer
          </button>
        </div>

        {/* Logout */}
        <button
          className="btn-secondary"
          onClick={logout}
          style={{ marginBottom: 24 }}
        >
          {t('profil.logout')}
        </button>
      </div>

      {/* ── Confirm modal ───────────────────────────────────────────────────── */}
      {confirm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => !clearing && setConfirm(null)}
        >
          <div
            style={{ background: 'var(--ag-surface)', borderRadius: '20px 20px 0 0', borderTop: '1px solid var(--ag-border)', width: '100%', maxWidth: 430, padding: '24px 20px 36px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, background: 'var(--ag-hint)', borderRadius: 2, margin: '0 auto 20px' }} />

            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
              {confirm === 'history' ? "Effacer l'historique ?" : 'Tout effacer ?'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ag-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              {confirm === 'history'
                ? 'Toutes tes séances passées seront supprimées définitivement. Tes programmes restent intacts.'
                : 'Toutes tes séances, tous tes programmes et tes exercices personnalisés seront supprimés définitivement.'}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setConfirm(null)}
                disabled={clearing}
                style={{ flex: 1 }}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={confirm === 'history' ? clearHistory : clearAll}
                disabled={clearing}
                style={{ flex: 1, background: '#E11D48' }}
              >
                {clearing ? 'Suppression…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
