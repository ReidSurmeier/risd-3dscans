import type { MuseumObject } from '@/types'
import ObjectEntry from './ObjectEntry'

interface ObjectGridProps {
  objects: MuseumObject[]
}

export default function ObjectGrid({ objects }: ObjectGridProps) {
  if (objects.length === 0) {
    return (
      <p style={{
        fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
        fontSize: '3.4vw',
        marginTop: '200px',
        color: '#989898',
      }}>
        Collection loading...
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginTop: '200px' }}>
      {objects.map((obj, i) => (
        <ObjectEntry key={obj.id} object={obj} index={i} />
      ))}
    </ul>
  )
}
