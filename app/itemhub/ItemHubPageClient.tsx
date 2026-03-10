'use client'

import { useItemHubState } from '@/lib/itemhub/ItemHubProvider'

/** Minimal client shell to verify store and seed data (Phase 0). */
export function ItemHubPageClient() {
  const state = useItemHubState()
  return (
    <p style={{ color: '#555', fontSize: '0.9rem' }}>
      {state.items.length} items in store. Submissions: {Object.keys(state.submissions).length}. Flags: {state.flags.length}.
    </p>
  )
}
