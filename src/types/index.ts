// Core museum object type — all fields from RISD Museum scrape
export interface MuseumObject {
  id: string                    // slug derived from accession number
  accessionNumber: string
  title: string
  artist: string                // named artist, "Unknown Maker" if unknown
  artistFull?: string           // artist name with nationality and dates
  culture?: string              // e.g. "French", "American"
  date: string                  // display string e.g. "1874" or "ca. 1885"
  medium: string
  dimensions: string
  description: string           // curatorial text, "" if unavailable
  imageUrl: string              // primary high-res image from RISD (zoom quality)
  thumbnailUrl?: string         // smaller preview version
  onViewLocation: string        // gallery/room name
  provenance?: string           // acquisition history
  credit?: string               // gift/purchase credit line
  exhibitionHistory?: string[]  // empty array if unavailable
  bibliography?: string[]       // empty array if unavailable
  risdUrl: string               // canonical URL on risdmuseum.org
  has3dModel: boolean           // false for now, true when model added
  modelPath?: string            // path to .glb file when available
  tags?: string[]               // for Met cross-reference search
  // Rich classification metadata for cross-referencing
  classification?: string       // e.g. "Paintings", "Sculpture", "Prints"
  artMovement?: string          // e.g. "Impressionism", "Cubism", "Post-Impressionism"
  timePeriod?: string           // e.g. "19th century", "20th century"
  geographicOrigin?: string     // e.g. "France", "Spain"
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
