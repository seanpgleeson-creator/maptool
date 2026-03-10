'use client'

import { useItemHubState } from '@/lib/itemhub/ItemHubProvider'
import Link from 'next/link'
import { VendorShell } from './components/VendorShell'
import { PricingCard } from './components/PricingCard'

/** Update Item (vendor view) — Phase 2: shell + Pricing card with item rows. */
export function UpdateItemPage() {
  const state = useItemHubState()
  const itemCount = state.items.length

  return (
    <VendorShell itemCount={itemCount}>
      <PricingCard />
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
