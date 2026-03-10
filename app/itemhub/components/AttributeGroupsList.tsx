'use client'

const styles = {
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  progressRing: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid #e2e8f0',
    borderTopColor: '#eab308',
    transform: 'rotate(-90deg)',
    flexShrink: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  itemSelected: {
    background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)',
    color: '#1d4ed8',
    fontWeight: 500,
  },
  itemIcon: { width: 18, height: 18, textAlign: 'center' as const },
  itemPct: { marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 500 },
  bar: {
    height: 4,
    borderRadius: 2,
    background: '#e2e8f0',
    overflow: 'hidden' as const,
    width: 48,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    background: '#2563eb',
  },
}

const groups = [
  { id: 'basic', label: 'Basic Details', icon: '🏷', pct: 40, selected: false },
  { id: 'media', label: 'Media', icon: '📷', pct: 30, selected: false },
  { id: 'content', label: 'Content', icon: '📄', pct: 10, selected: false },
  { id: 'pricing', label: 'Pricing', icon: '💰', pct: 100, selected: true },
]

export function AttributeGroupsList() {
  return (
    <div>
      <div style={styles.title}>
        <span style={styles.progressRing} aria-hidden />
        Attribute Groups
        <span style={{ marginLeft: 4, fontSize: '0.75rem', color: '#64748b' }}>40%</span>
      </div>
      <ul style={styles.list}>
        {groups.map((g) => (
          <li
            key={g.id}
            style={{
              ...styles.item,
              ...(g.selected ? styles.itemSelected : {}),
            }}
          >
            <span style={styles.itemIcon}>{g.icon}</span>
            {g.label}
            <span style={styles.itemPct}>{g.pct}%</span>
            <div style={styles.bar}>
              <div style={{ ...styles.barFill, width: `${g.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
