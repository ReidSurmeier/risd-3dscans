import type { Metadata } from 'next'
import { Gothic_A1 } from 'next/font/google'
import './globals.css'

const gothicA1 = Gothic_A1({
  subsets: ['latin'],
  weight: ['400', '600', '900'],
  variable: '--font-gothic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RISD Museum 3D Scans Collection',
  description: 'Three-dimensional scans of objects from the RISD Museum permanent collection',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={gothicA1.variable}>
      <body>{children}</body>
    </html>
  )
}
