'use client'

import { useItemHubState } from '@/lib/itemhub/ItemHubProvider'
import Link from 'next/link'
import { VendorShell } from './components/VendorShell'

/** Update Item (vendor view) — Phase 1 shell + placeholder for Pricing card. */
export function UpdateItemPage() {
  const state = useItemHubState()
  const itemCount = state.items.length

  return (
    <VendorShell itemCount={itemCount}>
      <div
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.875rem',
          border: '1px dashed #e2e8f0',
          borderRadius: 8,
          background: '#f8fafc',
        }}
      >
        Placeholder for Pricing card (Phase 2).
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
        <Link href="/itemhub/review" style={{ color: '#2563eb' }}>
          Reviewer console →
        </Link>
        {' · '}
        <Link href="/" style={{ color: '#2563eb' }}>
          Back to MAPtool
        </Link>
      </p>
    </VendorShell>
  )
}
