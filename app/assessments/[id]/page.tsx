import Link from 'next/link'

import { ResultsClient } from './results-client'

export default function AssessmentPage({ params }: { params: { id: string } }) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '52rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/" style={{ color: '#111' }}>
            ← Back
          </Link>
        </div>
        <h1 style={{ marginBottom: '0.5rem' }}>Assessment</h1>
        <ResultsClient id={params.id} />
      </div>
    </main>
  )
}

