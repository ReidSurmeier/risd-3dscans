# CONTRACTS.md — RISD Museum 3D Scans

Task slug: `risd-3dscans-v1`
Date: 2026-04-09

---

## File Ownership

| Specialist | Owns (write) | Reads (no write) |
|---|---|---|
| data-engineer | `data/objects/**`, `src/lib/data.ts`, `src/lib/met-api.ts`, `scripts/scrape-risd.ts` | `src/types/index.ts` |
| frontend-developer | `src/app/page.tsx`, `src/app/objects/[id]/page.tsx`, `src/components/**` | `src/types/index.ts`, `data/objects/index.json`, `src/lib/data.ts` |
| backend-developer | `src/app/api/**` | `src/types/index.ts`, `src/lib/data.ts`, `src/lib/met-api.ts` |
| ui-designer | `src/app/globals.css`, `tailwind.config.ts`, `src/components/**/*.css` | all src files (read-only except globals/tailwind) |

**Conflict rule**: `src/components/` is shared — ui-designer owns CSS classes/styling; frontend-developer owns component logic. When both touch a component file, they coordinate via the component contract below.

---

## Interface Contracts

### MuseumObject (canonical — `src/types/index.ts`)
```typescript
interface MuseumObject {
  id: string                   // URL slug: accession number lowercased, dots→dashes
  accessionNumber: string      // e.g. "04207"
  title: string
  artist: string               // "Unknown Maker" if unknown
  culture?: string             // e.g. "Chinese", "American"
  date: string                 // display string e.g. "Qing dynasty, 1644–1912"
  medium: string
  dimensions: string
  description: string          // curatorial text, "" if genuinely unavailable
  imageUrl: string             // full-size RISD image URL
  thumbnailUrl?: string
  onViewLocation: string       // gallery/room name
  provenance?: string
  exhibitionHistory?: string[]
  bibliography?: string[]
  risdUrl: string              // canonical URL on risdmuseum.org
  has3dModel: boolean          // false until models are added
  modelPath?: string
  tags?: string[]              // keywords for Met search e.g. ["ceramics", "Qing", "teapot"]
}
```

### MetObject (canonical — `src/types/index.ts`)
```typescript
interface MetObject {
  objectID: number
  title: string
  artistDisplayName: string
  objectDate: string
  medium: string
  primaryImageSmall: string
  objectURL: string
  department: string
  culture?: string
  period?: string
}
```

### API Routes (backend-developer owns)

#### GET /api/objects
Response: `{ objects: MuseumObject[], total: number }`
- Returns all objects from `data/objects/index.json`
- Optional query params: `?medium=ceramics`, `?artist=unknown`

#### GET /api/objects/[id]
Response: `{ object: MuseumObject, relatedMet: MetObject[] }`
- `relatedMet`: up to 6 objects from Met API matching artist/medium/period
- If object not found: 404 `{ error: "Not found" }`

#### GET /api/search?q=
Response: `{ results: { risd: MuseumObject[], met: MetObject[], query: string }, total: number }`
- Searches RISD data by title/artist/medium/tags (in-memory)
- Searches Met API for external results
- `total` = risd.length + met.length

### Component Contracts (frontend-developer implements, ui-designer styles)

#### `<HeroText />` — `src/components/HeroText.tsx`
```typescript
// Props: none
// Renders: large animated display text "RISD Museum 3D Scans Collection"
// Style: stacked words, each word animates in sequentially (fade-up or slide-in)
// Typography: very large serif (Playfair Display), left-aligned, full-width
// Reference: counterarchiving.xyz — deconstructed stacked title
// Below title: thin horizontal rule + metadata line ("Providence, Rhode Island — RISD Museum")
```

#### `<ObjectGrid />` — `src/components/ObjectGrid.tsx`
```typescript
interface ObjectGridProps {
  objects: MuseumObject[]
}
// Renders: responsive grid, 1 col mobile / 2 col desktop / 3+ col wide
// Each cell: image (aspect-ratio: 4/3), title, artist, date, medium snippet
// Click: navigate to /objects/[id]
// No fake/placeholder data — if objects array is empty, show "Collection loading"
```

#### `<ObjectCard />` — `src/components/ObjectCard.tsx`
```typescript
interface ObjectCardProps {
  object: MuseumObject
}
// Single grid cell. Image + caption block.
// Image: next/image with fill, object-contain (museum objects need full visibility)
// Caption: title (serif, medium), artist (mono, small, muted), date (mono, small, muted)
```

#### `<ObjectDetail />` — `src/components/ObjectDetail.tsx`
```typescript
interface ObjectDetailProps {
  object: MuseumObject
  relatedMet: MetObject[]
}
// Full detail layout inspired by moma.org/collection/works/95701
// Left: large image
// Right: metadata block (title, artist, date, medium, dimensions, location)
// Below: description (full width), provenance, exhibition history, bibliography
// Each section shows "Not available" if data empty — NO hallucination
// Bottom: RelatedObjects section with Met API results
// Bottom: ModelViewer stub (see below)
```

