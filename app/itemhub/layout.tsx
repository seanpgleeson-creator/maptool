import type { Metadata } from 'next'
import { ItemHubProvider } from '@/lib/itemhub/ItemHubProvider'

export const metadata: Metadata = {
  title: 'ItemHub | MAPtool',
  description: 'ItemHub MAP Guardrails prototype — vendor item attribute input.',
}

export default function ItemHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ItemHubProvider>{children}</ItemHubProvider>
}
