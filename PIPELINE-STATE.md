# PIPELINE-STATE.md — risd-3dscans-v1

Updated: 2026-04-09
Stage: 2 — Awaiting specialist dispatch

---

## Specialists

| Specialist | Branch | Status | Files Owned |
|---|---|---|---|
| data-engineer | `pipeline/risd-3dscans-v1/data` | PENDING | `data/objects/**`, `src/lib/data.ts`, `src/lib/met-api.ts`, `scripts/scrape-risd.ts` |
| backend-developer | `pipeline/risd-3dscans-v1/backend` | PENDING | `src/app/api/**` |
| frontend-developer | `pipeline/risd-3dscans-v1/frontend` | PENDING | `src/app/page.tsx`, `src/app/objects/[id]/page.tsx`, `src/components/**` |
| ui-designer | `pipeline/risd-3dscans-v1/ui` | PENDING | `src/app/globals.css`, `tailwind.config.ts` |

---

## Sequencing

### Round 1 (parallel — disjoint files):
- data-engineer: scrape RISD data, implement Met API client, populate JSON
- ui-designer: typography setup (Google Fonts via next/font), global CSS, Tailwind config

### Round 2 (parallel — disjoint files, depends on Round 1):
- backend-developer: implement API routes (needs real data from data-engineer)
- frontend-developer: implement all pages + components (needs data shape from data-engineer, styles from ui-designer)

### Round 3 (sequential):
- Senior Review: merge all branches, type-check, lint, build, fix issues

---

## Dependency Graph

```
data-engineer ─────────────────────────────┐
                                            ├──► backend-developer
ui-designer ────────────────────────────── ┤
                                            └──► frontend-developer
```

data-engineer must complete before backend-developer and frontend-developer start.

---

## Completion Checklist

- [ ] data-engineer done (10 real objects in JSON, met-api.ts working)
- [ ] ui-designer done (fonts loaded, global styles, Tailwind extended)
- [ ] backend-developer done (3 API routes functional)
- [ ] frontend-developer done (home + detail pages with real data)
- [ ] Senior Review passed (build clean, lint clean, type-check clean)
- [ ] systemd service written (`~/.config/systemd/user/3dscans.service`)
- [ ] Deploy: build + copy static + restart service
- [ ] Cloudflare purge
- [ ] QA: live site verified at https://3dscans.reidsurmeier.wtf

---

## Context for Specialists

- Project: `/home/reidsurmeier/Projects/risd-3dscans/`
- Stack: Next.js 14, TypeScript, Tailwind CSS, App Router
- Build: `npm run build` (standalone output)
- Start: `node .next/standalone/server.js`
- Port: 8090
- Types: `src/types/index.ts` — all specialists read this, none modify it
- Contracts: `CONTRACTS.md` — read before writing any code

## Specialist Agent Prompts

### data-engineer
```
You are a data engineer.
Read CONTRACTS.md first — follow interface specs exactly.
Project root: /home/reidsurmeier/Projects/risd-3dscans/
You own: data/objects/**, src/lib/data.ts, src/lib/met-api.ts, scripts/scrape-risd.ts
Branch: pipeline/risd-3dscans-v1/data

TASK:
1. Scrape the first 10 on-view objects from https://risdmuseum.org/art-design/collection?search_api_fulltext&field_on_view=1&op=
   Use fetch or curl to retrieve pages. Parse the HTML to extract object data.
   For each object also visit its detail page on risdmuseum.org to get full metadata.
   
2. Populate data/objects/index.json with 10 MuseumObject records.
   The MuseumObject shape is in src/types/index.ts — use it exactly.
   NO fabricated data. If a field is unavailable, use "" for strings or [] for arrays.
   Set has3dModel: false for all objects.
   Set tags based on medium/period (e.g. teapot → ["ceramics", "pottery", "vessel"])

3. Implement src/lib/data.ts:
   getAllObjects(): MuseumObject[] — load from data/objects/index.json
   getObjectById(id: string): MuseumObject | undefined

4. Implement src/lib/met-api.ts (replace stub):
   searchMetByArtist(artist, limit=6): Promise<MetObject[]>
   searchMetByQuery(query, limit=6): Promise<MetObject[]>
   Both fetch from https://collectionapi.metmuseum.org/public/collection/v1/
   No auth needed. hasImages=true filter. Return MetObject shape from types/index.ts.
   
5. Write scripts/scrape-risd.ts as documentation of how data was scraped.

6. Run: npm run type-check && npm run build (must pass)
7. Commit to pipeline/risd-3dscans-v1/data
8. Write completion status to PIPELINE-STATE.md (update data-engineer row to DONE)
```

