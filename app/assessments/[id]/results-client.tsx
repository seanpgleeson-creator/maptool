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
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function fetchOnce(): Promise<AssessmentResponse | null> {
      const res = await fetch(`/api/assessments/${id}`, { cache: 'no-store' })
      const json = (await res.json()) as AssessmentResponse
      if (!cancelled) {
        setData(json)
        setLoading(false)
      }
      return json
    }

    void fetchOnce().then((json) => {
      if (cancelled || json?.status === 'completed') return
      intervalId = setInterval(() => {
        void fetchOnce().then((next) => {
          if (next?.status === 'completed' && intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        })
      }, 1500)
    })

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
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

      <Card title="Competitive prices">
        {item ? (
          <div>
            <div>
              <strong>UPC:</strong> {item.upc}
            </div>
            <div>
              <strong>MAP:</strong> {item.map_price}
            </div>
            <div style={{ color: '#666', marginTop: 6 }}>
              Amazon and Walmart price checks will appear here in a future
              update.
            </div>
          </div>
        ) : (
          <div style={{ color: '#666' }}>No items found.</div>
        )}
      </Card>

      <Card title="Policy applicability">
        {data?.policy_analysis ? (
          <div>
            {data.policy_analysis.applies_to_all_retailers ? (
              <p style={{ margin: 0 }}>
                Applies to all retailers. No segment restriction.
              </p>
            ) : (
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#b45309' }}>
                  Applies only to a specific segment
                </p>
                {data.policy_analysis.segment_description ? (
                  <p style={{ margin: '0.25rem 0 0 0', color: '#333' }}>
                    {data.policy_analysis.segment_description}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#666' }}>
            No policy was uploaded or analysis is not available.
          </div>
        )}
      </Card>

      <Card title="Policy consequences">
        {data?.policy_analysis ? (
          <div>
            {data.policy_analysis.consequences_specific ? (
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  Policy states specific consequences for violations.
                </p>
                {data.policy_analysis.consequences_summary ? (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>
                    {data.policy_analysis.consequences_summary}
                  </p>
                ) : null}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#b45309' }}>
                Consequences are not specific. Consider asking the vendor for
                clear steps (e.g. first violation: warning; second: supply
                cutoff; third: termination).
              </p>
            )}
          </div>
        ) : (
          <div style={{ color: '#666' }}>No policy analysis available.</div>
        )}
      </Card>

      <Card title="Next steps">
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {data?.recommendation?.action === 'proceed' ? (
              <span style={{ color: '#0d7a0d' }}>Proceed</span>
            ) : (
              <span style={{ color: '#b45309' }}>Discuss with vendor</span>
            )}
          </div>
          {Array.isArray(data?.recommendation?.reasons) &&
          data.recommendation.reasons.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {(data.recommendation.reasons as string[]).map((r, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: '#666' }}>
              {data?.recommendation?.action === 'proceed'
                ? 'Policy looks acceptable from an applicability and consequences standpoint. Competitor price checks (coming later) will refine this.'
                : 'Review the policy applicability and consequences above and consider discussing with the vendor.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

