// Smart cross-referencing engine
// Finds related objects across museums based on artist, movement, medium, culture, period

import type { MuseumObject, ExternalObject, CrossReferenceResult } from '@/types'
import {
  searchAllMuseums,
  searchAllMuseumsByArtist,
  wikidataSearchByArtist,
} from './museum-apis'

// ─── Artist name normalization ────────────────────────────────────────────────
// "Claude Monet" ↔ "Monet, Claude"  ↔  "monet"

function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
}

function artistQueryVariants(artist: string): string[] {
  const clean = artist.replace(/\([^)]+\)/g, '').trim() // strip "(French, 1840–1926)"
  const variants: string[] = [clean]

  // "Last, First" → "First Last"
  if (clean.includes(',')) {
    const [last, first] = clean.split(',').map((s) => s.trim())
    if (first) variants.push(`${first} ${last}`)
    variants.push(last) // just last name
  } else {
    // "First Last" → "Last, First" + just last name
    const parts = clean.split(' ')
    if (parts.length >= 2) {
      const last = parts[parts.length - 1]
      const first = parts.slice(0, -1).join(' ')
      variants.push(`${last}, ${first}`)
      variants.push(last)
    }
  }

  const seen = new Set<string>()
  return variants.map((v) => v.trim()).filter((v) => {
    if (!v || seen.has(v)) return false
    seen.add(v)
    return true
  })
}

// ─── Movement/period keywords ─────────────────────────────────────────────────

const MOVEMENT_KEYWORDS: Record<string, string[]> = {
  Impressionism: ['impressionism', 'impressionist', 'impressionists'],
  'Post-Impressionism': ['post-impressionism', 'post impressionism', 'post-impressionist'],
  Cubism: ['cubism', 'cubist'],
  Surrealism: ['surrealism', 'surrealist'],
  'Abstract Expressionism': ['abstract expressionism', 'abstract expressionist'],
  Romanticism: ['romanticism', 'romantic', 'romanticist'],
  Baroque: ['baroque'],
  Renaissance: ['renaissance'],
  Modernism: ['modernism', 'modern art'],
  Minimalism: ['minimalism', 'minimalist'],
  'Pop Art': ['pop art'],
  Realism: ['realism', 'realist'],
  'Art Nouveau': ['art nouveau'],
  'Art Deco': ['art deco'],
  Expressionism: ['expressionism', 'expressionist'],
}

function detectMovement(object: MuseumObject): string | null {
  const haystack = [
    object.artMovement,
    object.description,
    object.tags?.join(' '),
    object.classification,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  for (const [movement, keywords] of Object.entries(MOVEMENT_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return movement
  }
  return null
}

// ─── Build search queries from object metadata ────────────────────────────────

function buildFallbackQueries(object: MuseumObject): string[] {
  const queries: string[] = []

  // Movement
  const movement = detectMovement(object)
  if (movement) queries.push(movement)

  // Classification + culture
  if (object.classification && object.culture) {
    queries.push(`${object.classification} ${object.culture}`)
  } else if (object.classification) {
    queries.push(object.classification)
  }

  // Medium (first keyword)
  if (object.medium) {
    const mediumKeyword = object.medium.split(/[,;]/)[0].trim()
    if (mediumKeyword.length > 3) queries.push(mediumKeyword)
  }

  // Tags
  if (object.tags?.length) {
    queries.push(...object.tags.slice(0, 2))
  }

  const seenQ = new Set<string>()
  return queries.filter((q) => {
    if (!q || seenQ.has(q)) return false
    seenQ.add(q)
    return true
  })
}

// ─── Dedup by id+museumId ─────────────────────────────────────────────────────

function dedup(objects: ExternalObject[]): ExternalObject[] {
  const seen = new Set<string>()
  return objects.filter((o) => {
    const key = `${o.museumId}:${o.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── Main cross-reference function ───────────────────────────────────────────

export async function findRelatedObjects(
  object: MuseumObject,
  options: { limit?: number; museums?: string[] } = {}
): Promise<CrossReferenceResult[]> {
  const { limit = 6 } = options
  const museumFilter = options.museums

  const isUnknownArtist =
    !object.artist || normalizeArtistName(object.artist).includes('unknown')

  // ── Step 1: Artist search (highest priority) ──────────────────────────────
  let artistResults: { museumId: string; museum: string; objects: ExternalObject[] }[] = []

  if (!isUnknownArtist) {
    const variants = artistQueryVariants(object.artist)
    // Use the best variant (original cleaned form) for primary search
    const primaryQuery = variants[0]

    const [museumArtistResults, wikiArtistResults] = await Promise.allSettled([
      searchAllMuseumsByArtist(primaryQuery, { limit, museums: museumFilter }),
      wikidataSearchByArtist(primaryQuery, limit),
    ])

    if (museumArtistResults.status === 'fulfilled') {
      artistResults = museumArtistResults.value
    }

    // Merge Wikidata results as a separate "museum"
    if (wikiArtistResults.status === 'fulfilled' && wikiArtistResults.value.length > 0) {
      artistResults.push({
        museumId: 'wikidata',
        museum: 'Wikidata',
        objects: wikiArtistResults.value.slice(0, limit),
      })
    }
  }

  // ── Step 2: Fallback queries (movement, medium, culture, tags) ────────────
  const fallbackQueries = buildFallbackQueries(object)
  const fallbackResults: { museumId: string; museum: string; objects: ExternalObject[] }[] = []

  if (fallbackQueries.length > 0) {
    // Run fallback queries in parallel (take first 2 to stay within rate limits)
    const fbSearches = await Promise.allSettled(
      fallbackQueries.slice(0, 2).map((q) =>
        searchAllMuseums(q, { limit, museums: museumFilter })
      )
    )

    for (const result of fbSearches) {
      if (result.status !== 'fulfilled') continue
      for (const group of result.value) {
        const existing = fallbackResults.find((r) => r.museumId === group.museumId)
        if (existing) {
          existing.objects.push(...group.objects)
        } else {
          fallbackResults.push({ ...group })
        }
      }
    }
  }

  // ── Merge: artist results take precedence, fallback fills gaps ────────────
  const merged = new Map<string, { museum: string; museumId: string; objects: ExternalObject[] }>()

  for (const group of artistResults) {
    const deduped = dedup(group.objects)
    if (deduped.length > 0) {
      merged.set(group.museumId, { ...group, objects: deduped.slice(0, limit) })
    }
  }

  for (const group of fallbackResults) {
    const existing = merged.get(group.museumId)
    if (existing) {
      // Merge and dedup, capped at limit
      existing.objects = dedup([...existing.objects, ...group.objects]).slice(0, limit)
    } else {
      const deduped = dedup(group.objects)
      if (deduped.length > 0) {
        merged.set(group.museumId, { ...group, objects: deduped.slice(0, limit) })
      }
    }
  }

  // Sort: museums with more results first; wikidata last
  return Array.from(merged.values())
    .filter((g) => g.objects.length > 0)
    .sort((a, b) => {
      if (a.museumId === 'wikidata') return 1
      if (b.museumId === 'wikidata') return -1
      return b.objects.length - a.objects.length
    })
}
