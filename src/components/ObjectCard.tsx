import Link from 'next/link'
import Image from 'next/image'
import type { MuseumObject } from '@/types'

interface ObjectCardProps {
  object: MuseumObject
}

export default function ObjectCard({ object }: ObjectCardProps) {
  return (
    <Link href={`/objects/${object.id}`} className="object-card block">
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        <Image
          src={object.imageUrl}
          alt={object.title}
          fill
          className="object-contain"
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
      <div className="pt-4 space-y-1">
        <p className="font-serif text-museum-white text-base leading-snug">{object.title}</p>
        <p className="font-mono text-museum-gray text-sm">{object.artist}</p>
        <p className="font-mono text-museum-gray text-sm">{object.date}</p>
      </div>
    </Link>
  )
}
