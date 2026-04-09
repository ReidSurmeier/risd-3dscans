import Image from 'next/image'
import Link from 'next/link'
import type { MuseumObject, MetObject } from '@/types'
import RelatedObjects from './RelatedObjects'
import ModelViewer from './ModelViewer'

interface ObjectDetailProps {
  object: MuseumObject
  relatedMet: MetObject[]
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value || value === 'Not available') return null
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #e8e8e8' }}>
      <span style={{
        display: 'block',
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#989898',
        fontWeight: 500,
        marginBottom: '3px',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
        fontSize: '15px',
        color: '#111',
        lineHeight: 1.3,
      }}>
        {value}
      </span>
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <>
      <hr style={{ width: '100%', height: '1px', background: '#e0e0e0', border: 'none', margin: '32px 0 16px' }} />
      <h2 style={{
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#989898',
        fontWeight: 500,
        marginBottom: '12px',
      }}>
        {children}
      </h2>
    </>
  )
}

export default function ObjectDetail({ object, relatedMet }: ObjectDetailProps) {
  return (
    <main style={{
      background: '#fafafa',
      minHeight: '100vh',
      paddingTop: '60px',
      fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
      color: 'black',
    }}>
      {/* Hero image */}
      <div style={{
        width: '100%',
        maxHeight: '70vh',
        overflow: 'hidden',
        background: '#f0f0f0',
        position: 'relative',
      }}>
        <Image
          src={object.imageUrl}
          alt={object.title}
          width={1600}
          height={900}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '70vh',
            objectFit: 'contain',
            display: 'block',
          }}
          unoptimized
          priority
        />
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        padding: '48px 30px',
        maxWidth: '1200px',
      }}>
        {/* Left: metadata */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontWeight: 900,
            fontSize: 'clamp(22px, 2.5vw, 40px)',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.9,
            marginBottom: '24px',
            color: 'black',
          }}>
            {object.title}
          </h1>

          <MetaRow label="Artist" value={object.artistFull ?? object.artist} />
          <MetaRow label="Date" value={object.date} />
          <MetaRow label="Medium" value={object.medium} />
          <MetaRow label="Dimensions" value={object.dimensions} />
          <MetaRow label="Classification" value={object.classification} />
          <MetaRow label="Art Movement" value={object.artMovement} />
          <MetaRow label="Time Period" value={object.timePeriod} />
          <MetaRow label="Geographic Origin" value={object.geographicOrigin} />
          {object.culture && <MetaRow label="Culture" value={object.culture} />}
          <MetaRow label="On View" value={object.onViewLocation} />
          <MetaRow label="Credit" value={object.credit} />
          <MetaRow label="Accession No." value={object.accessionNumber} />

          <div style={{ marginTop: '24px' }}>
            <a
              href={object.risdUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'black',
                textDecoration: 'none',
                borderBottom: '1px solid black',
                paddingBottom: '2px',
              }}
            >
              View on RISD Museum →
            </a>
          </div>
        </div>

        {/* Right: description + provenance + exhibition + bibliography */}
        <div>
          {object.description && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
                fontSize: '17px',
                lineHeight: 1.5,
                color: '#111',
                letterSpacing: '-0.01em',
              }}>
                {object.description}
              </p>
            </div>
          )}

          {object.provenance && (
            <>
              <SectionHead>Provenance</SectionHead>
              <p style={{
                fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
                fontSize: '15px',
                lineHeight: 1.5,
                color: '#111',
              }}>
                {object.provenance}
              </p>
            </>
          )}

          {object.exhibitionHistory && object.exhibitionHistory.length > 0 && (
            <>
              <SectionHead>Exhibition History</SectionHead>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {object.exhibitionHistory.map((entry, i) => (
                  <li key={i} style={{
                    fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
                    fontSize: '15px',
                    lineHeight: 1.4,
                    marginBottom: '6px',
                    color: '#111',
                  }}>
                    {entry}
                  </li>
                ))}
              </ul>
            </>
          )}

          {object.bibliography && object.bibliography.length > 0 && (
            <>
              <SectionHead>Bibliography</SectionHead>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {object.bibliography.map((entry, i) => (
                  <li key={i} style={{
                    fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
                    fontSize: '15px',
                    lineHeight: 1.4,
                    marginBottom: '6px',
                    color: '#111',
                  }}>
                    {entry}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Related objects from Met */}
      {relatedMet.length > 0 && (
        <div style={{ padding: '0 30px 40px' }}>
          <SectionHead>Related Works</SectionHead>
          <RelatedObjects objects={relatedMet} sourceMuseum="met" />
        </div>
      )}

      {/* 3D model stub */}
      <div style={{ padding: '0 30px 60px' }}>
        <SectionHead>3D Model</SectionHead>
        <ModelViewer modelPath={object.modelPath} objectTitle={object.title} />
      </div>

      {/* Back link */}
      <div style={{ padding: '0 30px 80px' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'black',
            textDecoration: 'none',
            borderBottom: '1px solid black',
            paddingBottom: '2px',
          }}
        >
          ← Back to Collection
        </Link>
      </div>
    </main>
  )
}
