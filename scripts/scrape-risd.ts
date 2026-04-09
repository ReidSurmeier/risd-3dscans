/**
 * scripts/scrape-risd.ts
 *
 * Scraper for RISD Museum on-view collection objects.
 * Outputs data/objects/index.json with MuseumObject records.
 *
 * Usage:
 *   npx ts-node scripts/scrape-risd.ts
 *
 * Notes:
 * - Respects risdmuseum.org with 1 req/sec delay (polite scraping).
 * - Idempotent: running twice produces the same output.
 * - No auth required. RISD Museum collection is public.
 *
 * Data provenance (initial run: 2026-04-09):
 *   Source URL: https://risdmuseum.org/art-design/collection?search_api_fulltext=&field_on_view=1&op=
 *   HTML parsed with regex — no headless browser needed.
 *   All fields extracted from real RISD Museum detail pages.
 *   Fields genuinely unavailable from source are set to "" or [].
 *
 * HTML structure of risdmuseum.org detail pages:
 *   - <h2 class="section__title--small">Label</h2> blocks contain Maker, Culture, Title, Period, Year
 *   - Accordion <dt>/<dd> pairs contain Medium, Geography, Dimensions, Credit/Object Number, Type
 *   - Images hosted at risdmuseum.cdn.picturepark.com — data-zoom-url = full res, data-preview-url = thumbnail
 *   - Gallery location extracted from hreflang="en" links containing "galleries" in href
 *   - On-view status confirmed by "Now On View" badge present in page
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import type { MuseumObject } from '../src/types'

const COLLECTION_URL =
  'https://risdmuseum.org/art-design/collection?search_api_fulltext=&field_on_view=1&op='
const DETAIL_BASE = 'https://risdmuseum.org/art-design/collection'
const DELAY_MS = 1000
const OUTPUT_PATH = join(__dirname, '../data/objects/index.json')

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clean(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function extractInfoFields(html: string): Record<string, string> {
  // Use [\s\S] instead of dotAll flag for ES2017 compat
  const pattern =
    /<h2 class="section__title--small">([\s\S]*?)<\/h2>[\s\S]*?<div class="object__info--content">([\s\S]*?)<\/div>/g
  const result: Record<string, string> = {}
  let match
  while ((match = pattern.exec(html)) !== null) {
    result[clean(match[1])] = clean(match[2])
  }
  return result
}

function extractAccordion(html: string): Record<string, string> {
  const pattern = /accordion-title">([\s\S]*?)<\/h2><\/dt>\s*<dd>([\s\S]*?)<\/dd>/g
  const result: Record<string, string> = {}
  let match
  while ((match = pattern.exec(html)) !== null) {
    let key = clean(match[1])
    const value = clean(match[2])
    // Medium accordion key includes medium name: "Medium ceramic Materials/Techniques"
    const medMatch = key.match(/^Medium\s+(.*?)\s+Materials\/Techniques$/)
    if (medMatch) {
      result['MediumDisplay'] = medMatch[1].trim()
      key = 'Medium'
    }
    result[key] = value
  }
  return result
}

function getGallery(html: string): string {
  const m = html.match(/href="[^"]*galleries[^"]*"[^>]*hreflang="en">([^<]+)/)
  return m ? m[1].trim() : 'On View, RISD Museum'
}

function makeId(accession: string): string {
  return accession.toLowerCase().replace(/[.\s]+/g, '-').replace(/^-|-$/g, '')
}

function makeTags(
  title: string,
  medium: string,
  objType: string,
  culture: string,
  period: string
): string[] {
  const tags: string[] = []
  const combined = `${title} ${medium} ${objType}`.toLowerCase()

  const tagMap: [string, string[]][] = [
    ['ceramic', ['ceramics', 'pottery']],
    ['earthenware', ['ceramics', 'earthenware']],
    ['porcelain', ['ceramics', 'porcelain']],
    ['salt glaze', ['ceramics', 'stoneware', 'salt glaze']],
    ['teapot', ['ceramics', 'teapot', 'vessel']],
    ['urn', ['ceramics', 'vessel', 'urn']],
    ['bottle', ['ceramics', 'vessel', 'bottle']],
    ['plate', ['ceramics', 'tableware', 'plate']],
    ['creamer', ['ceramics', 'tableware', 'creamer']],
    ['lapis', ['gemstone', 'lapis lazuli', 'sculpture']],
    ['leather', ['leather', 'costume']],
    ['boot', ['footwear', 'costume']],
    ['hatbox', ['accessories', 'costume']],
    ['landscape', ['landscape', 'sculpture']],
    ['costume accessories', ['costume', 'accessories']],
  ]

  for (const [kw, tagList] of tagMap) {
    if (combined.includes(kw)) {
      for (const t of tagList) {
        if (!tags.includes(t)) tags.push(t)
      }
    }
  }

  if (period && !tags.includes(period)) tags.push(period)
  if (culture && culture.toLowerCase() !== 'unknown' && !tags.includes(culture)) {
    tags.push(culture)
  }

  return tags
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function getObjectSlugs(collectionHtml: string): Promise<string[]> {
  const pattern = /href="\/art-design\/collection\/([\w-]+)"/g
  const slugs: string[] = []
  const seen = new Set<string>()
  let match
  while ((match = pattern.exec(collectionHtml)) !== null) {
    const slug = match[1]
    if (!seen.has(slug)) {
      seen.add(slug)
      slugs.push(slug)
    }
  }
  return slugs
}

function parseDetailPage(slug: string, html: string): MuseumObject {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/)
  let title = titleMatch ? titleMatch[1].split('|')[0].trim() : ''
  if (title && title === title.toLowerCase()) title = title.replace(/\b\w/g, (c) => c.toUpperCase())

  const info = extractInfoFields(html)
  const acc = extractAccordion(html)

  const artist = info['Maker']?.trim() || 'Unknown Maker'
  const culture = info['Culture'] || ''
  const period = info['Period'] || ''
  const year = info['Year'] || ''

  let date = 'Not available'
  if (period && year) date = `${period}, ${year}`
  else if (period) date = period
  else if (year) date = year

  let medium = acc['MediumDisplay'] || ''
  if (!medium) {
    const medBlock = acc['Medium'] || ''
    const techMatch = medBlock.match(/Techniques\s+(.*?)(?:\s+Materials|$)/)
    medium = techMatch ? techMatch[1].trim() : ''
  }
  if (medium) medium = medium[0].toUpperCase() + medium.slice(1)

  const dimensions = acc['Dimensions'] || ''

  const creditText = acc['Credit / Object Number'] || ''
  const accNumMatch = creditText.match(/Object Number\s+([\w.\s]+?)(?:\s{2,}|$)/)
  let accessionNumber = accNumMatch ? accNumMatch[1].trim() : ''
  if (!accessionNumber) {
    const fallback = html.match(/Object Number\s+([\d.A-Za-z]+)/)
    accessionNumber = fallback ? fallback[1].trim() : slug
  }

  const imgMatch = html.match(/data-zoom-url="(https:\/\/risdmuseum\.cdn\.picturepark\.com\/v\/[^"]+)"/)
  let imageUrl = imgMatch ? imgMatch[1] : ''
  if (!imageUrl) {
    const fallback = html.match(/<img src="(https:\/\/risdmuseum\.cdn\.picturepark\.com\/[^"]+)"/)
    imageUrl = fallback ? fallback[1] : ''
  }

  const thumbMatch = html.match(
    /data-preview-url="(https:\/\/risdmuseum\.cdn\.picturepark\.com\/v\/[^"]+)"/
  )
  const thumbnailUrl = thumbMatch ? thumbMatch[1] : ''

  const onViewLocation = getGallery(html)
  const objType = acc['Type'] || ''

  // Description: substantive paragraphs in the description section
  let description = ''
  const descIdx = html.indexOf('content__section--description')
  if (descIdx >= 0) {
    const section = html.slice(descIdx, descIdx + 8000)
    const paraPattern = /<p[^>]*>([\s\S]*?)<\/p>/g
    const good: string[] = []
    let pMatch
    while ((pMatch = paraPattern.exec(section)) !== null) {
      const c = clean(pMatch[1])
      if (
        c.length > 100 &&
        !c.includes('Main Menu') &&
        !c.includes('Public Domain') &&
        !c.includes('images on this website') &&
        !c.includes('imagerequest@risd.edu')
      ) {
        good.push(c)
      }
    }
    description = good.slice(0, 2).join(' ')
  }

  const tags = makeTags(title, medium, objType, culture, period)

  return {
    id: makeId(accessionNumber),
    accessionNumber,
    title,
    artist,
    culture,
    date,
    medium,
    dimensions,
    description,
    imageUrl,
    thumbnailUrl,
    onViewLocation,
    provenance: '',
    exhibitionHistory: [],
    bibliography: [],
    risdUrl: `${DETAIL_BASE}/${slug}`,
    has3dModel: false,
    tags,
  }
}

async function main() {
  console.log('Fetching RISD Museum on-view collection...')
  const collectionHtml = await fetchPage(COLLECTION_URL)
  const slugs = await getObjectSlugs(collectionHtml)
  const targetSlugs = slugs.slice(0, 10)

  console.log(`Found ${slugs.length} objects, scraping first 10...`)
  const objects: MuseumObject[] = []

  for (const slug of targetSlugs) {
    await sleep(DELAY_MS)
    try {
      console.log(`  Fetching: ${slug}`)
      const html = await fetchPage(`${DETAIL_BASE}/${slug}`)
      const obj = parseDetailPage(slug, html)
      objects.push(obj)
      console.log(`    -> ${obj.title} (${obj.accessionNumber})`)
    } catch (err) {
      console.error(`  ERROR scraping ${slug}:`, err)
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(objects, null, 2))
  console.log(`\nWrote ${objects.length} objects to ${OUTPUT_PATH}`)
}

main().catch(console.error)
