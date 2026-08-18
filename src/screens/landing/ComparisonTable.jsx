import Reveal from './Reveal'
import { IconCheck } from '../../components/Icons'
import { COMPARISON_ROWS } from './content'

export default function ComparisonTable() {
  return (
    <section className="lp-compare">
      <div className="lp-container">
        <Reveal as="h2">Ce que les autres cachent.</Reveal>
        <Reveal as="p" className="lp-compare-sub">AGBAZA le donne gratuitement.</Reveal>

        <Reveal>
          <div style={{ overflowX: 'auto' }}>
            <table className="lp-compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="is-us">AGBAZA</th>
                  <th>Apps payantes</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td style={{ fontWeight: 600 }}>{row.label}</td>
                    <td>
                      {row.label === 'Prix' ? (
                        <span className="lp-compare-yes" style={{ fontStyle: 'italic' }}>{row.us}</span>
                      ) : (
                        <span className="lp-compare-yes"><IconCheck size={14} /> {row.us}</span>
                      )}
                    </td>
                    <td>
                      <span className={`lp-compare-no${row.label !== 'Prix' ? ' is-strike' : ''}`}>{row.them}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
