// Core museum object type — all fields from RISD Museum scrape
export interface MuseumObject {
  id: string                    // slug derived from accession number
  accessionNumber: string
  title: string
  artist: string                // "Unknown Maker" if unknown
  culture?: string              // e.g. "Chinese", "American"
  date: string                  // display string e.g. "Qing dynasty, 1644–1912"
  medium: string
  dimensions: string
  description: string           // curatorial text, "" if unavailable
  imageUrl: string              // primary image from RISD
  thumbnailUrl?: string         // smaller version if available
  onViewLocation: string        // gallery/room name
  provenance?: string           // "" if unavailable
  exhibitionHistory?: string[]  // empty array if unavailable
  bibliography?: string[]       // empty array if unavailable
  risdUrl: string               // canonical URL on risdmuseum.org
  has3dModel: boolean           // false for now, true when model added
  modelPath?: string            // path to .glb file when available
  tags?: string[]               // for Met cross-reference search
}

// Met Museum cross-reference result
export interface MetObject {
  objectID: number
  title: string
  artistDisplayName: string
  objectDate: string
  medium: string
  primaryImageSmall: string
  objectURL: string             // link to Met page
  department: string
  culture?: string
  period?: string
}

// Search result shape
export interface SearchResult {
  risd: MuseumObject[]
  met: MetObject[]
  query: string
}

// API response wrappers
export interface ApiObjectsResponse {
  objects: MuseumObject[]
  total: number
}

export interface ApiObjectDetailResponse {
  object: MuseumObject
  relatedMet: MetObject[]       // up to 6 related Met objects
}

export interface ApiSearchResponse {
  results: SearchResult
  total: number
}
