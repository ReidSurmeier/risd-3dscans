import { getAllObjects } from '@/lib/data'
import NavBar from '@/components/NavBar'
import HeroText from '@/components/HeroText'
import ObjectGrid from '@/components/ObjectGrid'

export default function HomePage() {
  const objects = getAllObjects()

  return (
    <>
      <NavBar />
      <HeroText />

      {/* Collection description */}
      <div style={{
        padding: '80px 30px 60px',
        maxWidth: '720px',
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
      }}>
        <p style={{
          fontSize: '22px',
          lineHeight: 1.4,
          color: '#111',
          letterSpacing: '-0.02em',
          marginBottom: '24px',
        }}>
          The RISD Museum at Rhode Island School of Design holds one of the most significant art and design
          collections in the United States. This project presents a selection of three-dimensional scan data
          from objects across the museum&apos;s permanent collection.
        </p>
        <p style={{
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#555',
          letterSpacing: '-0.01em',
          marginBottom: '16px',
        }}>
          These 10 objects span cultures and centuries — from Impressionist paintings to modernist sculpture.
          Each object page includes cross-references from museums worldwide for comparative context.
        </p>
        <p style={{
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#555',
          letterSpacing: '-0.01em',
        }}>
          Data sourced directly from RISD Museum collection records. Cross-references via open museum APIs.
        </p>
      </div>

      {/* Object list */}
      <ObjectGrid objects={objects} />

      {/* Footer */}
      <footer style={{
        padding: '60px 30px',
        borderTop: '1px solid #e0e0e0',
        marginTop: '80px',
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
        fontSize: '11px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#989898',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span>RISD Museum 3D Scans Collection</span>
        <span>Providence, Rhode Island</span>
      </footer>
    </>
  )
}
