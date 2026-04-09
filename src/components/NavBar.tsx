import Link from 'next/link'

export default function NavBar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 500,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'rgba(250, 250, 250, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'black',
          textDecoration: 'none',
        }}
      >
        RISD 3D Scans
      </Link>
      <Link
        href="/search"
        style={{
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'black',
          textDecoration: 'none',
        }}
      >
        Search
      </Link>
    </nav>
  )
}
