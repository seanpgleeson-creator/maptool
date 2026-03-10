import Link from 'next/link'

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
          ItemHub MAP Guardrails Prototype
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Vendor-facing item attribute input and MAP submission flow. This
          prototype is scoped under <code>/itemhub</code> and does not modify
          the main MAPtool experience.
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          <Link href="/" style={{ color: '#0066cc' }}>
            ← Back to MAPtool
          </Link>
        </p>
      </div>
    </main>
  )
}
