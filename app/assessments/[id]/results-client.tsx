'use client'

import { useEffect, useState } from 'react'

/** Safely format a price/map_price from API (may be string, number, or Prisma Decimal-like) for display. */
function formatPrice(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2)
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n.toFixed(2) : value
  }
  return String(value)
}

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
      listing_url?: string | null
      error?: string | null
    }>
  }>
  policy_analysis?: null | {
    applies_to_all_retailers: boolean | null
    segment_description: string | null
    consequences_specific: boolean | null
    consequences_summary: string | null
    consequence_severity?: string | null
    consequence_timeline?: string | null
    vendor_response_supply_risks?: string | null
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
  const competitorPrices = item?.competitor_prices ?? []

  // When analysis failed (e.g. OpenAI 429), show the error from recommendation reasons
  const analysisErrorReason =
    !data?.policy_analysis &&
    Array.isArray(data?.recommendation?.reasons) &&
    (data.recommendation.reasons as string[]).find(
      (r) =>
        typeof r === 'string' &&
        (r.includes('Policy analysis failed') ||
          r.includes('429') ||
          r.toLowerCase().includes('quota') ||
          r.toLowerCase().includes('openai'))
    )

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
              <strong>MAP:</strong> {formatPrice(item.map_price)}
            </div>
            {(() => {
              const walmart = competitorPrices.find((cp) => cp.source === 'walmart')
              const walmartPrice = walmart?.price != null ? Number(walmart.price) : null
              const mapNum = Number(item.map_price)
              const mapAboveMarket =
                walmartPrice != null && Number.isFinite(mapNum) && mapNum > walmartPrice
              return mapAboveMarket ? (
                <div
                  style={{
                    marginTop: 10,
                    padding: '0.5rem 0.75rem',
                    background: '#fff8e6',
                    border: '1px solid #e6c84c',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    color: '#7a5c00',
                  }}
                >
                  <strong>Negotiation follow-up needed</strong> — MAP is above current Walmart
                  retail; this MAP would make pricing uncompetitive.
                </div>
              ) : null
            })()}
            <div style={{ marginTop: 12 }}>
              {competitorPrices.length === 0 ? (
                <div style={{ color: '#666' }}>
                  No competitor price data for this assessment.
                </div>
              ) : (
                competitorPrices.map((cp) => (
                  <div
                    key={cp.source}
                    style={{
                      marginBottom: 10,
                      padding: '8px 0',
                      borderBottom:
                        competitorPrices.indexOf(cp) <
                        competitorPrices.length - 1
                          ? '1px solid #eee'
                          : undefined,
                    }}
                  >
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {cp.source}
                    </span>
                    {cp.source === 'amazon' &&
                    (cp.error === 'Coming soon' || !cp.price) ? (
                      <span style={{ color: '#666', marginLeft: 8 }}>
                        Coming soon
                      </span>
                    ) : (
                      <>
                        <span style={{ marginLeft: 8 }}>
                          {cp.price != null
                            ? `$${formatPrice(cp.price)}`
                            : (cp.error ?? 'Unavailable')}
                        </span>
                        {cp.listing_url ? (
                          <a
                            href={cp.listing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginLeft: 10,
                              fontSize: '0.9rem',
                              color: '#0066cc',
                            }}
                          >
                            View product →
                          </a>
                        ) : null}
                      </>
                    )}
                  </div>
                ))
              )}
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
        ) : analysisErrorReason ? (
          <div style={{ color: '#b00020' }}>
            <p style={{ margin: 0 }}>Policy analysis could not be completed.</p>
            <p style={{ margin: '0.5rem 0 0 0' }}>{analysisErrorReason}</p>
            {analysisErrorReason.includes('429') ||
            analysisErrorReason.toLowerCase().includes('quota') ? (
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                Check your OpenAI plan and billing at{' '}
                <a
                  href="https://platform.openai.com/account/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  platform.openai.com
                </a>
                .
              </p>
            ) : null}
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
                {data.policy_analysis.consequence_severity ? (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>
                    <strong>Severity:</strong>{' '}
                    <span style={{ textTransform: 'capitalize' }}>
                      {String(data.policy_analysis.consequence_severity)}
                    </span>
                  </p>
                ) : null}
                {data.policy_analysis.consequence_timeline ? (
                  <p style={{ margin: '0.25rem 0 0 0', color: '#333' }}>
                    <strong>Timeline:</strong>{' '}
                    {String(data.policy_analysis.consequence_timeline)}
                  </p>
                ) : null}
                {data.policy_analysis.consequences_summary ? (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>
                    {String(data.policy_analysis.consequences_summary)}
                  </p>
                ) : null}
                {data.policy_analysis.vendor_response_supply_risks ? (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontSize: '0.95rem' }}>
                    <strong>Vendor response / supply risks:</strong>{' '}
                    {String(data.policy_analysis.vendor_response_supply_risks)}
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
        ) : analysisErrorReason ? (
          <div style={{ color: '#b00020' }}>
            {analysisErrorReason}
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
          {(() => {
            const reasons = Array.isArray(data?.recommendation?.reasons)
              ? (data!.recommendation!.reasons as string[])
              : []
            if (reasons.length > 0) {
              return (
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {reasons.map((r, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {typeof r === 'string' ? r : String(r)}
                    </li>
                  ))}
                </ul>
              )
            }
            return (
              <p style={{ margin: 0, color: '#666' }}>
                {data?.recommendation?.action === 'proceed'
                  ? 'Policy looks acceptable from an applicability and consequences standpoint. Competitor price checks (coming later) will refine this.'
                  : 'Review the policy applicability and consequences above and consider discussing with the vendor.'}
              </p>
            )
          })()}
        </div>
      </Card>
    </div>
  )
}

