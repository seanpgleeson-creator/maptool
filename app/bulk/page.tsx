'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { PolicyInfoModal } from '../components/PolicyInfoModal'

const MAX_ITEMS_FILE_BYTES = 512 * 1024 // 512 KB
const MAX_POLICY_BYTES = 4 * 1024 * 1024 // 4 MB

export default function BulkPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const itemsFileRef = useRef<HTMLInputElement>(null)
  const policyFileRef = useRef<HTMLInputElement>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const itemsFile = itemsFileRef.current?.files?.[0]
    const policyFile = policyFileRef.current?.files?.[0]

    if (!itemsFile) {
      setError('Please select an items file (CSV).')
      return
    }
    if (!policyFile) {
      setError('Please select a policy document (PDF or Word).')
      return
    }
    if (itemsFile.size > MAX_ITEMS_FILE_BYTES) {
      setError(`Items file must be under ${MAX_ITEMS_FILE_BYTES / 1024} KB.`)
      return
    }
    if (policyFile.size > MAX_POLICY_BYTES) {
      setError('Policy file must be under 4 MB.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('items_file', itemsFile)
      formData.set('policy', policyFile)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 min for bulk
      const apiUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/assessments/bulk`
          : '/api/assessments/bulk'
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const text = await res.text()
      let data: { error?: string; assessment_id?: string; details?: string }
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        setError(res.ok ? 'Invalid response from server.' : `Request failed (${res.status}).`)
        return
      }
      if (!res.ok) {
        const msg = data?.details ? `${data.error ?? ''} ${data.details}` : (data?.error ?? `Request failed (${res.status}).`)
        setError(msg)
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
            ? 'Request timed out. Try fewer items or a smaller policy file.'
            : err.message || 'Network error.'
          : String(err)
      setError(
        msg.startsWith('Request timed out') || msg.startsWith('Network')
          ? msg
          : `Request error: ${msg}. Try again.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '40rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
          <h1 style={{ margin: 0 }}>Bulk upload</h1>
          <PolicyInfoModal />
        </div>
        <p style={{ marginTop: 0, color: '#666' }}>
          Upload a CSV with UPC and MAP price columns, plus one vendor MAP policy (PDF or Word).
          We&apos;ll assess all items against the same policy and show a summary table.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>Items file (CSV)</div>
            <input
              ref={itemsFileRef}
              type="file"
              accept=".csv,text/csv,application/csv"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #ddd',
              }}
            />
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
              Max 512 KB. Must have a header row with columns: <strong>UPC</strong> (or &quot;upc code&quot;, &quot;gtin&quot;) and <strong>MAP price</strong> (or &quot;map&quot;, &quot;map_price&quot;, &quot;price&quot;). Max 20 items per run.
            </div>
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>
              Vendor MAP policy (PDF or Word)
            </div>
            <input
              ref={policyFileRef}
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
              Max 4 MB. One policy applies to all items in this run.
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
            {submitting ? 'Running bulk assessment…' : 'Run assessment'}
          </button>
        </form>
      </div>
    </main>
  )
}
