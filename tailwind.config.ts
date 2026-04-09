import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'IBM Plex Mono', 'monospace'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: '#fafafa',
        text: '#212122',
        gray: '#989898',
        muted: '#6F6F6F',
        'accent-red': '#F30000',
        'accent-orange': '#FF8717',
        'accent-yellow': '#F0CA00',
        'accent-green': '#7AEA0A',
        'accent-teal': '#00C1AA',
        'accent-blue': '#5034FF',
        'accent-pink': '#FF68F0',
        'accent-brown': '#CC834D',
        'accent-cool': '#4E576D',
      },
      keyframes: {
        fadeUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 300ms ease-out forwards',
        fadeIn: 'fadeIn 125ms ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
