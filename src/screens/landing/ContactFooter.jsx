import Reveal from './Reveal'
import { IconMail, IconWhatsApp } from '../../components/Icons'
import { IMG } from './content'

const EMAIL = 'andrekimgbaguidi01@gmail.com'
const WHATSAPP = '22966337219'

export default function ContactFooter() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <section id="contact" className="lp-contact">
        <div className="lp-contact-media">
          <img src={IMG.orangeBlur} alt="" loading="lazy" />
        </div>
        <div className="lp-contact-fade-bottom" aria-hidden="true" />

        <div className="lp-container">
          <Reveal className="lp-contact-center" as="div">
            <h2>{'Tu as un retour ?\nUne idée ? Un bug ?'}</h2>
            <p className="lp-contact-sub">AGBAZA débute. Chaque retour sera lu personnellement.</p>

            <div className="lp-contact-links">
              <a className="lp-contact-link" href={`mailto:${EMAIL}`}>
                <span className="lp-contact-link-icon"><IconMail size={20} /></span>
                <span>
                  <span className="lp-contact-link-title" style={{ display: 'block' }}>Par email</span>
                  <span className="lp-contact-link-sub">{EMAIL}</span>
                </span>
              </a>
              <a className="lp-contact-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
                <span className="lp-contact-link-icon"><IconWhatsApp size={20} /></span>
                <span>
                  <span className="lp-contact-link-title" style={{ display: 'block' }}>Sur WhatsApp</span>
                  <span className="lp-contact-link-sub">Réponse rapide</span>
                </span>
              </a>
            </div>

            <p className="lp-contact-attr">
              Construit par <strong>Kim Gbaguidi</strong>, Cotonou, Bénin 🇧🇯
            </p>
          </Reveal>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <button className="lp-logo" onClick={scrollTop} aria-label="AGBAZA — retour en haut">
                <img src="/icons/mascot-white.png" alt="" className="lp-logo-mark" />
                <img src="/icons/textW.png" alt="AGBAZA" />
              </button>
              <span className="lp-footer-tagline">Gym tracker mobile-first. Gratuit.</span>
            </div>

            <nav className="lp-footer-links" aria-label="Liens du pied de page">
              <button onClick={() => scrollTo('features')}>Fonctionnalités</button>
              <button onClick={() => scrollTo('download')}>Télécharger</button>
              <button onClick={() => scrollTo('contact')}>Contact</button>
              <span>Politique de confidentialité</span>
            </nav>

            <div className="lp-footer-bottom">
              © 2026 AGBAZA · Fait avec 🔥 à Cotonou, Bénin
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
