import Link from 'next/link'

export default function ItemHubReviewPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '56rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reviewer Console</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Target reviewer view for MAP submissions. (Phase 0 — minimal shell.)
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          <Link href="/itemhub" style={{ color: '#0066cc' }}>
            ← Update Item (Vendor view)
          </Link>
          {' · '}
          <Link href="/" style={{ color: '#0066cc' }}>
            Back to MAPtool
          </Link>
        </p>
      </div>
    </main>
  )
}
