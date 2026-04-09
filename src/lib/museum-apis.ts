// Unified museum API client
// Implements REST clients for 12 museum APIs (no-auth + API-key-gated)

import type { ExternalObject } from '@/types'

const CACHE = { next: { revalidate: 86400 } } as const

// ─── Helpers ────────────────────────────────────────────────────────────────

async function safeFetch(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, CACHE)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function enc(s: string) {
  return encodeURIComponent(s)
}

// ─── Met Museum ──────────────────────────────────────────────────────────────

async function metSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const data = await safeFetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${enc(q)}&hasImages=true`
  )
  if (!data || typeof data !== 'object') return []
  const { objectIDs } = data as { objectIDs?: number[] }
  if (!objectIDs?.length) return []

  const ids = objectIDs.slice(0, limit * 3)
  const results = await Promise.allSettled(
    ids.map((id) =>
      safeFetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
    )
  )

  const out: ExternalObject[] = []
  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value) continue
    const v = r.value as Record<string, unknown>
    if (!v.primaryImageSmall) continue
    out.push({
      id: String(v.objectID),
      title: String(v.title ?? ''),
      artist: String(v.artistDisplayName ?? ''),
      date: String(v.objectDate ?? ''),
      medium: String(v.medium ?? ''),
      imageUrl: String(v.primaryImage ?? v.primaryImageSmall ?? ''),
      thumbnailUrl: String(v.primaryImageSmall ?? ''),
      objectUrl: String(v.objectURL ?? ''),
      museum: 'Metropolitan Museum of Art',
      museumId: 'met',
      department: String(v.department ?? ''),
      culture: v.culture ? String(v.culture) : undefined,
      period: v.period ? String(v.period) : undefined,
      classification: v.classification ? String(v.classification) : undefined,
    })
    if (out.length >= limit) break
  }
  return out
}

// ─── Art Institute of Chicago ────────────────────────────────────────────────

async function articSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const fields = 'id,title,artist_display,date_display,medium_display,image_id,object_type,department_title,style_title,place_of_origin'
  const data = await safeFetch(
    `https://api.artic.edu/api/v1/artworks/search?q=${enc(q)}&limit=${limit}&fields=${fields}`
  )
  if (!data || typeof data !== 'object') return []
  const { data: items } = data as { data?: Record<string, unknown>[] }
  if (!items?.length) return []

  return items
    .filter((v) => v.image_id)
    .map((v) => ({
      id: String(v.id),
      title: String(v.title ?? ''),
      artist: String(v.artist_display ?? ''),
      date: String(v.date_display ?? ''),
      medium: String(v.medium_display ?? ''),
      imageUrl: `https://www.artic.edu/iiif/2/${v.image_id}/full/843,/0/default.jpg`,
      thumbnailUrl: `https://www.artic.edu/iiif/2/${v.image_id}/full/200,/0/default.jpg`,
      objectUrl: `https://www.artic.edu/artworks/${v.id}`,
      museum: 'Art Institute of Chicago',
      museumId: 'artic',
      department: v.department_title ? String(v.department_title) : undefined,
      culture: v.place_of_origin ? String(v.place_of_origin) : undefined,
      classification: v.object_type ? String(v.object_type) : undefined,
    }))
    .slice(0, limit)
}

// ─── Cleveland Museum of Art ─────────────────────────────────────────────────

