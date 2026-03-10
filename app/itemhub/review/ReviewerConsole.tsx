'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useItemHub } from '@/lib/itemhub/ItemHubProvider'
import type { MAPSubmission, Item, MerchantFlag } from '@/lib/itemhub/types'

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  CHANGES_REQUESTED: 'Changes requested',
  ACCEPTED: 'Accepted',
  NOT_ACCEPTED: 'Not accepted',
  EXPIRED: 'Expired',
}

const FLAG_LABELS: Record<string, string> = {
  MAP_ABOVE_MARKET: 'MAP above market price',
  MAP_NEAR_MARKET: 'MAP near market price',
  COMP_INTEL_STALE: 'Market data may be stale',
}

function getEffectiveStatus(sub: MAPSubmission): string {
  if (sub.metadata?.expirationDate && new Date(sub.metadata.expirationDate) < new Date()) {
    return 'EXPIRED'
  }
  return sub.status
}

const styles = {
  layout: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' },
  tableWrap: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.8125rem' },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a' },
  trClick: { cursor: 'pointer' as const },
  trSelected: { background: '#eff6ff' },
  pill: { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500, marginRight: 4, marginBottom: 2 },
  pillHigh: { background: '#fef2f2', color: '#991b1b' },
  pillWarn: { background: '#fef9c3', color: '#854d0e' },
  pillInfo: { background: '#f0f9ff', color: '#0369a1' },
  detail: { marginTop: '1.5rem', padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  detailTitle: { fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#0f172a' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  label: { fontSize: '0.75rem', color: '#64748b', marginBottom: 2 },
  value: { fontSize: '0.875rem', color: '#0f172a' },
  section: { marginBottom: '1.25rem' },
  textarea: { width: '100%', minHeight: 80, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.875rem', marginBottom: '0.75rem' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  btn: { padding: '6px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer' as const },
  btnAccept: { background: '#16a34a', color: '#fff' },
  btnRequest: { background: '#2563eb', color: '#fff' },
  btnNotAccept: { background: '#dc2626', color: '#fff' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' as const },
  link: { color: '#2563eb', fontSize: '0.875rem' },
  empty: { padding: '2rem', textAlign: 'center' as const, color: '#64748b', fontSize: '0.875rem' },
}

export function ReviewerConsole() {
  const { state, reviewerAccept, reviewerRequestChanges, reviewerNotAccept, getFlagsForSubmission } = useItemHub()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const queue = useMemo(() => {
    const entries: { submission: MAPSubmission; item: Item }[] = []
    for (const sub of Object.values(state.submissions)) {
      if (!sub.mapApplies || sub.submittedAt == null) continue
      const item = state.items.find((i) => i.id === sub.itemId)
      if (item) entries.push({ submission: sub, item })
    }
    entries.sort((a, b) => (new Date(b.submission.submittedAt!).getTime() - new Date(a.submission.submittedAt!).getTime()))
    return entries
  }, [state.submissions, state.items])

  const selected = useMemo(() => {
    if (!selectedItemId) return null
    const sub = state.submissions[selectedItemId]
    const item = state.items.find((i) => i.id === selectedItemId)
    return sub && item ? { submission: sub, item } : null
  }, [selectedItemId, state.submissions, state.items])

  const effectiveStatus = selected ? getEffectiveStatus(selected.submission) : null
  const isUnderReview = effectiveStatus === 'UNDER_REVIEW'
  const canAccept = isUnderReview
  const canRequestOrNotAccept = isUnderReview
  const commentRequired = canRequestOrNotAccept && (comment.trim().length === 0)

  const handleAccept = () => {
    if (!selectedItemId || !canAccept) return
    reviewerAccept(selectedItemId)
  }

  const handleRequestChanges = () => {
    if (!selectedItemId || !canRequestOrNotAccept || commentRequired) return
    reviewerRequestChanges(selectedItemId, comment.trim())
    setComment('')
  }

  const handleNotAccept = () => {
    if (!selectedItemId || !canRequestOrNotAccept || commentRequired) return
    reviewerNotAccept(selectedItemId, comment.trim())
    setComment('')
  }

  return (
    <div style={styles.layout}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reviewer Console</h1>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          <Link href="/itemhub" style={styles.link}>← Update Item (Vendor)</Link>
          {' · '}
          <Link href="/" style={styles.link}>Back to MAPtool</Link>
        </span>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item (title + TCIN)</th>
              <th style={styles.th}>Submitted MAP</th>
              <th style={styles.th}>Market price</th>
              <th style={styles.th}>Delta / Delta%</th>
              <th style={styles.th}>Flags</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Submitted date</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, ...styles.empty }}>
                  No MAP submissions in queue. Submit from the vendor Update Item view.
                </td>
              </tr>
            ) : (
              queue.map(({ submission, item }) => {
                const flags = getFlagsForSubmission(submission.id)
                const mapVal = submission.mapValue ?? 0
                const market = item.compIntel.marketPrice
                const delta = mapVal - market
                const deltaPct = market ? ((delta / market) * 100).toFixed(1) : '—'
                const eff = getEffectiveStatus(submission)
                const submittedAt = submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'
                const isSelected = selectedItemId === item.id
                return (
                  <tr
                    key={submission.id}
                    style={{ ...styles.trClick, ...(isSelected ? styles.trSelected : {}) }}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <td style={styles.td}>
                      <div style={{ fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>TCIN: {item.tcin}</div>
                    </td>
                    <td style={styles.td}>$ {mapVal.toLocaleString()}</td>
                    <td style={styles.td}>$ {market.toLocaleString()}</td>
                    <td style={styles.td}>
                      {delta >= 0 ? '+' : ''}$ {delta.toFixed(2)} / {deltaPct}%
                    </td>
                    <td style={styles.td}>
                      {flags.map((f) => (
                        <span
                          key={f.id}
                          style={{
                            ...styles.pill,
                            ...(f.severity === 'high' ? styles.pillHigh : f.severity === 'warn' ? styles.pillWarn : styles.pillInfo),
                          }}
                        >
                          {FLAG_LABELS[f.type] ?? f.type}
                        </span>
                      ))}
                      {flags.length === 0 && '—'}
                    </td>
                    <td style={styles.td}>{STATUS_LABELS[eff] ?? eff}</td>
                    <td style={styles.td}>{submittedAt}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={styles.detail}>
          <h2 style={styles.detailTitle}>
            {selected.item.title} — TCIN {selected.item.tcin}
          </h2>

          <div style={styles.section}>
            <div style={styles.label}>Policy document</div>
            <div style={styles.value}>
              {selected.submission.policyFileName ? (
                <span style={styles.link}>{selected.submission.policyFileName}</span>
              ) : (
                '—'
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 8 }}>(mock link)</span>
            </div>
          </div>

          {selected.submission.metadata && (
            <div style={styles.section}>
              <div style={styles.label}>Policy metadata</div>
              <div style={styles.grid}>
                <div><div style={styles.label}>Effective date</div><div style={styles.value}>{selected.submission.metadata.effectiveDate || '—'}</div></div>
                <div><div style={styles.label}>Expiration date</div><div style={styles.value}>{selected.submission.metadata.expirationDate || '—'}</div></div>
                <div><div style={styles.label}>Covered products</div><div style={styles.value}>{selected.submission.metadata.coveredProducts ?? '—'}</div></div>
                <div><div style={styles.label}>Enforcement</div><div style={styles.value}>{selected.submission.metadata.enforcementMechanism ?? '—'}</div></div>
                <div><div style={styles.label}>Contact</div><div style={styles.value}>{selected.submission.metadata.contactName} / {selected.submission.metadata.contactEmail}</div></div>
              </div>
            </div>
          )}

          {selected.submission.attestations && (
            <div style={styles.section}>
              <div style={styles.label}>Attestations</div>
              <div style={styles.value}>
                Specific: {selected.submission.attestations.specific ? 'Yes' : 'No'} · Uniform: {selected.submission.attestations.uniform ? 'Yes' : 'No'} · Enforced: {selected.submission.attestations.enforced ? 'Yes' : 'No'}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <div style={styles.label}>Comp Intel</div>
            <div style={styles.grid}>
              <div><div style={styles.label}>Market price</div><div style={styles.value}>$ {selected.item.compIntel.marketPrice.toLocaleString()}</div></div>
              <div><div style={styles.label}>Submitted MAP</div><div style={styles.value}>$ {(selected.submission.mapValue ?? 0).toLocaleString()}</div></div>
              <div><div style={styles.label}>Delta</div><div style={styles.value}>
                $ {((selected.submission.mapValue ?? 0) - selected.item.compIntel.marketPrice).toFixed(2)}
                ({selected.item.compIntel.marketPrice ? ((((selected.submission.mapValue ?? 0) - selected.item.compIntel.marketPrice) / selected.item.compIntel.marketPrice * 100).toFixed(1) : 0)}%)
              </div></div>
              <div><div style={styles.label}>Timestamp</div><div style={styles.value}>{selected.item.compIntel.marketTimestamp}</div></div>
              <div><div style={styles.label}>Confidence</div><div style={styles.value}>{selected.item.compIntel.confidence}</div></div>
            </div>
            <div style={{ marginTop: 8 }}>
              {getFlagsForSubmission(selected.submission.id).map((f) => (
                <span
                  key={f.id}
                  style={{
                    ...styles.pill,
                    ...(f.severity === 'high' ? styles.pillHigh : f.severity === 'warn' ? styles.pillWarn : styles.pillInfo),
                  }}
                >
                  {FLAG_LABELS[f.type] ?? f.type}
                </span>
              ))}
            </div>
          </div>

          {selected.submission.reviewerComment && (
            <div style={styles.section}>
              <div style={styles.label}>Your previous comment</div>
              <div style={{ ...styles.value, padding: '0.5rem', background: '#f8fafc', borderRadius: 6 }}>{selected.submission.reviewerComment}</div>
            </div>
          )}

          {canRequestOrNotAccept && (
            <div style={styles.section}>
              <div style={styles.label}>Comment (required for Request changes / Not accept)</div>
              <textarea
                style={styles.textarea}
                placeholder="Enter comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-required={canRequestOrNotAccept}
              />
            </div>
          )}

          {effectiveStatus === 'UNDER_REVIEW' && (
            <div style={styles.actions}>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnAccept }}
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnRequest, ...(commentRequired ? styles.btnDisabled : {}) }}
                onClick={handleRequestChanges}
                disabled={commentRequired}
              >
                Request changes
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnNotAccept, ...(commentRequired ? styles.btnDisabled : {}) }}
                onClick={handleNotAccept}
                disabled={commentRequired}
              >
                Not accept
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
