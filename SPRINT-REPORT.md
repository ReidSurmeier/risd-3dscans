# SPRINT-REPORT.md — risd-3dscans-v1

Date: 2026-04-09  
Reviewer: senior code-reviewer  
Branch: main  
Build: PASS

---

## Specialist Deliveries

### data-engineer (`pipeline/risd-3dscans-v1/data`)
- `data/objects/index.json` — 10 real RISD Museum objects, all on-view, scraped from risdmuseum.org
- Objects cover: Chinese lapis sculpture, hatbox, American boot, English ceramics (plates/teapots/bottles), Chinese porcelain
- All required fields present: id, accessionNumber, title, artist, date, medium, imageUrl, thumbnailUrl, onViewLocation, risdUrl, tags
- `src/lib/data.ts` — `getAllObjects()` and `getObjectById()` implemented, loads from JSON
- `src/lib/met-api.ts` — `searchMetByArtist` and `searchMetByQuery` implemented with 24h fetch cache, graceful fallback on error
- `scripts/scrape-risd.ts` — exists and is documented

### backend-developer (`pipeline/risd-3dscans-v1/backend`)
- `GET /api/objects` — returns all objects, supports `?medium=` and `?artist=` filter params
- `GET /api/objects/[id]` — returns object + up to 6 relatedMet; 404 on not-found; fallback from artist→tags on empty result
- `GET /api/search?q=` — in-memory RISD search (title/artist/medium/tags) + Met API; 400 on empty query
- All routes wrapped in try/catch, no 500s on bad input

### frontend-developer (`pipeline/risd-3dscans-v1/frontend`)
- `src/app/page.tsx` — NavBar + HeroText + ObjectGrid with real data, no placeholder text
- `src/app/objects/[id]/page.tsx` — async page, `notFound()` on missing id, `generateStaticParams` for all 10 objects
- All 6 components implemented per CONTRACTS: HeroText, ObjectGrid, ObjectCard, ObjectDetail, ModelViewer (stub), RelatedObjects, NavBar
- Links between pages work; ModelViewer renders without error; no lorem text

### ui-designer (`pipeline/risd-3dscans-v1/ui`)
- `src/app/globals.css` — dark bg (#0a0a0a), cream text (#f5f4f0), CSS-only animations
- `tailwind.config.ts` — museum color tokens, font variables, fadeUp/marquee keyframes
- `src/app/layout.tsx` — Playfair Display, Inter, JetBrains Mono loaded via `next/font/google`
- HeroText: stacked words, sequential fade-up via nth-child delay (0–600ms)
- ObjectGrid: 1/2/3 col responsive, hover states, generous spacing
- No JS animation libraries

---

## Issues Found and Fixed

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | HIGH | `next.config.js` | Missing `risdmuseum.cdn.picturepark.com` in `remotePatterns` — all 10 objects use this CDN for `imageUrl`/`thumbnailUrl`. Would break if `unoptimized` prop removed from `<Image>`. | Added to `remotePatterns` |
| 2 | LOW | `src/components/NavBar.tsx` | Link label said "Collection" but CONTRACTS specifies "Search" right side | Changed label to "Search" |

---

## Build Verification

```
npm run type-check   ✓  0 errors
npm run lint         ✓  0 warnings/errors
npm run build        ✓  17 static pages generated
```

Routes:
- `/ ` — static
- `/objects/[id]` — SSG, 10 paths pre-generated
- `/search` — static stub
- `/api/objects`, `/api/objects/[id]`, `/api/search` — dynamic server routes

---

## Checklist Against CONTRACTS.md

- [x] 10 real RISD objects with all required fields
- [x] `met-api.ts` implemented (not stub)
- [x] `data.ts` getAllObjects/getObjectById
- [x] `scripts/scrape-risd.ts` exists
- [x] All 3 API routes correct response shapes
- [x] Graceful error handling on all routes
- [x] TypeScript compiles clean
- [x] Home page: HeroText + ObjectGrid with real data
- [x] `/objects/[id]` full ObjectDetail all sections
- [x] Responsive grid
- [x] No placeholder/lorem text
- [x] ModelViewer stub renders
- [x] Dark bg, cream text per design spec
- [x] Sequential hero animation (CSS only)
- [x] Google Fonts via next/font
- [x] Standalone output in next.config.js
- [x] `risdmuseum.cdn.picturepark.com` in image domains (fixed by reviewer)

---

## Ready for Deploy

**YES.**

Service: `3dscans.service`  
Port: 8090  
URL: https://3dscans.reidsurmeier.wtf  

Deploy steps:
```bash
cd /home/reidsurmeier/Projects/risd-3dscans
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
systemctl --user restart 3dscans.service
```
