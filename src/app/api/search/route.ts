import { NextResponse } from 'next/server'
import { getAllObjects } from '@/lib/data'
import { searchMetByQuery } from '@/lib/met-api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || !q.trim()) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const lower = q.toLowerCase()

    const risdResults = getAllObjects().filter((o) => {
      return (
        o.title.toLowerCase().includes(lower) ||
        o.artist.toLowerCase().includes(lower) ||
        o.medium.toLowerCase().includes(lower) ||
        (o.tags ?? []).some((t) => t.toLowerCase().includes(lower))
      )
    })

    const metResults = await searchMetByQuery(q, 6)

    return NextResponse.json({
      results: { risd: risdResults, met: metResults, query: q },
      total: risdResults.length + metResults.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
