import { AssessmentHeader } from './assessment-header'
import { ResultsClient } from './results-client'

export default function AssessmentPage({ params }: { params: { id: string } }) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '52rem' }}>
        <AssessmentHeader />
        <ResultsClient id={params.id} />
      </div>
    </main>
  )
}

