'use client'

import { useState } from 'react'

const POLICY_INFO_COPY = (
  <>
    <p style={{ margin: '0 0 0.75rem 0' }}>
      When we assess a MAP policy, we look for the following so we can give you
      a clear recommendation:
    </p>
    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
      <li style={{ marginBottom: 6 }}>
        <strong>Applicability</strong> — Does the policy apply to all retailers,
        or only to a segment (e.g. big box, online only)? If it’s limited, we
        summarize who it applies to.
      </li>
      <li style={{ marginBottom: 6 }}>
        <strong>Consequences</strong> — Does the policy spell out specific steps
        for violations (e.g. first warning, second 90-day cutoff, third
        termination)? We flag when consequences are vague so you can ask the
        vendor for clarity.
      </li>
      <li style={{ marginBottom: 6 }}>
        <strong>Competitive prices</strong> — We compare the MAP price to
        current prices at Walmart (and Amazon when available) so you can see if
        the MAP floor would hurt your ability to compete.
      </li>
      <li>
        <strong>Next step</strong> — Based on the above, we recommend either
        &quot;Discuss with vendor&quot; (e.g. if the policy is segment-only,
        consequences are unclear, or MAP is above market) or &quot;Proceed&quot;
        (if the policy applies to all, consequences are specific, and MAP is
        reasonable).
      </li>
    </ul>
  </>
)

export function PolicyInfoModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="What we look for in the policy"
        aria-label="What we look for in the policy"
        style={{
          marginLeft: 8,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid #ccc',
          background: '#f8f8f8',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#555',
        }}
      >
        ℹ️
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-info-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              maxWidth: 420,
              maxHeight: '85vh',
              overflow: 'auto',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}
            >
              <h2
                id="policy-info-title"
                style={{ margin: 0, fontSize: '1.1rem' }}
              >
                What we look for in the policy
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  marginLeft: 12,
                  padding: 4,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ color: '#333', fontSize: '0.95rem' }}>
              {POLICY_INFO_COPY}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
