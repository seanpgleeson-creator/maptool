import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ItemHub | MAPtool',
  description: 'ItemHub MAP Guardrails prototype — vendor item attribute input.',
}

export default function ItemHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
