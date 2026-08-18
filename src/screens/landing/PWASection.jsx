import Reveal from './Reveal'
import { IMG, PWA_STEPS } from './content'

export default function PWASection() {
  return (
    <section id="download" className="lp-pwa">
      <div className="lp-pwa-media">
        <img src={IMG.orangeVivid} alt="" loading="lazy" />
      </div>
      <div className="lp-pwa-fade-bottom" aria-hidden="true" />
      <div className="lp-pwa-watermark" aria-hidden="true">100% Gratuit</div>

      <div className="lp-container">
        <Reveal className="lp-pwa-content" as="div">
          <h2>{'Dans ta poche.\nPas dans tes abonnements.'}</h2>
          <p>
            AGBAZA s'installe directement sur ton téléphone. Pas de Play Store. Pas d'App Store.
            Pas d'abonnement.
          </p>
          <div className="lp-pwa-steps">
            {PWA_STEPS.map((s, i) => (
              <div className="lp-pwa-step" key={i}>
                <span className="lp-pwa-step-num">{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