### ui-designer
```
You are a UI/visual designer and CSS engineer.
Read CONTRACTS.md first.
Project root: /home/reidsurmeier/Projects/risd-3dscans/
You own: src/app/globals.css, tailwind.config.ts, and CSS within src/components/
Branch: pipeline/risd-3dscans-v1/ui

TASK:
1. Update src/app/layout.tsx to load Google Fonts via next/font/google:
   - Playfair Display (400, 700, 900 — for titles/headings)
   - Inter (400, 500 — for body/UI)
   - JetBrains Mono (400 — for metadata/accession numbers)
   Apply as CSS variables: --font-playfair, --font-inter, --font-mono

2. Update tailwind.config.ts with full museum design system:
   - Colors: museum-black (#0a0a0a), museum-white (#f5f4f0), museum-cream (#ede9e1),
     museum-gray (#6b6b63), museum-accent (#c8a96e), museum-muted (#3a3a36)
   - Fonts: already stubbed, verify they match layout.tsx variables
   - Animations: fadeUp (staggered), marquee (horizontal scroll)
   - Custom spacing/typography scale for museum feel

3. Write src/app/globals.css:
   - Base reset + typography defaults
   - Selection color (museum-accent)
   - Scrollbar styling (dark)
   - Smooth scroll
   - Link styles (no underline by default, accent on hover)
   - .object-card hover (subtle opacity/scale, ease-in-out)
   
4. Write component CSS classes in globals.css (Tailwind @apply patterns):
   .hero-word — a single word in the hero stack animation
   .object-grid — grid container styles
   .meta-label — small uppercase tracking-widest label style
   .section-divider — thin horizontal rule with margin
   
5. Reference: counterarchiving.xyz has deconstructed stacked title, minimal black/white.
   MoMA detail page: structured two-column editorial layout.
   Design goal: museum-quality dark theme, Playfair Display for gravitas.

6. npm run type-check && npm run build must pass.
7. Commit to pipeline/risd-3dscans-v1/ui
8. Update PIPELINE-STATE.md ui-designer row to DONE
```

### backend-developer
```
You are a backend engineer.
Read CONTRACTS.md first — implement the API routes exactly as specified.
Project root: /home/reidsurmeier/Projects/risd-3dscans/
You own: src/app/api/**
Branch: pipeline/risd-3dscans-v1/backend

DEPENDS ON: data-engineer completing first (data/objects/index.json must have real data)

TASK:
1. Implement src/app/api/objects/route.ts (GET):
   - Load objects from src/lib/data.ts getAllObjects()
   - Support optional query params: medium, artist (filter)
   - Return: { objects: MuseumObject[], total: number }

2. Implement src/app/api/objects/[id]/route.ts (GET):
   - Load object by id using getObjectById()
   - If not found: return NextResponse.json({ error: "Not found" }, { status: 404 })
   - Fetch relatedMet: call searchMetByArtist(object.artist) from src/lib/met-api.ts
   - Return: { object: MuseumObject, relatedMet: MetObject[] }

3. Implement src/app/api/search/route.ts (GET):
   - Param: q (string, required)
   - RISD search: filter getAllObjects() where title/artist/medium/tags contain q (case-insensitive)
   - Met search: call searchMetByQuery(q) from src/lib/met-api.ts
   - Return: { results: { risd: MuseumObject[], met: MetObject[], query: string }, total: number }

4. All routes: wrap in try/catch, return 500 with { error: string } on failure
5. No external database. Data source is JSON files only.
6. npm run type-check && npm run build must pass.
7. Commit to pipeline/risd-3dscans-v1/backend
8. Update PIPELINE-STATE.md backend-developer row to DONE
```

### frontend-developer
```
You are a frontend engineer.
Read CONTRACTS.md first — implement components exactly as specified.
Project root: /home/reidsurmeier/Projects/risd-3dscans/
You own: src/app/page.tsx, src/app/objects/[id]/page.tsx, src/components/**
Branch: pipeline/risd-3dscans-v1/frontend

DEPENDS ON: data-engineer (data shape) and ui-designer (CSS classes) completing first

TASK:
1. Implement src/components/NavBar.tsx:
   - Thin top bar, "RISD Museum 3D Scans" left, site nav right
   - Fixed, transparent background, z-50

2. Implement src/components/HeroText.tsx:
   - Large stacked title: each word of "RISD Museum 3D Scans Collection" on its own line
   - Words animate in sequentially (use Tailwind animation-delay via inline style)
   - Use Playfair Display (font-serif class), very large text (text-7xl to text-9xl)
   - Below: thin rule + "Providence, Rhode Island — RISD Museum"
   - Reference visual: counterarchiving.xyz deconstructed stacked title

3. Implement src/components/ObjectCard.tsx:
   - next/image with objectContain (museum objects need full visibility)
   - Title (font-serif), artist + date (font-mono text-museum-gray)
   - Entire card is a link to /objects/[id]

4. Implement src/components/ObjectGrid.tsx:
   - Props: { objects: MuseumObject[] }
   - grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8
   - If empty: show "Collection loading..." in muted text
   - Maps objects to ObjectCard

5. Implement src/components/ModelViewer.tsx:
   - Dynamic import (next/dynamic, ssr: false) to avoid Three.js SSR issues
   - Shows placeholder: dark bordered box, centered "3D Model Coming Soon"
   - Accepts modelPath and objectTitle props
   - Leave TODO comments for Three.js scene implementation

6. Implement src/components/RelatedObjects.tsx:
   - Props: { objects: MetObject[], sourceMuseum: 'met' }
   - Horizontal scroll row
   - Each: thumbnail + title + "Met Museum" label + link opens new tab
   - If empty: return null

7. Implement src/components/ObjectDetail.tsx:
   - Two-column layout (image left, metadata right) above the fold
   - Below: description, provenance, exhibition history, bibliography (each section)
   - Show "Not available" for empty string fields, skip empty array sections
   - RelatedObjects section
   - ModelViewer stub at bottom

8. Implement src/app/page.tsx:
   - Fetch from /api/objects (or import getAllObjects() directly for SSR)
   - NavBar + HeroText + ObjectGrid
   - Full-page dark background

9. Implement src/app/objects/[id]/page.tsx:
   - Fetch object + relatedMet from /api/objects/[id]
   - If 404: notFound()
   - NavBar + ObjectDetail

10. src/app/search/page.tsx — create stub page only (no full implementation)

11. npm run type-check && npm run build must pass.
12. Commit to pipeline/risd-3dscans-v1/frontend
13. Update PIPELINE-STATE.md frontend-developer row to DONE
```
