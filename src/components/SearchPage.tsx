'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SearchResult, MuseumObject, MetObject } from '@/types'

const palette = ['#F30000', '#FF8717', '#F0CA00', '#7AEA0A', '#00C1AA', '#5034FF', '#FF68F0', '#CC834D', '#4E576D']
function randColor() {
  return palette[Math.floor(Math.random() * palette.length)]
}

function RisdEntry({ obj }: { obj: MuseumObject }) {
  return (
    <li style={{ marginBottom: '2.5em', listStyle: 'none' }}>
      <Link
        href={`/objects/${obj.id}`}
        style={{
          textDecoration: 'none',
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          textTransform: 'uppercase',
          fontWeight: 600,
          fontSize: 'clamp(18px, 3vw, 40px)',
          color: 'black',
          display: 'inline-block',
          letterSpacing: '-0.02em',
          lineHeight: 0.8,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
      >
        <span style={{ display: 'block', color: randColor() }}>{obj.artist}</span>
        <span style={{ display: 'block' }}>&ldquo;{obj.title}&rdquo;</span>
        <span style={{ display: 'block' }}>{obj.date}</span>
      </Link>
    </li>
  )
}

function MetEntry({ obj }: { obj: MetObject }) {
  return (
    <li style={{ marginBottom: '2em', listStyle: 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      {obj.primaryImageSmall && (
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, background: '#f0f0f0' }}>
          <Image
            src={obj.primaryImageSmall}
            alt={obj.title}
            fill
            style={{ objectFit: 'contain' }}
            unoptimized
            sizes="80px"
          />
        </div>
      )}
      <a
        href={obj.objectURL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          textTransform: 'uppercase',
          fontWeight: 600,
          fontSize: 'clamp(14px, 2vw, 28px)',
          color: 'black',
          display: 'inline-block',
          letterSpacing: '-0.02em',
          lineHeight: 0.9,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
      >
        {obj.artistDisplayName && (
          <span style={{ display: 'block', color: '#989898' }}>{obj.artistDisplayName}</span>
        )}
        <span style={{ display: 'block' }}>&ldquo;{obj.title}&rdquo;</span>
        {obj.objectDate && <span style={{ display: 'block', fontSize: '0.85em' }}>{obj.objectDate}</span>}
        <span style={{ display: 'block', fontSize: '0.7em', color: '#989898', fontWeight: 400, letterSpacing: '0.05em' }}>
          The Metropolitan Museum of Art
        </span>
      </a>
    </li>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.results)
    } catch {
      setResults({ risd: [], met: [], query: q })
    } finally {
      setLoading(false)
    }
  }

  const hasResults = results && (results.risd.length > 0 || results.met.length > 0)

  return (
    <main style={{
      background: '#fafafa',
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '80px 30px 80px',
      fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
      color: 'black',
    }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '60px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, titles, mediums..."
          style={{
            width: '100%',
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontSize: 'clamp(20px, 3vw, 48px)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            border: 'none',
            borderBottom: '2px solid black',
            background: 'transparent',
            color: 'black',
            padding: '12px 0',
            outline: 'none',
          }}
          autoFocus
        />
      </form>

      {loading && (
        <p style={{
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#989898',
        }}>
          Searching...
        </p>
      )}

      {!loading && searched && !hasResults && (
        <p style={{
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#989898',
        }}>
          No results found
        </p>
      )}

      {!loading && results && results.risd.length > 0 && (
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#989898',
            fontWeight: 500,
            marginBottom: '32px',
          }}>
            RISD Collection — {results.risd.length} result{results.risd.length !== 1 ? 's' : ''}
          </h2>
          <ul style={{ padding: 0, margin: 0 }}>
            {results.risd.map((obj) => (
              <RisdEntry key={obj.id} obj={obj} />
            ))}
          </ul>
        </section>
      )}

      {!loading && results && results.met.length > 0 && (
        <section>
          <hr style={{ width: '100%', height: '1px', background: '#e0e0e0', border: 'none', marginBottom: '32px' }} />
          <h2 style={{
            fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#989898',
            fontWeight: 500,
            marginBottom: '32px',
          }}>
            Other Museums — {results.met.length} result{results.met.length !== 1 ? 's' : ''}
          </h2>
          <ul style={{ padding: 0, margin: 0 }}>
            {results.met.map((obj) => (
              <MetEntry key={obj.objectID} obj={obj} />
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
