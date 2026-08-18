export default function Ticker({ items, direction = 'left', durationS = 40, renderItem, className = '', trackClassName = '' }) {
  const loop = [...items, ...items]
  return (
    <div className={`ticker ${className}`}>
      <div
        className={`ticker-track ticker-${direction} ${trackClassName}`}
        style={{ animationDuration: `${durationS}s` }}
      >
        {loop.map((item, i) => (
          <span className="ticker-item" key={i} aria-hidden={i >= items.length}>
            {renderItem(item)}
          </span>
        ))}
      </div>
    </div>
  )
}
