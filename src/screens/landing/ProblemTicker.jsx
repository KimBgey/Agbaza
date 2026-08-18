import Reveal from './Reveal'
import Ticker from './Ticker'
import { PROBLEM_ROW_1, PROBLEM_ROW_2 } from './content'

function renderQuote(text) {
  return (
    <div className="lp-problem-card">
      <p>{text}</p>
    </div>
  )
}

export default function ProblemTicker() {
  return (
    <section className="lp-problem">
      <div className="lp-container">
        <Reveal as="span" className="lp-section-label">LE PROBLÈME</Reveal>
      </div>

      <div className="lp-problem-rows">
        <Ticker items={PROBLEM_ROW_1} direction="left" durationS={40} renderItem={renderQuote} />
        <Ticker items={PROBLEM_ROW_2} direction="right" durationS={40} renderItem={renderQuote} />
      </div>
    </section>
  )
}
