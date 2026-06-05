import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useExercises } from '../../hooks/useFirestore'
import { IconSearch, IconPlus, IconCheck, IconX } from '../../components/Icons'

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core']

function muscleColor(group) {
  const map = { chest:'#F55E00', back:'#4A6CF7', legs:'#2DA854', shoulders:'#C8A000', biceps:'#A855F7', triceps:'#A855F7', core:'#E11D48' }
  return map[group] || '#777'
}

// Unsplash image per exercise
function exerciseImg(name) {
  const term = encodeURIComponent(name.toLowerCase().replace(/\s+/g, ','))
  return `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&q=60`
}

export default function ExerciseLibrary({ selected = [], onSelect, onClose }) {
  const { t, i18n } = useTranslation()
  const { exercises, loading, addCustomExercise } = useExercises()
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customMuscle, setCustomMuscle] = useState('chest')
  const [customType, setCustomType] = useState('compound')
  const [customEquip, setCustomEquip] = useState('barbell')

  const lang = i18n.language || 'fr'

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const name = lang === 'fr' ? e.name_fr : e.name_en
      const matchMuscle = !filter || e.muscleGroup === filter
      const matchSearch = !search || name?.toLowerCase().includes(search.toLowerCase())
      return matchMuscle && matchSearch
    })
  }, [exercises, filter, search, lang])

  const getName = (e) => lang === 'fr' ? e.name_fr : e.name_en

  const isSelected = (id) => selected.some(s => s.exerciseId === id || s.id === id)

  const handleAddCustom = async () => {
    if (!customName.trim()) return
    const exercise = {
      name_fr: customName.trim(),
      name_en: customName.trim(),
      muscleGroup: customMuscle,
      type: customType,
      equipment: customEquip
    }
    await addCustomExercise(exercise)
    setShowCustom(false)
    setCustomName('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px', borderBottom: '1px solid var(--ag-border)' }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{t('programme.library')}</div>
        <button className="btn-icon" onClick={onClose} aria-label={t('common.cancel')}>
          <IconX size={16} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
        <IconSearch size={16} color="var(--ag-muted)" style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input"
          style={{ paddingLeft: 38 }}
          placeholder={t('create_program.search_exercise')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Muscle filter pills */}
      <div className="scroll-row" style={{ padding: '4px 16px 12px' }}>
        <button className={`pill ${!filter ? 'active' : ''}`} onClick={() => setFilter(null)}>
          {t('create_program.all_muscles')}
        </button>
        {MUSCLE_GROUPS.map(mg => (
          <button
            key={mg}
            className={`pill ${filter === mg ? 'active' : ''}`}
            style={filter !== mg ? { background: `${muscleColor(mg)}22`, color: muscleColor(mg), borderColor: `${muscleColor(mg)}40` } : {}}
            onClick={() => setFilter(filter === mg ? null : mg)}
          >
            {t(`exercise.muscles.${mg}`)}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12, marginBottom: 8 }} />
          ))
        ) : (
          <>
            {filtered.map(ex => {
              const sel = isSelected(ex.id)
              return (
                <div
                  key={ex.id}
                  className="set-row"
                  style={{
                    marginBottom: 8, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    borderColor: sel ? 'rgba(245,94,0,0.3)' : undefined,
                    background: sel ? 'var(--ag-orange-soft)' : undefined
                  }}
                  onClick={() => onSelect(ex)}
                >
                  {/* Background image */}
                  <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
                    backgroundImage: `url(${exerciseImg(getName(ex))})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: 0.08
                  }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
                    background: 'linear-gradient(to left, transparent, var(--ag-surface) 100%)'
                  }} />

                  <div style={{ flex: 1, zIndex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{getName(ex)}</div>
                    <div style={{ fontSize: 11, color: muscleColor(ex.muscleGroup), fontWeight: 600, marginTop: 2 }}>
                      {t(`exercise.muscles.${ex.muscleGroup}`)}
                      <span style={{ color: 'var(--ag-muted)', fontWeight: 400 }}>
                        {' · '}{t(`exercise.${ex.type}`)}
                        {' · '}{t(`exercise.equipment.${ex.equipment}`)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                      background: sel ? 'var(--ag-orange)' : 'var(--ag-surface2)',
                      border: `1px solid ${sel ? 'var(--ag-orange)' : 'var(--ag-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms'
                    }}
                  >
                    {sel ? <IconCheck size={13} color="#fff" /> : <IconPlus size={13} color="var(--ag-muted)" />}
                  </div>
                </div>
              )
            })}

            {/* Custom exercise button */}
            <button
              className="btn-secondary"
              onClick={() => setShowCustom(true)}
              style={{ marginTop: 8, marginBottom: 24 }}
            >
              <IconPlus size={16} />
              {t('exercise.custom_add')}
            </button>
          </>
        )}
      </div>

      {/* Custom exercise form */}
      {showCustom && (
        <div className="overlay">
          <div className="bottom-sheet">
            <div className="sheet-handle" />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{t('exercise.custom_add')}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">{t('exercise.custom_name')}</label>
                <input className="input" value={customName} onChange={e => setCustomName(e.target.value)} autoFocus />
              </div>

              <div className="input-group">
                <label className="input-label">{t('exercise.custom_muscle')}</label>
                <div className="scroll-row">
                  {MUSCLE_GROUPS.map(mg => (
                    <button key={mg} className={`pill ${customMuscle === mg ? 'active' : ''}`} onClick={() => setCustomMuscle(mg)}>
                      {t(`exercise.muscles.${mg}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['compound','isolation'].map(type => (
                    <button key={type} className={`pill ${customType === type ? 'active' : ''}`} onClick={() => setCustomType(type)} style={{ flex: 1, justifyContent: 'center' }}>
                      {t(`exercise.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setShowCustom(false)} style={{ flex: 1 }}>{t('common.cancel')}</button>
                <button className="btn-primary" onClick={handleAddCustom} style={{ flex: 1 }} disabled={!customName.trim()}>
                  {t('common.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
