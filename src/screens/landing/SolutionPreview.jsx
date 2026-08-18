import Reveal from './Reveal'
import { IMG, SOLUTION_STATS } from './content'

export default function SolutionPreview() {
  return (
    <section className="lp-solution">
      <div className="lp-solution-grid">
        <div className="lp-solution-media has-mockup">
          <img src={IMG.mockup} alt="Écran d'accueil de l'app AGBAZA : streak, stats de la semaine, dernière séance" loading="lazy" />
        </div>

        <Reveal className="lp-solution-text" as="div">
          <h2>{'AGBAZA\nrésout ça.'}</h2>
          <p>
            Un programme clair, une séance guidée en temps réel, une vue honnête sur ta progression.
            Sans mur payant.
          </p>
          <div className="lp-solution-stats">
            {SOLUTION_STATS.map((s) => (
              <div key={s.label}>
                <div className="lp-solution-stat-value">{s.value}</div>
                <div className="lp-solution-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
