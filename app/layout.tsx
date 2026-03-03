import type { Metadata } from 'next'
import { MvpDisclaimer } from './components/MvpDisclaimer'

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
      <body>
        <MvpDisclaimer />
        {children}
      </body>
    </html>
  )
}