async function clevelandSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const data = await safeFetch(
    `https://openaccess-api.clevelandart.org/api/artworks/?q=${enc(q)}&has_image=1&limit=${limit}`
  )
  if (!data || typeof data !== 'object') return []
  const { data: items } = data as { data?: Record<string, unknown>[] }
  if (!items?.length) return []

  return items
    .map((v) => {
      const images = v.images as Record<string, { url?: string }> | undefined
      const imgUrl = images?.web?.url ?? images?.print?.url ?? ''
      const creators = v.creators as { description?: string }[] | undefined
      const artist = creators?.[0]?.description ?? ''
      return {
        id: String(v.id),
        title: String(v.title ?? ''),
        artist,
        date: String(v.creation_date ?? ''),
        medium: String(v.technique ?? v.type ?? ''),
        imageUrl: imgUrl,
        thumbnailUrl: imgUrl,
        objectUrl: `https://www.clevelandart.org/art/${v.accession_number}`,
        museum: 'Cleveland Museum of Art',
        museumId: 'cleveland',
        department: v.department ? String(v.department) : undefined,
        culture: v.culture ? String(v.culture) : undefined,
        classification: v.type ? String(v.type) : undefined,
      }
    })
    .filter((o) => o.imageUrl)
    .slice(0, limit)
}

// ─── V&A Museum ───────────────────────────────────────────────────────────────

async function vaSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const data = await safeFetch(
    `https://api.vam.ac.uk/v2/objects/search?q=${enc(q)}&page_size=${limit}&images_exist=true`
  )
  if (!data || typeof data !== 'object') return []
  const { records } = data as { records?: Record<string, unknown>[] }
  if (!records?.length) return []

  return records
    .map((v) => {
      const images = v._images as Record<string, unknown> | undefined
      const imgUrl = images?.['_primary_thumbnail']
        ? String(images['_primary_thumbnail'])
        : images?.['_iiif_image']
        ? String(images['_iiif_image'])
        : ''
      const artists = v._primaryMaker as { name?: string } | undefined
      return {
        id: String(v.systemNumber ?? v.objectNumber ?? ''),
        title: String(v._primaryTitle ?? ''),
        artist: artists?.name ?? '',
        date: String(v._primaryDate ?? ''),
        medium: String(v.materialsAndTechniques ?? ''),
        imageUrl: imgUrl,
        thumbnailUrl: imgUrl,
        objectUrl: `https://collections.vam.ac.uk/item/${v.systemNumber}`,
        museum: 'Victoria and Albert Museum',
        museumId: 'va',
        classification: v.objectType ? String(v.objectType) : undefined,
        culture: v.placesOfOrigin
          ? String((v.placesOfOrigin as { place?: { text?: string } }[])[0]?.place?.text ?? '')
          : undefined,
      }
    })
    .filter((o) => o.imageUrl && o.id)
    .slice(0, limit)
}

// ─── Minneapolis Institute of Art ────────────────────────────────────────────

async function miaSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const data = await safeFetch(`https://search.artsmia.org/${enc(q)}`)
  if (!data || typeof data !== 'object') return []
  // MIA returns an array or wrapped object
  const items = Array.isArray(data) ? data : (data as { hits?: { hits?: { _source?: unknown }[] } }).hits?.hits ?? []

  const out: ExternalObject[] = []
  for (const item of items as Record<string, unknown>[]) {
    const v = (item._source ?? item) as Record<string, unknown>
    if (v.image !== 'valid' && !v.image_copyright) {
      // skip objects with no valid image flag, but don't break
    }
    const id = String(v.id ?? '')
    if (!id) continue
    const imgUrl = v.image === 'valid'
      ? `https://cdn.artsmia.org/medium/${id}.jpg`
      : ''
    out.push({
      id,
      title: String(v.title ?? ''),
      artist: String(v.artist ?? ''),
      date: String(v.dated ?? ''),
      medium: String(v.medium ?? ''),
      imageUrl: imgUrl,
      thumbnailUrl: imgUrl ? `https://cdn.artsmia.org/small/${id}.jpg` : undefined,
      objectUrl: `https://collections.artsmia.org/art/${id}`,
      museum: 'Minneapolis Institute of Art',
      museumId: 'mia',
      department: v.department ? String(v.department) : undefined,
      culture: v.culture ? String(v.culture) : undefined,
      classification: v.classification ? String(v.classification) : undefined,
    })
    if (out.length >= limit) break
  }
  return out
}

// ─── Rijksmuseum (Linked Art) ─────────────────────────────────────────────────

