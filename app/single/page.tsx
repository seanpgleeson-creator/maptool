'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function SingleItemPage() {
  const router = useRouter()
  const [upc, setUpc] = useState('')
  const [mapPrice, setMapPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Please select a policy document (PDF or Word).')
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('upc', upc.trim())
      formData.set('map_price', mapPrice)
      formData.set('policy', file)
      const res = await fetch('/api/assessments', {
        method: 'POST',
        body: formData,
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
          Enter a UPC, MAP price, and upload the vendor&apos;s MAP policy (PDF or
          Word). We&apos;ll review the policy and recommend next steps.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>UPC</div>
            <input
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
              placeholder="e.g. 012345678905"
              required
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
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #ddd',
              }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>
              Vendor MAP policy (PDF or Word)
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #ddd',
              }}
            />
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
              Max 10 MB. We&apos;ll extract text and check applicability and
              consequences.
            </div>
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
            {submitting ? 'Analyzing policy…' : 'Run assessment'}
          </button>
        </form>
      </div>
    </main>
  )
}
