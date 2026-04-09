import { NextResponse } from 'next/server'
import { getObjectById } from '@/lib/data'
import { searchMetByArtist, searchMetByQuery } from '@/lib/met-api'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const object = getObjectById(params.id)

    if (!object) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isUnknownArtist =
      !object.artist || object.artist.toLowerCase().includes('unknown')

    let relatedMet = isUnknownArtist
      ? await searchMetByQuery(
          object.tags?.length ? object.tags[0] : object.medium,
          6
        )
      : await searchMetByArtist(object.artist, 6)

    // Fallback: if artist search yielded nothing, try medium/tags
    if (!relatedMet.length && !isUnknownArtist) {
      relatedMet = await searchMetByQuery(
        object.tags?.length ? object.tags[0] : object.medium,
        6
      )
    }

    return NextResponse.json({ object, relatedMet })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
