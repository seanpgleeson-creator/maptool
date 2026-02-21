import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MAPtool',
  description: 'Help merchants negotiate MAP policies and values from suppliers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
