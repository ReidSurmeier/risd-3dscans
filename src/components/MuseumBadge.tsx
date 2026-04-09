'use client'

import { useEffect, useRef } from 'react'

const palette = ['#F30000', '#FF8717', '#F0CA00', '#7AEA0A', '#00C1AA', '#5034FF', '#FF68F0', '#CC834D', '#4E576D']

function randColor() {
  return palette[Math.floor(Math.random() * palette.length)]
}

interface MuseumBadgeProps {
  name: string
}

export default function MuseumBadge({ name }: MuseumBadgeProps) {
  const dotRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.backgroundColor = randColor()
    }
  }, [])

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-gothic), "Gothic A1", monospace',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#111',
    }}>
      <span
        ref={dotRef}
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: '#989898',
        }}
      />
      {name}
    </span>
  )
}
