/**
 * ItemHub MAP Guardrails — Seed data for demo.
 * Spec: Item A (MSRP 290, market 185 high), Item B (MSRP 280, market 188 med),
 * Item C (MSRP 120, market 110 low, stale).
 */
import type { Item } from './types'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export const seedItems: Item[] = [
  {
    id: 'item-a',
    title: "Women's Faux Suede Trench - A New Day",
    tcin: '12345678',
    upc: '123456789012',
    dpci: '123-45-6789',
    initialRetailPrice: 300,
    msrp: 290,
    thumbnailUrl: '/itemhub/placeholder-thumb.png',
    compIntel: {
      marketPrice: 185,
      marketTimestamp: daysAgo(2),
      confidence: 'high',
    },
  },
  {
    id: 'item-b',
    title: "Lands' End Women's Squall Waterproof Modern Trench Coat",
    tcin: '87654321',
    upc: '987654321098',
    dpci: '987-65-4321',
    initialRetailPrice: 299,
    msrp: 280,
    thumbnailUrl: '/itemhub/placeholder-thumb.png',
    compIntel: {
      marketPrice: 188,
      marketTimestamp: daysAgo(5),
      confidence: 'med',
    },
  },
  {
    id: 'item-c',
    title: "Classic Rain Jacket - Seasonal",
    tcin: '11223344',
    upc: '112233445566',
    dpci: '112-33-4455',
    initialRetailPrice: 129,
    msrp: 120,
    thumbnailUrl: '/itemhub/placeholder-thumb.png',
    compIntel: {
      marketPrice: 110,
      marketTimestamp: daysAgo(20), // stale (>14 days)
      confidence: 'low',
    },
  },
]
