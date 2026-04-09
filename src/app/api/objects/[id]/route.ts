import { NextResponse } from 'next/server'
import { getObjectById } from '@/lib/data'
import { searchMetByArtist, searchMetByQuery } from '@/lib/met-api'
import { findRelatedObjects } from '@/lib/cross-reference'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const object = getObjectById(params.id)

    if (!object) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isUnknownArtist =
      !object.artist || object.artist.toLowerCase().includes('unknown')

    // Legacy Met results (backward compat)
    let relatedMet = isUnknownArtist
      ? await searchMetByQuery(
          object.tags?.length ? object.tags[0] : object.medium,
          6
        )
      : await searchMetByArtist(object.artist, 6)

    if (!relatedMet.length && !isUnknownArtist) {
      relatedMet = await searchMetByQuery(
        object.tags?.length ? object.tags[0] : object.medium,
        6
      )
    }

    // Full cross-reference across all connected museums
    const relatedObjects = await findRelatedObjects(object, { limit: 6 })

    return NextResponse.json({ object, relatedMet, relatedObjects })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
