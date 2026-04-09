import type { MuseumObject } from '@/types'
import ObjectCard from './ObjectCard'

interface ObjectGridProps {
  objects: MuseumObject[]
}

export default function ObjectGrid({ objects }: ObjectGridProps) {
  if (objects.length === 0) {
    return (
      <p className="font-mono text-museum-gray text-sm px-6 md:px-12">
        Collection loading...
      </p>
    )
  }

  return (
    <div className="object-grid px-6 md:px-12 pb-24">
      {objects.map((obj) => (
        <ObjectCard key={obj.id} object={obj} />
      ))}
    </div>
  )
}
