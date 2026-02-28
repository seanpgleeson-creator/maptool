'use client'

import Link from 'next/link'
import { PolicyInfoModal } from '@/app/components/PolicyInfoModal'

export function AssessmentHeader() {
  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/" style={{ color: '#111' }}>
          ← Back
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Assessment</h1>
        <PolicyInfoModal />
      </div>
    </>
  )
}
