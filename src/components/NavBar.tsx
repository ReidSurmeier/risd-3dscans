import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-museum-black/80 backdrop-blur-sm border-b border-museum-muted/30">
      <Link href="/" className="font-serif text-museum-white text-sm tracking-tight">
        RISD Museum 3D Scans
      </Link>
      <Link
        href="/search"
        className="font-mono text-museum-gray text-xs tracking-widest uppercase hover:text-museum-white transition-colors"
      >
        Search
      </Link>
    </nav>
  )
}
