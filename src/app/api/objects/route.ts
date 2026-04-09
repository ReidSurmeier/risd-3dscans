import { NextResponse } from 'next/server'
import { getAllObjects } from '@/lib/data'
import type { MuseumObject } from '@/types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const medium = searchParams.get('medium')?.toLowerCase()
    const artist = searchParams.get('artist')?.toLowerCase()

    let objects: MuseumObject[] = getAllObjects()

    if (medium) {
      objects = objects.filter((o) => o.medium.toLowerCase().includes(medium))
    }
    if (artist) {
      objects = objects.filter((o) => o.artist.toLowerCase().includes(artist))
    }

    return NextResponse.json({ objects, total: objects.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
