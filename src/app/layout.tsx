import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RISD Museum 3D Scans Collection',
  description: 'Three-dimensional scans of objects from the RISD Museum permanent collection',
  openGraph: {
    title: 'RISD Museum 3D Scans Collection',
    description: 'Three-dimensional scans of objects from the RISD Museum permanent collection',
    url: 'https://3dscans.reidsurmeier.wtf',
    siteName: 'RISD Museum 3D Scans',
  },
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
