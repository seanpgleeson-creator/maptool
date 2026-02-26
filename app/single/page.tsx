'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SingleItemPage() {
  const router = useRouter()
  const [upc, setUpc] = useState('')
  const [mapPrice, setMapPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          upc: upc.trim(),
          map_price: Number(mapPrice),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Failed to create assessment.')
        return
      }
      router.push(`/assessments/${data.assessment_id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '40rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Single item</h1>
        <p style={{ marginTop: 0, color: '#666' }}>
          Enter a UPC and MAP price to start an assessment. Policy upload is
          coming next.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>UPC</div>
            <input
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
              placeholder="e.g. 012345678905"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #ddd',
              }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>MAP price</div>
            <input
              value={mapPrice}
              onChange={(e) => setMapPrice(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 49.99"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #ddd',
              }}
            />
          </label>

          {error ? (
            <p style={{ color: '#b00020', marginTop: 0 }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: 'none',
              background: '#111',
              color: '#fff',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Starting…' : 'Run assessment'}
          </button>
        </form>
      </div>
    </main>
  )
}

