import Image from 'next/image'
import type { ExternalObject, MetObject } from '@/types'
import MuseumBadge from './MuseumBadge'

interface RelatedGroup {
  museum: string
  objects: ExternalObject[]
}

interface RelatedObjectsProps {
  // New grouped interface
  groups?: RelatedGroup[]
  // Legacy: flat Met objects
  objects?: MetObject[]
  sourceMuseum?: 'met'
}

function RelatedCard({ obj, href, museum }: { obj: { title: string; artistDisplayName?: string; artist?: string; objectDate?: string; date?: string; primaryImageSmall?: string; imageUrl?: string; thumbnailUrl?: string }; href: string; museum: string }) {
  const imageUrl = obj.primaryImageSmall ?? obj.thumbnailUrl ?? obj.imageUrl ?? ''
  const artist = obj.artistDisplayName ?? obj.artist ?? ''
  const date = obj.objectDate ?? obj.date ?? ''

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        width: '160px',
        flexShrink: 0,
        textDecoration: 'none',
        color: 'black',
      }}
      className="related-card-link"
    >
      {imageUrl && (
        <div style={{ position: 'relative', width: '160px', height: '160px', background: '#f0f0f0' }}>
          <Image
            src={imageUrl}
            alt={obj.title}
            fill
            style={{ objectFit: 'contain' }}
            unoptimized
            sizes="160px"
          />
        </div>
      )}
      <div style={{ marginTop: '8px' }}>
        <p style={{
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1.2,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {obj.title}
        </p>
        {artist && (
          <p style={{
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontSize: '11px',
            color: '#989898',
            marginTop: '2px',
          }}>
            {artist}
          </p>
        )}
        {date && (
          <p style={{
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontSize: '11px',
            color: '#989898',
          }}>
            {date}
          </p>
        )}
        <p style={{
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          fontSize: '10px',
          color: '#ccc',
          marginTop: '2px',
        }}>
          {museum}
        </p>
      </div>
    </a>
  )
}

export default function RelatedObjects({ groups, objects, sourceMuseum }: RelatedObjectsProps) {
  // Grouped mode (new)
  if (groups && groups.length > 0) {
    return (
      <section>
        {groups.map((group) => {
          if (group.objects.length === 0) return null
          return (
            <div key={group.museum} style={{ marginBottom: '40px' }}>
              <hr style={{ width: '100%', height: '1px', background: '#e0e0e0', border: 'none', marginBottom: '16px' }} />
              <div style={{ marginBottom: '16px' }}>
                <MuseumBadge name={group.museum} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '24px', paddingBottom: '16px', minWidth: 'max-content' }}>
                  {group.objects.map((obj) => (
                    <RelatedCard
                      key={obj.id}
                      obj={obj}
                      href={obj.objectUrl}
                      museum={group.museum}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </section>
    )
  }

  // Legacy flat Met mode
  if (sourceMuseum === 'met' && objects && objects.length > 0) {
    return (
      <section style={{ marginTop: '40px' }}>
        <hr style={{ width: '100%', height: '1px', background: '#e0e0e0', border: 'none', marginBottom: '16px' }} />
        <div style={{ marginBottom: '16px' }}>
          <MuseumBadge name="The Metropolitan Museum of Art" />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '24px', paddingBottom: '16px', minWidth: 'max-content' }}>
            {objects.map((obj) => (
              <RelatedCard
                key={obj.objectID}
                obj={{
                  title: obj.title,
                  artistDisplayName: obj.artistDisplayName,
                  objectDate: obj.objectDate,
                  primaryImageSmall: obj.primaryImageSmall,
                }}
                href={obj.objectURL}
                museum="The Met"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return null
}
