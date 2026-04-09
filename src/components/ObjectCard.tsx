// ObjectCard is retained for backward compatibility but now renders
// as an ObjectEntry (Bill Viola list style).
import type { MuseumObject } from '@/types'
import ObjectEntry from './ObjectEntry'

interface ObjectCardProps {
  object: MuseumObject
  index?: number
}

export default function ObjectCard({ object, index = 0 }: ObjectCardProps) {
  return <ObjectEntry object={object} index={index} />
}
