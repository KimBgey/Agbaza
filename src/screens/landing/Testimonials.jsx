import Reveal from './Reveal'
import Ticker from './Ticker'
import { TESTIMONIALS } from './content'

function initials(name) {
  return name.slice(0, 2).toUpperCase()
}

function TestimonialCard(t) {
  return (
    <div className="lp-testimonial-card">
      <p className="lp-testimonial-quote">« {t.quote} »</p>
      <div className="lp-testimonial-author">
        <div className="lp-avatar">{initials(t.name)}</div>
        <div>
          <div className="lp-testimonial-author-name">{t.name}</div>
          <div className="lp-testimonial-author-goal">{t.goal}</div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="lp-testimonials">
      <div className="lp-container">
        <Reveal as="span" className="lp-section-label">ILS S'Y SONT MIS</Reveal>
      </div>

      <Ticker items={TESTIMONIALS} direction="left" durationS={60} renderItem={TestimonialCard} />
    </section>
  )
}
