'use client'

import { useEffect, useState } from 'react'

type AssessmentResponse = {
  assessment_id: string
  status: string
  mode?: string
  step?: string | null
  items?: Array<{
    id: string
    upc: string
    map_price: string
    competitor_prices: Array<{
      source: string
      price: string | null
      currency: string
    }>
  }>
  policy_analysis?: null | {
    applies_to_all_retailers: boolean | null
    segment_description: string | null
    consequences_specific: boolean | null
    consequences_summary: string | null
  }
  recommendation?: null | {
    action: string
    reasons: unknown
  }
  error?: string
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        border: '1px solid #eee',
        borderRadius: 12,
        padding: '1rem',
        background: '#fff',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ color: '#333' }}>{children}</div>
    </section>
  )
}

export function ResultsClient({ id }: { id: string }) {
  const [data, setData] = useState<AssessmentResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchOnce() {
      const res = await fetch(`/api/assessments/${id}`, { cache: 'no-store' })
      const json = (await res.json()) as AssessmentResponse
      if (!cancelled) setData(json)
      if (!cancelled) setLoading(false)
    }

    fetchOnce()
    const interval = setInterval(fetchOnce, 1500)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [id])

  if (loading) return <p style={{ color: '#666' }}>Loading…</p>
  if (data?.error) return <p style={{ color: '#b00020' }}>{data.error}</p>

  const item = data?.items?.[0]

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <Card title="Status">
        <div>
          <div>
            <strong>Assessment:</strong> {data?.assessment_id}
          </div>
          <div>
            <strong>Status:</strong> {data?.status}
            {data?.step ? ` (${data.step})` : ''}
          </div>
        </div>
      </Card>

      <Card title="Competitive prices (stub)">
        {item ? (
          <div>
            <div>
              <strong>UPC:</strong> {item.upc}
            </div>
            <div>
              <strong>MAP:</strong> {item.map_price}
            </div>
            <div style={{ color: '#666', marginTop: 6 }}>
              Amazon and Walmart checks will appear here in the next phase.
            </div>
          </div>
        ) : (
          <div style={{ color: '#666' }}>No items found.</div>
        )}
      </Card>

      <Card title="Policy review (stub)">
        <div style={{ color: '#666' }}>
          Policy upload + AI analysis will be added in the next phase.
        </div>
      </Card>

      <Card title="Next steps (stub)">
        <div>
          <div>
            <strong>Recommendation:</strong>{' '}
            {data?.recommendation?.action ?? '—'}
          </div>
          <div style={{ color: '#666', marginTop: 6 }}>
            This is a placeholder until competitor checks and policy review are
            implemented.
          </div>
        </div>
      </Card>
    </div>
  )
}

