'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { MuseumObject } from '@/types'

const palette = ['#F30000', '#FF8717', '#F0CA00', '#7AEA0A', '#00C1AA', '#5034FF', '#FF68F0', '#CC834D', '#4E576D']

function randColor() {
  return palette[Math.floor(Math.random() * palette.length)]
}

interface ObjectEntryProps {
  object: MuseumObject
  index: number
}

export default function ObjectEntry({ object, index }: ObjectEntryProps) {
  const artistRef = useRef<HTMLSpanElement>(null)
  const liRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (artistRef.current) {
      artistRef.current.style.color = randColor()
    }

    const el = liRef.current
    if (!el) return
    el.style.opacity = '0'
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 125ms ease-out'
      el.style.opacity = '1'
    }, index * 150)

    return () => clearTimeout(timer)
  }, [index])

  return (
    <li
      ref={liRef}
      style={{
        position: 'relative',
        marginBottom: '3em',
        listStyle: 'none',
        opacity: 0,
      }}
    >
      <Link
        href={`/objects/${object.id}`}
        style={{
          textDecoration: 'none',
          fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
          textTransform: 'uppercase',
          fontWeight: 600,
          fontSize: '4.1vw',
          color: 'black',
          display: 'inline-block',
          letterSpacing: '-0.02em',
          lineHeight: 0.8,
        }}
      >
        <span ref={artistRef} style={{ display: 'block' }}>
          {object.artist}
        </span>
        <span style={{ display: 'block', color: 'black' }}>
          &ldquo;{object.title}&rdquo;
        </span>
        <span style={{ display: 'block', color: 'black' }}>
          {object.date}
        </span>
      </Link>
    </li>
  )
}
