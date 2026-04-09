import type { MuseumObject } from '@/types'
import objectsIndex from '../../data/objects/index.json'

// Load all objects from JSON data files
export function getAllObjects(): MuseumObject[] {
  return objectsIndex as MuseumObject[]
}

export function getObjectById(id: string): MuseumObject | undefined {
  return getAllObjects().find((obj) => obj.id === id)
}
