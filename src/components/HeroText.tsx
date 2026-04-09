'use client'

import ColorChar from './ColorChar'

export default function HeroText() {
  return (
    <section className="hero-section">
      <div className="hero-title-wrap">
        <h1 className="hero-title" style={{ textAlign: 'right' }}>
          <ColorChar text="RISD" />
        </h1>
        <h1 className="hero-title">
          <ColorChar text="MUSEUM" />
        </h1>
        <h1 className="hero-title" style={{ transform: 'translateX(1.08em)' }}>
          <ColorChar text="3D SCANS" />
        </h1>
        <h1 className="hero-title" style={{ textAlign: 'right' }}>
          <ColorChar text="COLLECTION" />
        </h1>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#989898',
      }}>
        Providence, Rhode Island — RISD Museum
      </div>
    </section>
  )
}
