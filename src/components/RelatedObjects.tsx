import Image from 'next/image'
import type { MetObject } from '@/types'

interface RelatedObjectsProps {
  objects: MetObject[]
  sourceMuseum: 'met'
}

export default function RelatedObjects({ objects }: RelatedObjectsProps) {
  if (objects.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="font-mono text-xs tracking-widest uppercase text-museum-gray mb-6">
        Related — The Met
      </h2>
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
          {objects.map((obj) => (
            <a
              key={obj.objectID}
              href={obj.objectURL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-40 shrink-0 hover:opacity-75 transition-opacity"
            >
              <div className="relative w-40 h-40 bg-museum-muted/20">
                <Image
                  src={obj.primaryImageSmall}
                  alt={obj.title}
                  fill
                  className="object-contain"
                  unoptimized
                  sizes="160px"
                />
              </div>
              <div className="mt-2 space-y-1">
                <p className="font-serif text-museum-white text-xs leading-snug line-clamp-2">
                  {obj.title}
                </p>
                <p className="font-mono text-museum-gray text-xs">The Met</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
