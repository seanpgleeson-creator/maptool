import Link from 'next/link'

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '44rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>MAPtool</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Upload a UPC, MAP price, and vendor policy to decide whether to
          discuss MAP with your supplier or proceed.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href="/single"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 10,
              background: '#111',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Single item
          </Link>
          <Link
            href="/bulk"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid #ddd',
              color: '#111',
              textDecoration: 'none',
              background: '#fff',
            }}
          >
            Bulk upload
          </Link>
        </div>

        <p style={{ marginTop: '1rem', color: '#777', fontSize: '0.95rem' }}>
          MVP note: bulk upload, competitor checks, and policy review are coming
          next.
        </p>
      </div>
    </main>
  )
}