async function rijksSearch(q: string, limit: number): Promise<ExternalObject[]> {
  // Uses the new Linked Art search endpoint
  const data = await safeFetch(
    `https://data.rijksmuseum.nl/search/collection?q=${enc(q)}&imageAvailable=true`
  )
  if (!data || typeof data !== 'object') return []
  const d = data as Record<string, unknown>
  const orderedItems = (d.orderedItems ?? d['hydra:member'] ?? []) as Record<string, unknown>[]
  if (!orderedItems.length) return []

  const out: ExternalObject[] = []
  for (const item of orderedItems.slice(0, limit * 2)) {
    const id = String(item.id ?? item['@id'] ?? '')
    if (!id) continue
    // Fetch the individual object for image data
    const obj = await safeFetch(id.endsWith('.json') ? id : `${id}.json`)
    if (!obj || typeof obj !== 'object') {
      // use summary data from list
      out.push({
        id,
        title: String(item.label ?? ''),
        artist: '',
        date: '',
        medium: '',
        imageUrl: '',
        objectUrl: id.replace('.json', ''),
        museum: 'Rijksmuseum',
        museumId: 'rijks',
      })
    } else {
      const o = obj as Record<string, unknown>
      const identified = (o.identified_by as { content?: string; type?: string }[] | undefined) ?? []
      const title = identified.find((x) => x.type === 'Name')?.content ?? String(item.label ?? '')
      const produced = (o.produced_by as Record<string, unknown> | undefined) ?? {}
      const carried = (produced.carried_out_by as { id?: string; _label?: string }[] | undefined) ?? []
      const artist = carried[0]?._label ?? ''
      const timespan = (produced.timespan as { identified_by?: { content?: string }[] } | undefined)
      const date = timespan?.identified_by?.[0]?.content ?? ''
      const depictions = (o.representation as { id?: string }[] | undefined) ?? []
      const imgUrl = depictions[0]?.id ?? ''
      out.push({
        id,
        title,
        artist,
        date,
        medium: '',
        imageUrl: imgUrl,
        thumbnailUrl: imgUrl,
        objectUrl: id.replace('.json', ''),
        museum: 'Rijksmuseum',
        museumId: 'rijks',
      })
    }
    if (out.length >= limit) break
  }
  return out.filter((o) => o.title)
}

// ─── Smithsonian ─────────────────────────────────────────────────────────────

async function smithsonianSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const key = process.env.SMITHSONIAN_API_KEY ?? 'DEMO_KEY'
  const data = await safeFetch(
    `https://api.si.edu/openaccess/api/v1.0/search?q=${enc(q)}&rows=${limit}&api_key=${key}`
  )
  if (!data || typeof data !== 'object') return []
  const d = data as Record<string, unknown>
  const rows = (d.response as Record<string, unknown>)?.rows as Record<string, unknown>[] | undefined
  if (!rows?.length) return []

  return rows
    .map((row) => {
      const desc = row.descriptiveNonRepeating as Record<string, unknown> | undefined
      const freetext = row.freetext as Record<string, unknown[]> | undefined
      const media = desc?.online_media as { media?: { content?: string; thumbnail?: string }[] } | undefined
      const imgUrl = media?.media?.[0]?.content ?? ''
      const thumbUrl = media?.media?.[0]?.thumbnail ?? imgUrl
      const titleArr = freetext?.title as { content?: string }[] | undefined
      const artistArr = freetext?.name as { content?: string }[] | undefined
      const dateArr = freetext?.date as { content?: string }[] | undefined
      const mediumArr = freetext?.physicalDescription as { content?: string }[] | undefined
      return {
        id: String(row.id ?? ''),
        title: titleArr?.[0]?.content ?? String((desc?.title as Record<string, unknown>)?.['content'] ?? ''),
        artist: artistArr?.[0]?.content ?? '',
        date: dateArr?.[0]?.content ?? '',
        medium: mediumArr?.[0]?.content ?? '',
        imageUrl: imgUrl,
        thumbnailUrl: thumbUrl || undefined,
        objectUrl: String(desc?.record_link ?? desc?.guid ?? ''),
        museum: 'Smithsonian Institution',
        museumId: 'smithsonian',
        classification: freetext?.objectType
          ? String((freetext.objectType as { content?: string }[])[0]?.content ?? '')
          : undefined,
      }
    })
    .filter((o) => o.id && o.title)
    .slice(0, limit)
}

