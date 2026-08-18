import { useNavigate } from 'react-router-dom'
import { IMG } from './content'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="lp-hero">
      <div className="lp-hero-media">
        <img src={IMG.runner} alt="Coureur en mouvement, énergie" loading="eager" fetchpriority="high" />
      </div>

      <div className="lp-hero-content">
        <h1 className="lp-hero-title">
          La salle,{'\n'}enfin{'\n'}<span className="t-orange">maîtrisée.</span>
        </h1>
        <p className="lp-hero-sub">
          Fini l'improvisation. AGBAZA te donne un programme, un timer et une progression claire — gratuitement.
        </p>
        <div className="lp-hero-ctas">
          <button className="lp-btn lp-btn-orange lp-btn-lg" onClick={() => navigate('/register')}>
            Commencer gratuitement
          </button>
          <button
            className="lp-btn lp-btn-ghost-white lp-btn-lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Voir comment ça marche
          </button>
        </div>
      </div>
    </section>
  )
}
