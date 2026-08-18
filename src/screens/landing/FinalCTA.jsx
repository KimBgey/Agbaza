import { useNavigate } from 'react-router-dom'
import Reveal from './Reveal'
import { IMG } from './content'

export default function FinalCTA() {
  const navigate = useNavigate()

  return (
    <section className="lp-final-cta">
      <div className="lp-final-cta-media fade-media fade-all" style={{ '--section-bg': 'var(--ag-bg)' }}>
        <img src={IMG.groupTraining} alt="Entraînement en groupe, ambiance chaleureuse" loading="lazy" />
      </div>
      <div className="lp-container">
        <Reveal as="div" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>{'Ta première séance\ncommence maintenant.'}</h2>
          <p className="lp-hero-sub">Gratuit. Sans carte bancaire. Installable en 10 secondes.</p>
          <button className="lp-btn lp-btn-orange lp-btn-lg" onClick={() => navigate('/register')}>
            Commencer gratuitement →
          </button>
          <a href="/login" className="lp-final-cta-login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
            Déjà utilisateur ? Connexion →
          </a>
        </Reveal>
      </div>
    </section>
  )
}
