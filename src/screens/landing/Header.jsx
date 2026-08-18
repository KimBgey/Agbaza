import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconMenu, IconX } from '../../components/Icons'

const NAV_LINKS = [
  { label: 'Fonctionnalités', id: 'features' },
  { label: 'Télécharger', id: 'download' },
  { label: 'Contact', id: 'contact' },
]

export default function Header() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className={`lp-header${scrolled || menuOpen ? ' is-scrolled' : ''}`}>
        <button className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="AGBAZA — retour en haut">
          <img src="/icons/mascot-white.png" alt="" className="lp-logo-mark" />
          <img src="/icons/textW.png" alt="AGBAZA" />
        </button>

        <nav className="lp-nav-desktop" aria-label="Navigation principale">
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}>{l.label}</button>
          ))}
        </nav>

        <div className="lp-header-actions">
          <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register') }} className="lp-btn lp-btn-orange">
            Commencer
          </a>
          <button
            className="lp-burger"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="lp-mobile-menu">
          {NAV_LINKS.map(l => (
            <button key={l.id} className="lp-mobile-link" onClick={() => scrollTo(l.id)}>{l.label}</button>
          ))}
        </div>
      )}
    </>
  )
}
