import Reveal from './Reveal'
import { FEATURES } from './content'

export default function Features() {
  return (
    <section id="features">
      {FEATURES.map((f) => (
        <div
          key={f.n}
          className={`lp-feature-band bg-${f.bg === 'bg' ? 'a' : 'b'}${f.imageSide === 'right' ? ' media-right' : ''}`}
        >
          <div className="lp-feature-row">
            <div
              className={`lp-feature-media fade-media fade-${f.fade}${f.tint ? ' tint-orange' : ''}`}
              style={{ '--section-bg': f.bg === 'bg' ? 'var(--ag-bg)' : 'var(--ag-surface)' }}
            >
              <img src={f.image} alt="" loading="lazy" />
            </div>

            <Reveal className="lp-feature-copy" as="div">
              <span className="lp-feature-num" aria-hidden="true">{f.n}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Reveal>
          </div>
        </div>
      ))}
    </section>
  )
}