// ─── Harvard Art Museums ──────────────────────────────────────────────────────

async function harvardSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const key = process.env.HARVARD_API_KEY
  if (!key) return []
  const fields = 'objectnumber,title,people,primaryimageurl,dated,technique,department,culture,period,classification,url'
  const data = await safeFetch(
    `https://api.harvardartmuseums.org/object?apikey=${key}&q=${enc(q)}&size=${limit}&fields=${fields}&hasimage=1`
  )
  if (!data || typeof data !== 'object') return []
  const { records } = data as { records?: Record<string, unknown>[] }
  if (!records?.length) return []

  return records
    .map((v) => {
      const people = v.people as { name?: string; role?: string }[] | undefined
      const artist = people?.find((p) => p.role === 'Artist')?.name ?? people?.[0]?.name ?? ''
      const imgUrl = String(v.primaryimageurl ?? '')
      return {
        id: String(v.objectnumber ?? ''),
        title: String(v.title ?? ''),
        artist,
        date: String(v.dated ?? ''),
        medium: String(v.technique ?? ''),
        imageUrl: imgUrl,
        thumbnailUrl: imgUrl ? `${imgUrl}?height=150&width=150` : undefined,
        objectUrl: String(v.url ?? `https://harvardartmuseums.org/collections/object/${v.id}`),
        museum: 'Harvard Art Museums',
        museumId: 'harvard',
        department: v.department ? String(v.department) : undefined,
        culture: v.culture ? String(v.culture) : undefined,
        period: v.period ? String(v.period) : undefined,
        classification: v.classification ? String(v.classification) : undefined,
      }
    })
    .filter((o) => o.imageUrl)
    .slice(0, limit)
}

// ─── Europeana ────────────────────────────────────────────────────────────────

async function europeanaSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const key = process.env.EUROPEANA_API_KEY ?? 'api2demo'
  const data = await safeFetch(
    `https://api.europeana.eu/record/v2/search.json?query=${enc(q)}&rows=${limit}&wskey=${key}&media=true&thumbnail=true`
  )
  if (!data || typeof data !== 'object') return []
  const { items } = data as { items?: Record<string, unknown>[] }
  if (!items?.length) return []

  return items
    .map((v) => {
      const imgUrl = String(
        (v.edmIsShownBy as string[] | undefined)?.[0] ??
        (v.edmPreview as string[] | undefined)?.[0] ?? ''
      )
      const thumbUrl = String((v.edmPreview as string[] | undefined)?.[0] ?? imgUrl)
      const dcTitle = v.title as string[] | undefined
      const dcCreator = v.dcCreator as string[] | undefined
      const dcDate = v.year as string[] | undefined
      const dcType = v.type as string | undefined
      return {
        id: String(v.id ?? ''),
        title: dcTitle?.[0] ?? '',
        artist: dcCreator?.[0] ?? '',
        date: dcDate?.[0] ?? '',
        medium: dcType ?? '',
        imageUrl: imgUrl,
        thumbnailUrl: thumbUrl || undefined,
        objectUrl: String((v.edmIsShownAt as string[] | undefined)?.[0] ?? ''),
        museum: String((v.dataProvider as string[] | undefined)?.[0] ?? 'Europeana'),
        museumId: 'europeana',
        culture: v.edmCountry ? String((v.edmCountry as string[])[0]) : undefined,
      }
    })
    .filter((o) => o.id && o.title && o.imageUrl)
    .slice(0, limit)
}

// ─── Brooklyn Museum ──────────────────────────────────────────────────────────

