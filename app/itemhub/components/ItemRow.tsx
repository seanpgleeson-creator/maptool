'use client'

import type { Item } from '@/lib/itemhub/types'

const styles = {
  row: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr auto auto auto',
    gap: '1rem',
    alignItems: 'start',
    padding: '1rem 0',
    borderBottom: '1px solid #e2e8f0',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    background: '#e2e8f0',
    objectFit: 'cover' as const,
  },
  info: { minWidth: 0 },
  title: { fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', marginBottom: 4 },
  ids: { fontSize: '0.75rem', color: '#64748b' },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: 500,
    background: '#fef9c3',
    color: '#854d0e',
    marginTop: 6,
  },
  initialPrice: { fontSize: '0.875rem', color: '#64748b' },
  msrpWrap: { display: 'flex', alignItems: 'center', gap: 4 },
  msrpLabel: { fontSize: '0.8125rem', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' as const },
  msrpInput: {
    width: 80,
    padding: '6px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    fontSize: '0.875rem',
  },
}

interface ItemRowProps {
  item: Item
  onMsrpChange: (value: number) => void
}

export function ItemRow({ item, onMsrpChange }: ItemRowProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    if (!Number.isNaN(v) && v >= 0) onMsrpChange(v)
  }

  return (
    <div style={styles.row}>
      <div style={{ width: 64, height: 64, borderRadius: 8, background: '#e2e8f0', overflow: 'hidden' }}>
        <img
          src={item.thumbnailUrl}
          alt=""
          style={styles.thumb}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <div style={styles.info}>
        <div style={styles.title}>{item.title}</div>
        <div style={styles.ids}>
          TCIN: {item.tcin} · UPC: {item.upc} · DPCI: {item.dpci}
        </div>
        <span style={styles.tag}>PENDING SETUP</span>
      </div>
      <div style={styles.initialPrice}>
        $ {item.initialRetailPrice.toLocaleString()}
      </div>
      <div style={styles.msrpWrap}>
        <label style={styles.msrpLabel} htmlFor={`msrp-${item.id}`}>
          MSRP (in $)*
        </label>
        <input
          id={`msrp-${item.id}`}
          type="number"
          min={0}
          step={0.01}
          value={item.msrp}
          onChange={handleChange}
          style={styles.msrpInput}
          aria-required
        />
      </div>
    </div>
  )
}