#### `<ModelViewer />` — `src/components/ModelViewer.tsx`
```typescript
interface ModelViewerProps {
  modelPath?: string   // .glb file path
  objectTitle: string
}
// STUB — Three.js viewer, not functional yet
// Show placeholder: dark box with "3D Model Coming Soon" text
// Import Three.js dynamically (next/dynamic, ssr: false) to avoid SSR issues
// Leave TODO comment for future Three.js scene setup
```

#### `<RelatedObjects />` — `src/components/RelatedObjects.tsx`
```typescript
interface RelatedObjectsProps {
  objects: MetObject[]
  sourceMuseum: 'met'
}
// Horizontal scroll row of related objects from external museums
// Each: thumbnail + title + museum label + link to external page (opens new tab)
// If empty: render nothing (no "No related objects" message)
```

#### `<NavBar />` — `src/components/NavBar.tsx`
```typescript
// Props: none
// Minimal top nav: "RISD Museum 3D Scans" left, "Search" right
// Search links to /search page (stub for now)
// Fixed top, very thin, transparent over hero
```

---

## Data Files (data-engineer owns)

### `data/objects/index.json`
Array of 10 `MuseumObject` items. Must be real data scraped from risdmuseum.org.
**No fabricated data.** If a field is genuinely unavailable from the source, use:
- strings: `""` for description/provenance, `"Not available"` for required display fields
- arrays: `[]`
- boolean: `false`

### `scripts/scrape-risd.ts`
Standalone scraper script (Node/TypeScript, run with `npx ts-node scripts/scrape-risd.ts`).
Uses fetch or node-fetch to hit risdmuseum.org collection pages.
Outputs data to `data/objects/index.json`.
Must be idempotent — running twice produces same output.

---

## Success Criteria

### data-engineer DONE when:
- [ ] `data/objects/index.json` has exactly 10 real RISD Museum objects
- [ ] Each object has: id, accessionNumber, title, artist, date, medium, imageUrl, risdUrl, onViewLocation
- [ ] `src/lib/met-api.ts` implemented (not stub): `searchMetByArtist` and `searchMetByQuery` work
- [ ] `src/lib/data.ts` implemented: `getAllObjects()` and `getObjectById()` return real data
- [ ] `scripts/scrape-risd.ts` exists and is documented

### backend-developer DONE when:
- [ ] `GET /api/objects` returns all 10 objects from JSON
- [ ] `GET /api/objects/[id]` returns object + up to 6 related Met objects
- [ ] `GET /api/search?q=teapot` returns matching RISD objects + Met API results
- [ ] All routes handle errors gracefully (no 500s for bad input)
- [ ] TypeScript compiles clean (`npm run type-check`)

### frontend-developer DONE when:
- [ ] Home page renders HeroText + ObjectGrid with real data
- [ ] `/objects/[id]` renders full ObjectDetail with all sections
- [ ] Responsive: 1 col mobile, 2 col tablet, 2+ col desktop
- [ ] No placeholder/lorem text visible
- [ ] Links between pages work
- [ ] ModelViewer stub renders without error
- [ ] `npm run build` passes

### ui-designer DONE when:
- [ ] Dark background (#0a0a0a), cream/white text (#f5f4f0)
- [ ] HeroText: very large type, stacked words, sequential fade-up animation
- [ ] ObjectGrid: clean museum grid, generous spacing, hover states
- [ ] ObjectDetail: editorial layout inspired by MoMA (structured, not busy)
- [ ] Typography: Playfair Display for headings/titles, Inter for body/UI, JetBrains Mono for metadata
- [ ] Google Fonts loaded via `next/font` in layout.tsx
- [ ] All animations use CSS (no JS animation libraries)
- [ ] `npm run build` passes, no Tailwind warnings

---

## External APIs Used

| API | Endpoint | Auth | Rate Limit | Cache |
|---|---|---|---|---|
| Met Museum | `https://collectionapi.metmuseum.org/public/collection/v1/` | None | 80 req/s | 24h via Next.js fetch |
| RISD Museum (scrape) | `https://risdmuseum.org/art-design/collection` | None | Be polite: 1 req/s | Static JSON files |

---

## Build Verification

Every specialist MUST run before marking done:
```bash
cd /home/reidsurmeier/Projects/risd-3dscans
npm run type-check    # 0 errors
npm run lint          # 0 errors
npm run build         # exits 0
```

Port: 8090
Service: `3dscans.service`
URL: https://3dscans.reidsurmeier.wtf
