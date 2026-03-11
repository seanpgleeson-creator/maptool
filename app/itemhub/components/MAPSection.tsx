'use client'

import { useState } from 'react'
import type { Item, MAPSubmission, MAPSubmissionMetadata, MAPAttestations } from '@/lib/itemhub/types'
import type { CoveredProducts, EnforcementMechanism } from '@/lib/itemhub/types'
import { createDraftSubmission, createNotProvidedSubmission } from '@/lib/itemhub/store'
import { ITEMHUB_STRINGS } from '@/lib/itemhub/strings'

const STATUS_LABELS: Record<string, string> = {
  NOT_PROVIDED: 'Not provided',
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  CHANGES_REQUESTED: 'Changes requested',
  ACCEPTED: 'Accepted',
  NOT_ACCEPTED: 'Not accepted',
  EXPIRED: 'Expired',
}

const styles = {
  block: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '0.5rem', marginBottom: 8 },
  title: { fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' },
  badge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: 500,
    background: '#f1f5f9',
    color: '#475569',
  },
  helper: { fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' },
  fieldset: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: 4 },
  input: { padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.875rem', width: '100%', maxWidth: 280 },
  select: { padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.875rem', minWidth: 160 },
  error: { fontSize: '0.8125rem', color: '#dc2626', marginTop: 4 },
  copy: { fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' as const, marginBottom: '0.5rem', maxWidth: 560 },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  ctas: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  btnSecondary: { padding: '6px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' },
  btnPrimary: { padding: '6px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' },
  banner: { padding: '0.75rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: '0.8125rem', color: '#0369a1', marginTop: '1rem' },
}

interface MAPSectionProps {
  item: Item
  submission: MAPSubmission | undefined
  onSubmissionChange: (submission: MAPSubmission) => void
  onSubmitForReview: () => void
  hasNearOrAboveMarketFlag?: boolean
}

function getEffectiveStatus(sub: MAPSubmission | undefined): string {
  if (!sub) return 'NOT_PROVIDED'
  if (sub.status === 'EXPIRED') return 'EXPIRED'
  if (sub.metadata?.expirationDate && new Date(sub.metadata.expirationDate) < new Date()) return 'EXPIRED'
  return sub.status
}

export function MAPSection({ item, submission, onSubmissionChange, onSubmitForReview, hasNearOrAboveMarketFlag = false }: MAPSectionProps) {
  const [showSubmittedBanner, setShowSubmittedBanner] = useState(false)
  const effectiveStatus = getEffectiveStatus(submission)
  const isDraft = submission?.status === 'DRAFT' || submission?.status === 'CHANGES_REQUESTED'
  const mapApplies = submission?.mapApplies ?? false
  const sub = submission ?? createNotProvidedSubmission(item.id)
  const policyFileName = sub.policyFileName ?? ''

  const mapValue = sub.mapValue ?? 0
  const mapExceedsMsrp = mapApplies && sub.mapValue != null && sub.mapValue > item.msrp
  const metadata = sub.metadata
  const attestations = sub.attestations
  const hasMetadata = metadata && metadata.effectiveDate && metadata.expirationDate && metadata.contactName && metadata.contactEmail
  const needsCureDays = metadata?.enforcementMechanism === 'notice_cure' && (metadata.cureDays == null || metadata.cureDays === 0)
  const allAttestations = attestations?.specific && attestations?.uniform && attestations?.enforced
  const canSubmit = mapApplies && sub.mapValue != null && sub.mapValue > 0 && policyFileName.trim() !== '' && hasMetadata && !needsCureDays && allAttestations && !mapExceedsMsrp

  const handleMapAppliesChange = (yes: boolean) => {
    if (yes) {
      onSubmissionChange(createDraftSubmission(item.id))
    } else {
      onSubmissionChange(createNotProvidedSubmission(item.id))
    }
  }

  const handleSaveDraft = () => {
    if (!sub.mapApplies) return
    const updated: MAPSubmission = {
      ...sub,
      policyFileName: sub.policyFileName || null,
      metadata: sub.metadata ? { ...sub.metadata } : null,
      attestations: sub.attestations ? { ...sub.attestations } : null,
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
    }
    onSubmissionChange(updated)
  }

  const handleSubmit = () => {
    if (!canSubmit || !sub.mapApplies) return
    const updated: MAPSubmission = {
      ...sub,
      policyFileName: sub.policyFileName || null,
      updatedAt: new Date().toISOString(),
    }
    onSubmissionChange(updated)
    onSubmitForReview()
    setShowSubmittedBanner(true)
  }

  const updateMetadata = (patch: Partial<MAPSubmissionMetadata>) => {
    if (!sub.mapApplies || !sub.metadata) return
    onSubmissionChange({
      ...sub,
      metadata: { ...sub.metadata, ...patch },
      updatedAt: new Date().toISOString(),
    })
  }

  const updateAttestations = (patch: Partial<MAPAttestations>) => {
    if (!sub.mapApplies || !sub.attestations) return
    onSubmissionChange({
      ...sub,
      attestations: { ...sub.attestations, ...patch },
      updatedAt: new Date().toISOString(),
    })
  }

  const updateMapValue = (v: number | null) => {
    if (!sub.mapApplies) return
    onSubmissionChange({ ...sub, mapValue: v, updatedAt: new Date().toISOString() })
  }

  return (
    <div style={styles.block}>
      <div style={styles.header}>
        <h3 style={styles.title}>Minimum Advertised Price (MAP)</h3>
        <span style={styles.badge}>{STATUS_LABELS[effectiveStatus] ?? effectiveStatus}</span>
      </div>
      <p style={styles.helper}>
        {ITEMHUB_STRINGS.MAP_HELPER_SHORT}
      </p>

      <div style={styles.fieldset}>
        <span style={styles.label}>Does a MAP policy apply to this item? *</span>
        <div style={{ display: 'flex', gap: '1rem', marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="radio"
              name={`map-applies-${item.id}`}
              checked={!mapApplies}
              onChange={() => handleMapAppliesChange(false)}
            />
            No
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="radio"
              name={`map-applies-${item.id}`}
              checked={mapApplies}
              onChange={() => handleMapAppliesChange(true)}
            />
            Yes
          </label>
        </div>
      </div>

      {mapApplies && (
        <>
          <div style={styles.fieldset}>
            <label style={styles.label} htmlFor={`map-value-${item.id}`}>MAP (in $) *</label>
            <input
              id={`map-value-${item.id}`}
              type="number"
              min={0}
              step={0.01}
              value={sub.mapValue ?? ''}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                updateMapValue(Number.isNaN(v) ? null : v)
              }}
              style={styles.input}
            />
            {mapExceedsMsrp && <p style={styles.error}>{ITEMHUB_STRINGS.MAP_EXCEEDS_MSRP}</p>}
          </div>

          <div style={styles.fieldset}>
            <span style={styles.label}>Upload MAP policy (PDF/DOC/DOCX) *</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const name = e.target.files?.[0]?.name ?? ''
                onSubmissionChange({ ...sub, policyFileName: name || null, updatedAt: new Date().toISOString() })
              }}
              style={{ fontSize: '0.8125rem' }}
            />
            {(policyFileName || sub.policyFileName) && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 8 }}>{policyFileName || sub.policyFileName}</span>
            )}
          </div>

          {metadata && (
            <>
              <div style={styles.fieldset}>
                <label style={styles.label}>Effective date *</label>
                <input
                  type="date"
                  value={metadata.effectiveDate}
                  onChange={(e) => updateMetadata({ effectiveDate: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldset}>
                <label style={styles.label}>Expiration / review date *</label>
                <input
                  type="date"
                  value={metadata.expirationDate}
                  onChange={(e) => updateMetadata({ expirationDate: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldset}>
                <label style={styles.label}>Covered products *</label>
                <select
                  value={metadata.coveredProducts}
                  onChange={(e) => updateMetadata({ coveredProducts: e.target.value as CoveredProducts })}
                  style={styles.select}
                >
                  <option value="this_item_only">This item only</option>
                  <option value="brand">Brand</option>
                  <option value="category">Category</option>
                  <option value="all_products">All products</option>
                </select>
              </div>
              <div style={styles.fieldset}>
                <label style={styles.label}>Enforcement mechanism *</label>
                <select
                  value={metadata.enforcementMechanism}
                  onChange={(e) => updateMetadata({ enforcementMechanism: e.target.value as EnforcementMechanism })}
                  style={styles.select}
                >
                  <option value="notice_cure">Notice + cure</option>
                  <option value="immediate">Immediate</option>
                  <option value="tiered">Tiered</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {metadata.enforcementMechanism === 'notice_cure' && (
                <div style={styles.fieldset}>
                  <label style={styles.label}>Cure period (days) *</label>
                  <input
                    type="number"
                    min={0}
                    value={metadata.cureDays ?? ''}
                    onChange={(e) => updateMetadata({ cureDays: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    style={styles.input}
                  />
                </div>
              )}
              <div style={styles.fieldset}>
                <label style={styles.label}>Enforcement contact name *</label>
                <input
                  type="text"
                  value={metadata.contactName}
                  onChange={(e) => updateMetadata({ contactName: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldset}>
                <label style={styles.label}>Enforcement contact email *</label>
                <input
                  type="email"
                  value={metadata.contactEmail}
                  onChange={(e) => updateMetadata({ contactEmail: e.target.value })}
                  style={styles.input}
                />
              </div>
            </>
          )}

          <p style={styles.copy}>
            {ITEMHUB_STRINGS.MAP_POLICY_REQUIREMENT}
          </p>
          <p style={styles.copy}>
            {ITEMHUB_STRINGS.GUARDRAIL_DISCRETION}
          </p>

          {attestations && (
            <div style={styles.fieldset}>
              <span style={styles.label}>Attestations * (all required)</span>
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={attestations.specific}
                  onChange={(e) => updateAttestations({ specific: e.target.checked })}
                />
                Policy is specific (products/terms clearly defined)
              </label>
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={attestations.uniform}
                  onChange={(e) => updateAttestations({ uniform: e.target.checked })}
                />
                Uniformly enforced with no retailer segment or channel exceptions
              </label>
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={attestations.enforced}
                  onChange={(e) => updateAttestations({ enforced: e.target.checked })}
                />
                Actively enforced (not dormant)
              </label>
            </div>
          )}

          {isDraft && (
            <div style={styles.ctas}>
              <button type="button" style={styles.btnSecondary} onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button type="button" style={styles.btnPrimary} onClick={handleSubmit} disabled={!canSubmit}>
                Submit for Target review
              </button>
            </div>
          )}

          {sub.reviewerComment && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: 8, fontSize: '0.8125rem', color: '#92400e' }}>
              <strong>Reviewer comment:</strong> {sub.reviewerComment}
            </div>
          )}
        </>
      )}

      {(showSubmittedBanner || sub.status === 'UNDER_REVIEW' || sub.status === 'SUBMITTED') && (
        <div style={styles.banner} role="alert">
          <p style={{ margin: 0 }}>{ITEMHUB_STRINGS.SUBMISSION_BANNER}</p>
          {hasNearOrAboveMarketFlag && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem' }}>
              {ITEMHUB_STRINGS.COMP_NOTE_NEAR_MARKET}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
