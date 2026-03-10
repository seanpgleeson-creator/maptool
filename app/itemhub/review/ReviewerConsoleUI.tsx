'use client'

import React from 'react'
import Link from 'next/link'
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

export function getEffectiveStatus(sub: MAPSubmission): string {
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

export type ReviewerConsoleUIProps = {
  queue: { submission: MAPSubmission; item: Item }[]
  selectedItemId: string | null
  selected: { submission: MAPSubmission; item: Item } | null
  comment: string
  setComment: (s: string) => void
  setSelectedItemId: (id: string | null) => void
  effectiveStatus: string | null
  canAccept: boolean
  canRequestOrNotAccept: boolean
  commentRequired: boolean
  onAccept: () => void
  onRequestChanges: () => void
  onNotAccept: () => void
  getFlagsForSubmission: (id: string) => MerchantFlag[]
}

let _props: ReviewerConsoleUIProps | null = null
export function setReviewerConsoleUIProps(p: ReviewerConsoleUIProps) {
  _props = p
}

function ReviewerConsoleContent() {
  return <section style={styles.layout}>
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
            {_props!.queue.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, ...styles.empty }}>
                  No MAP submissions in _props!.queue. Submit from the vendor Update Item view.
                </td>
              </tr>
            ) : (
              _props!.queue.map(({ submission, item }) => {
                const flags = _props!.getFlagsForSubmission(submission.id)
                const mapVal = submission.mapValue ?? 0
                const market = item.compIntel.marketPrice
                const delta = mapVal - market
                const deltaPct = market ? ((delta / market) * 100).toFixed(1) : '—'
                const eff = getEffectiveStatus(submission)
                const submittedAt = submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'
                const isSelected = _props!.selectedItemId === item.id
                return (
                  <tr
                    key={submission.id}
                    style={{ ...styles.trClick, ...(isSelected ? styles.trSelected : {}) }}
                    onClick={() => _props!.setSelectedItemId(item.id)}
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

      {_props!.selected ? <div style={styles.detail}>
          <h2 style={styles.detailTitle}>
            {_props!.selected.item.title} — TCIN {_props!.selected.item.tcin}
          </h2>

          <div style={styles.section}>
            <div style={styles.label}>Policy document</div>
            <div style={styles.value}>
              {_props!.selected.submission.policyFileName ? (
                <span style={styles.link}>{_props!.selected.submission.policyFileName}</span>
              ) : (
                '—'
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 8 }}>(mock link)</span>
            </div>
          </div>

          {_props!.selected.submission.metadata && (
            <div style={styles.section}>
              <div style={styles.label}>Policy metadata</div>
              <div style={styles.grid}>
                <div><div style={styles.label}>Effective date</div><div style={styles.value}>{_props!.selected.submission.metadata.effectiveDate || '—'}</div></div>
                <div><div style={styles.label}>Expiration date</div><div style={styles.value}>{_props!.selected.submission.metadata.expirationDate || '—'}</div></div>
                <div><div style={styles.label}>Covered products</div><div style={styles.value}>{_props!.selected.submission.metadata.coveredProducts ?? '—'}</div></div>
                <div><div style={styles.label}>Enforcement</div><div style={styles.value}>{_props!.selected.submission.metadata.enforcementMechanism ?? '—'}</div></div>
                <div><div style={styles.label}>Contact</div><div style={styles.value}>{_props!.selected.submission.metadata.contactName} / {_props!.selected.submission.metadata.contactEmail}</div></div>
              </div>
            </div>
          )}

          {_props!.selected.submission.attestations && (
            <div style={styles.section}>
              <div style={styles.label}>Attestations</div>
              <div style={styles.value}>
                Specific: {_props!.selected.submission.attestations.specific ? 'Yes' : 'No'} · Uniform: {_props!.selected.submission.attestations.uniform ? 'Yes' : 'No'} · Enforced: {_props!.selected.submission.attestations.enforced ? 'Yes' : 'No'}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <div style={styles.label}>Comp Intel</div>
            <div style={styles.grid}>
              <div><div style={styles.label}>Market price</div><div style={styles.value}>$ {_props!.selected.item.compIntel.marketPrice.toLocaleString()}</div></div>
              <div><div style={styles.label}>Submitted MAP</div><div style={styles.value}>$ {(_props!.selected.submission.mapValue ?? 0).toLocaleString()}</div></div>
              <div><div style={styles.label}>Delta</div><div style={styles.value}>
                $ {((_props!.selected.submission.mapValue ?? 0) - _props!.selected.item.compIntel.marketPrice).toFixed(2)}
                ({_props!.selected.item.compIntel.marketPrice
                  ? ((((_props!.selected.submission.mapValue ?? 0) - _props!.selected.item.compIntel.marketPrice) / _props!.selected.item.compIntel.marketPrice) * 100).toFixed(1)
                  : 0}%)
              </div></div>
              <div><div style={styles.label}>Timestamp</div><div style={styles.value}>{_props!.selected.item.compIntel.marketTimestamp}</div></div>
              <div><div style={styles.label}>Confidence</div><div style={styles.value}>{_props!.selected.item.compIntel.confidence}</div></div>
            </div>
            <div style={{ marginTop: 8 }}>
              {_props!.getFlagsForSubmission(_props!.selected.submission.id).map((f) => (
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

          {_props!.selected.submission.reviewerComment && (
            <div style={styles.section}>
              <div style={styles.label}>Your previous _props!.comment</div>
              <div style={{ ...styles.value, padding: '0.5rem', background: '#f8fafc', borderRadius: 6 }}>{_props!.selected.submission.reviewerComment}</div>
            </div>
          )}

          {_props!.canRequestOrNotAccept && (
            <div style={styles.section}>
              <div style={styles.label}>Comment (required for Request changes / Not accept)</div>
              <textarea
                style={styles.textarea}
                placeholder="Enter _props!.comment..."
                value={_props!.comment}
                onChange={(e) => _props!.setComment(e.target.value)}
                aria-required={_props!.canRequestOrNotAccept}
              />
            </div>
          )}

          {_props!.effectiveStatus === 'UNDER_REVIEW' && (
            <div style={styles.actions}>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnAccept }}
                onClick={_props!.onAccept}
              >
                Accept
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnRequest, ...(_props!.commentRequired ? styles.btnDisabled : {}) }}
                onClick={_props!.onRequestChanges}
                disabled={_props!.commentRequired}
              >
                Request changes
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnNotAccept, ...(_props!.commentRequired ? styles.btnDisabled : {}) }}
                onClick={_props!.onNotAccept}
                disabled={_props!.commentRequired}
              >
                Not accept
              </button>
            </div>
          )}
        </div> : null}
    </section>
}

export const ReviewerConsoleUI = (props: ReviewerConsoleUIProps) =>
  React.createElement(ReviewerConsoleContent, props)
