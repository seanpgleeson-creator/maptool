'use client'

import { useState } from 'react'
import { useItemHub } from '@/lib/itemhub/ItemHubProvider'
import { ItemRow } from './ItemRow'
import { MAPSection } from './MAPSection'

const styles = {
  header: {
    marginBottom: '1rem',
  },
  title: { fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' },
  subHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  itemCount: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.875rem',
    color: '#475569',
  },
  expandBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 4,
    fontSize: '1rem',
    color: '#64748b',
  },
  toggleRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  toggleBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: '0.8125rem',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    background: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  navBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#475569',
  },
}

export function PricingCard() {
  const { state, setItemMsrp, setSubmission, submitForReview, getSubmissionForItem } = useItemHub()
  const items = state.items
  const [expanded, setExpanded] = useState(true)
  const [editEachItem, setEditEachItem] = useState(true) // "Edit each item" active
  const [currentIndex, setCurrentIndex] = useState(0)

  const count = items.length
  const currentItem = items[currentIndex]
  const canPrev = currentIndex > 0
  const canNext = currentIndex < count - 1

  const displayItems = editEachItem ? (currentItem ? [currentItem] : []) : items

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Pricing</h2>
        <p style={styles.subtitle}>Provide attributes such as MSRP and MAP.</p>
        <div style={styles.subHeader}>
          <div style={styles.itemCount}>
            <span>Pricing</span>
            <span>{String(count).padStart(2, '0')} Items</span>
            <button
              type="button"
              style={styles.expandBtn}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
          <div style={styles.toggleRow}>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(editEachItem ? {} : styles.toggleBtnActive),
              }}
              onClick={() => setEditEachItem(false)}
            >
              Apply to all items
            </button>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(editEachItem ? styles.toggleBtnActive : {}),
              }}
              onClick={() => setEditEachItem(true)}
            >
              Edit each item
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <>
          {displayItems.map((item) => (
            <div key={item.id}>
              <ItemRow
                item={item}
                onMsrpChange={(msrp) => setItemMsrp(item.id, msrp)}
              />
              <MAPSection
                item={item}
                submission={getSubmissionForItem(item.id)}
                onSubmissionChange={(sub) => setSubmission(item.id, sub)}
                onSubmitForReview={() => submitForReview(item.id)}
                hasNearOrAboveMarketFlag={(() => {
                  const sub = getSubmissionForItem(item.id)
                  return sub
                    ? state.flags.some(
                        (f) =>
                          f.submissionId === sub.id &&
                          (f.type === 'MAP_NEAR_MARKET' || f.type === 'MAP_ABOVE_MARKET')
                      )
                    : false
                })()}
              />
            </div>
          ))}

          {editEachItem && count > 1 && (
            <div style={styles.navRow}>
              <button
                type="button"
                style={styles.navBtn}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
                aria-label="Previous item"
              >
                ‹
              </button>
              <button
                type="button"
                style={styles.navBtn}
                onClick={() => setCurrentIndex((i) => Math.min(count - 1, i + 1))}
                disabled={!canNext}
                aria-label="Next item"
              >
                ›
              </button>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Item {currentIndex + 1} of {count}
              </span>
              <button
                type="button"
                style={styles.navBtn}
                onClick={() => setCurrentIndex(0)}
                aria-label="Refresh / first item"
              >
                ↻
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