async function brooklynSearch(q: string, limit: number): Promise<ExternalObject[]> {
  const key = process.env.BROOKLYN_API_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://www.brooklynmuseum.org/api/v2/object/?limit=${limit}&keyword=${enc(q)}`,
      { headers: { api_key: key }, ...CACHE }
    )
    if (!res.ok) return []
    const data = await res.json() as Record<string, unknown>
    const items = data.data as Record<string, unknown>[] | undefined
    if (!items?.length) return []

    return items
      .map((v) => {
        const imgs = v.images as { largest_derivative_url?: string }[] | undefined
        const imgUrl = imgs?.[0]?.largest_derivative_url ?? ''
        return {
          id: String(v.id ?? ''),
          title: String(v.title ?? ''),
          artist: String(v.artist_display_name ?? (v.artists as { name?: string }[])?.[0]?.name ?? ''),
          date: String(v.object_date ?? ''),
          medium: String(v.medium ?? ''),
          imageUrl: imgUrl,
          thumbnailUrl: imgUrl || undefined,
          objectUrl: `https://www.brooklynmuseum.org/opencollection/objects/${v.id}`,
          museum: 'Brooklyn Museum',
          museumId: 'brooklyn',
          department: v.department ? String(v.department) : undefined,
          classification: v.object_type ? String(v.object_type) : undefined,
        }
      })
      .filter((o) => o.imageUrl)
      .slice(0, limit)
  } catch {
    return []
  }
}

// ─── Wikidata SPARQL ──────────────────────────────────────────────────────────

export async function wikidataSearchByArtist(artist: string, limit: number): Promise<ExternalObject[]> {
  const sparql = `
SELECT ?item ?itemLabel ?image ?date ?medium ?collectionLabel ?inv WHERE {
  ?item wdt:P170 ?creator .
  ?creator rdfs:label ?creatorLabel .
  FILTER(CONTAINS(LCASE(?creatorLabel), LCASE("${artist.replace(/"/g, '')}")))
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P571 ?date }
  OPTIONAL { ?item wdt:P186 ?mediumItem . ?mediumItem rdfs:label ?medium FILTER(LANG(?medium) = "en") }
  OPTIONAL { ?item wdt:P195 ?collection }
  OPTIONAL { ?item wdt:P217 ?inv }
  FILTER(BOUND(?image))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
} LIMIT ${limit}`

  const data = await safeFetch(
    `https://query.wikidata.org/sparql?query=${enc(sparql)}&format=json`
  )
  if (!data || typeof data !== 'object') return []
  const { results } = data as { results?: { bindings?: Record<string, { value: string }>[] } }
  if (!results?.bindings?.length) return []

  return results.bindings.map((b) => ({
    id: b.item?.value?.split('/').pop() ?? '',
    title: b.itemLabel?.value ?? '',
    artist,
    date: b.date?.value?.split('T')[0] ?? '',
    medium: b.medium?.value ?? '',
    imageUrl: b.image?.value ?? '',
    thumbnailUrl: b.image?.value
      ? b.image.value.replace('http://', 'https://')
      : undefined,
    objectUrl: b.item?.value ?? '',
    museum: b.collectionLabel?.value ?? 'Wikidata',
    museumId: 'wikidata',
  })).filter((o) => o.id && o.imageUrl)
}

// ─── Museum API interface ─────────────────────────────────────────────────────

export interface MuseumApiClient {
  name: string
  id: string
  requiresKey: boolean
  objectCount: string
  searchByArtist(artist: string, limit?: number): Promise<ExternalObject[]>
  searchByQuery(query: string, limit?: number): Promise<ExternalObject[]>
}

