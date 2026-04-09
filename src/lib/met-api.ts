// Met Museum Open Access API client
// Docs: https://metmuseum.github.io/
// No auth required. Rate limit: 80 req/sec.

import type { MetObject } from '@/types'

const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

export async function searchMetByArtist(artist: string, limit = 6): Promise<MetObject[]> {
  if (!artist || artist.toLowerCase().includes('unknown')) return []
  return searchMet(artist, limit)
}

export async function searchMetByQuery(query: string, limit = 6): Promise<MetObject[]> {
  return searchMet(query, limit)
}

async function searchMet(q: string, limit: number): Promise<MetObject[]> {
  try {
    const searchRes = await fetch(
      `${MET_BASE}/search?q=${encodeURIComponent(q)}&hasImages=true`,
      { next: { revalidate: 86400 } } // cache 24h
    )
    if (!searchRes.ok) return []
    const { objectIDs } = await searchRes.json()
    if (!objectIDs?.length) return []

    const ids = objectIDs.slice(0, limit * 3) // fetch extra, filter empties
    const objects = await Promise.allSettled(
      ids.map((id: number) =>
        fetch(`${MET_BASE}/objects/${id}`, { next: { revalidate: 86400 } }).then((r) => r.json())
      )
    )

    const results: MetObject[] = objects
      .filter(
        (r): r is PromiseFulfilledResult<MetObject> =>
          r.status === 'fulfilled' && r.value?.primaryImageSmall
      )
      .map((r) => {
        const v = r.value
        return {
          objectID: v.objectID,
          title: v.title,
          artistDisplayName: v.artistDisplayName,
          objectDate: v.objectDate,
          medium: v.medium,
          primaryImageSmall: v.primaryImageSmall,
          objectURL: v.objectURL,
          department: v.department,
          culture: v.culture,
          period: v.period,
        }
      })
      .slice(0, limit)

    return results
  } catch {
    return []
  }
}
