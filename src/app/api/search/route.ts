import { NextResponse } from 'next/server'
import { getAllObjects } from '@/lib/data'
import { searchAllMuseums } from '@/lib/museum-apis'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const museumsParam = searchParams.get('museums') // comma-separated museum IDs, optional

    if (!q || !q.trim()) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const lower = q.toLowerCase()
    const museumFilter = museumsParam
      ? museumsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined

    // RISD local search
    const risdResults = getAllObjects().filter((o) => {
      return (
        o.title.toLowerCase().includes(lower) ||
        o.artist.toLowerCase().includes(lower) ||
        o.medium.toLowerCase().includes(lower) ||
        (o.tags ?? []).some((t) => t.toLowerCase().includes(lower))
      )
    })

    // Cross-museum search (all connected museums)
    const externalResults = await searchAllMuseums(q, { limit: 6, museums: museumFilter })

    // Legacy met field — extract from externalResults for backward compat
    const metGroup = externalResults.find((r) => r.museumId === 'met')
    const metResults = metGroup?.objects.map((o) => ({
      objectID: Number(o.id) || 0,
      title: o.title,
      artistDisplayName: o.artist,
      objectDate: o.date,
      medium: o.medium,
      primaryImageSmall: o.thumbnailUrl ?? o.imageUrl,
      objectURL: o.objectUrl,
      department: o.department ?? '',
      culture: o.culture,
      period: o.period,
    })) ?? []

    return NextResponse.json({
      results: {
        risd: risdResults,
        met: metResults,
        query: q,
        external: externalResults,
      },
      total: risdResults.length + externalResults.reduce((acc, g) => acc + g.objects.length, 0),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
