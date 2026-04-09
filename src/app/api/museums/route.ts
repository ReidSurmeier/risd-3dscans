import { NextResponse } from 'next/server'
import { MUSEUM_CLIENTS } from '@/lib/museum-apis'
import type { MuseumStatus, ApiMuseumsResponse } from '@/types'

export async function GET() {
  const museums: MuseumStatus[] = MUSEUM_CLIENTS.map((c) => {
    const configured = !c.requiresKey || Boolean(
      (c.id === 'smithsonian' && process.env.SMITHSONIAN_API_KEY) ||
      (c.id === 'harvard' && process.env.HARVARD_API_KEY) ||
      (c.id === 'europeana' && process.env.EUROPEANA_API_KEY) ||
      (c.id === 'brooklyn' && process.env.BROOKLYN_API_KEY)
    )

    const urls: Record<string, string> = {
      met: 'https://collectionapi.metmuseum.org/public/collection/v1',
      artic: 'https://api.artic.edu/api/v1',
      cleveland: 'https://openaccess-api.clevelandart.org/api',
      va: 'https://api.vam.ac.uk/v2',
      mia: 'https://search.artsmia.org',
      rijks: 'https://data.rijksmuseum.nl/search/collection',
      smithsonian: 'https://api.si.edu/openaccess/api/v1.0',
      harvard: 'https://api.harvardartmuseums.org',
      europeana: 'https://api.europeana.eu/record/v2',
      brooklyn: 'https://www.brooklynmuseum.org/api/v2',
    }

    return {
      id: c.id,
      name: c.name,
      url: urls[c.id] ?? '',
      requiresKey: c.requiresKey,
      configured,
      objectCount: c.objectCount,
    }
  })

  // Wikidata is always available (no key needed)
  museums.push({
    id: 'wikidata',
    name: 'Wikidata (cross-reference hub)',
    url: 'https://query.wikidata.org/sparql',
    requiresKey: false,
    configured: true,
    objectCount: 'Universal',
  })

  const response: ApiMuseumsResponse = {
    museums,
    total: museums.length,
  }

  return NextResponse.json(response)
}
