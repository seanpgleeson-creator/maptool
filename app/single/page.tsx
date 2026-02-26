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
    // Stay under Vercel 4.5 MB request body limit (use 4 MB to leave room for form fields)
    const MAX_FILE_BYTES = 4 * 1024 * 1024
    if (file.size > MAX_FILE_BYTES) {
      setError(
        'Policy file is too large. Use a file under 4 MB to avoid upload limits.',
      )
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('upc', upc.trim())
      formData.set('map_price', mapPrice)
      formData.set('policy', file)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90s client timeout
      const apiUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/assessments`
          : '/api/assessments'
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const text = await res.text()
      let data: { error?: string; assessment_id?: string }
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        setError(
          res.ok
            ? 'Invalid response from server.'
            : `Server error (${res.status}). Try a smaller file or try again.`,
        )
        return
      }
      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status}).`)
        return
      }
      if (data.assessment_id) {
        router.push(`/assessments/${data.assessment_id}`)
      } else {
        setError('Missing assessment ID in response.')
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'Request timed out. Try a smaller policy file or try again.'
            : err.message || 'Network error.'
          : String(err)
      setError(
        msg.startsWith('Request timed out') || msg.startsWith('Network')
          ? msg
          : `Network or request error: ${msg}. Try a smaller file (under 4 MB) or try again.`,
      )
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
              Max 4 MB (PDF or Word). We&apos;ll extract text and check
              applicability and consequences.
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
