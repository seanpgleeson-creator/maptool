import Link from 'next/link'
import { ItemHubPageClient } from './ItemHubPageClient'

export default function ItemHubPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '56rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Update Item
        </h1>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
          Vendor-facing item attribute input and MAP submission flow. (Phase 0 — minimal shell.)
        </p>
        <ItemHubPageClient />
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '1.5rem' }}>
          <Link href="/itemhub/review" style={{ color: '#0066cc' }}>
            Reviewer console →
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
