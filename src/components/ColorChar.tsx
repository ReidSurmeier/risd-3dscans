'use client'

import { useEffect, useRef } from 'react'

const palette = ['#F30000', '#FF8717', '#F0CA00', '#7AEA0A', '#00C1AA', '#5034FF', '#FF68F0', '#CC834D', '#4E576D']
const ghostChars = ['#', '*', '–', '_', '!', '[', '?', '\u201C']

function randColor() {
  return palette[Math.floor(Math.random() * palette.length)]
}

function randGhost() {
  return ghostChars[Math.floor(Math.random() * ghostChars.length)]
}

function ColorSpan({ char }: { char: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || char === ' ') return

    // Initial state
    el.style.color = randColor()
    el.setAttribute('data-char1', randGhost())
    el.setAttribute('data-char2', randGhost())
    el.style.setProperty('--random-color-1', randColor())
    el.style.setProperty('--random-color-2', randColor())

    // Slow loop: toggle ghost visibility + recolor character
    const slow = setInterval(() => {
      if (Math.random() > 0.5) {
        el.classList.toggle('show1')
      }
      if (Math.random() > 0.75) {
        el.classList.toggle('show2')
      }
      if (Math.random() > 0.5) {
        el.style.color = randColor()
      }
    }, 2000)

    // Fast loop: swap ghost symbols + ghost colors
    const fast = setInterval(() => {
      if (Math.random() > 0.5) {
        el.setAttribute('data-char1', randGhost())
      }
      if (Math.random() > 0.5) {
        el.setAttribute('data-char2', randGhost())
      }
      if (Math.random() > 0.5) {
        el.style.setProperty('--random-color-1', randColor())
      }
      if (Math.random() > 0.5) {
        el.style.setProperty('--random-color-2', randColor())
      }
    }, 250)

    return () => {
      clearInterval(slow)
      clearInterval(fast)
    }
  }, [char])

  if (char === ' ') {
    return <span style={{ display: 'inline' }}>&nbsp;</span>
  }

  return (
    <span ref={ref} className="color-char">
      {char}
    </span>
  )
}

interface ColorCharProps {
  text: string
  className?: string
}

export default function ColorChar({ text, className }: ColorCharProps) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <ColorSpan key={i} char={char} />
      ))}
    </span>
  )
}