export const MUSEUM_CLIENTS: MuseumApiClient[] = [
  {
    name: 'Metropolitan Museum of Art',
    id: 'met',
    requiresKey: false,
    objectCount: '490,000+',
    searchByArtist: (a, l = 6) => metSearch(a, l),
    searchByQuery: (q, l = 6) => metSearch(q, l),
  },
  {
    name: 'Art Institute of Chicago',
    id: 'artic',
    requiresKey: false,
    objectCount: '100,000+',
    searchByArtist: (a, l = 6) => articSearch(a, l),
    searchByQuery: (q, l = 6) => articSearch(q, l),
  },
  {
    name: 'Cleveland Museum of Art',
    id: 'cleveland',
    requiresKey: false,
    objectCount: '64,000+',
    searchByArtist: (a, l = 6) => clevelandSearch(a, l),
    searchByQuery: (q, l = 6) => clevelandSearch(q, l),
  },
  {
    name: 'Victoria and Albert Museum',
    id: 'va',
    requiresKey: false,
    objectCount: '1,200,000+',
    searchByArtist: (a, l = 6) => vaSearch(a, l),
    searchByQuery: (q, l = 6) => vaSearch(q, l),
  },
  {
    name: 'Minneapolis Institute of Art',
    id: 'mia',
    requiresKey: false,
    objectCount: '90,000+',
    searchByArtist: (a, l = 6) => miaSearch(a, l),
    searchByQuery: (q, l = 6) => miaSearch(q, l),
  },
  {
    name: 'Rijksmuseum',
    id: 'rijks',
    requiresKey: false,
    objectCount: '800,000+',
    searchByArtist: (a, l = 6) => rijksSearch(a, l),
    searchByQuery: (q, l = 6) => rijksSearch(q, l),
  },
  {
    name: 'Smithsonian Institution',
    id: 'smithsonian',
    requiresKey: true,
    objectCount: '11,000,000+',
    searchByArtist: (a, l = 6) => smithsonianSearch(a, l),
    searchByQuery: (q, l = 6) => smithsonianSearch(q, l),
  },
  {
    name: 'Harvard Art Museums',
    id: 'harvard',
    requiresKey: true,
    objectCount: '250,000+',
    searchByArtist: (a, l = 6) => harvardSearch(a, l),
    searchByQuery: (q, l = 6) => harvardSearch(q, l),
  },
  {
    name: 'Europeana',
    id: 'europeana',
    requiresKey: true,
    objectCount: '50,000,000+',
    searchByArtist: (a, l = 6) => europeanaSearch(a, l),
    searchByQuery: (q, l = 6) => europeanaSearch(q, l),
  },
  {
    name: 'Brooklyn Museum',
    id: 'brooklyn',
    requiresKey: true,
    objectCount: '200,000+',
    searchByArtist: (a, l = 6) => brooklynSearch(a, l),
    searchByQuery: (q, l = 6) => brooklynSearch(q, l),
  },
]

// ─── Parallel search across all museums ──────────────────────────────────────

export async function searchAllMuseums(
  query: string,
  options: { limit?: number; museums?: string[] } = {}
): Promise<{ museumId: string; museum: string; objects: ExternalObject[] }[]> {
  const { limit = 6, museums } = options
  const clients = museums
    ? MUSEUM_CLIENTS.filter((c) => museums.includes(c.id))
    : MUSEUM_CLIENTS

  const results = await Promise.allSettled(
    clients.map((c) => c.searchByQuery(query, limit))
  )

  return results
    .map((r, i) => ({
      museumId: clients[i].id,
      museum: clients[i].name,
      objects: r.status === 'fulfilled' ? r.value : [],
    }))
    .filter((r) => r.objects.length > 0)
}

export async function searchAllMuseumsByArtist(
  artist: string,
  options: { limit?: number; museums?: string[] } = {}
): Promise<{ museumId: string; museum: string; objects: ExternalObject[] }[]> {
  const { limit = 6, museums } = options
  const clients = museums
    ? MUSEUM_CLIENTS.filter((c) => museums.includes(c.id))
    : MUSEUM_CLIENTS

  const results = await Promise.allSettled(
    clients.map((c) => c.searchByArtist(artist, limit))
  )

  return results
    .map((r, i) => ({
      museumId: clients[i].id,
      museum: clients[i].name,
      objects: r.status === 'fulfilled' ? r.value : [],
    }))
    .filter((r) => r.objects.length > 0)
}
