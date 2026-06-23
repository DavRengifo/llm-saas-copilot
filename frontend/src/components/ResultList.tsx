interface Props {
  label: string
  items: string[]
  accent?: string
}

export function ResultList({ label, items, accent }: Props) {
  if (items.length === 0) return null
  return (
    <div className="result-section" style={accent ? { '--accent-color': accent } as React.CSSProperties : undefined}>
      <h4 className="result-section-title">{label}</h4>
      <ul className="result-list">
        {items.map((item, i) => (
          <li key={i} className="result-list-item">
            <span className="result-dot" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
