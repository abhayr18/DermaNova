/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'Fragment Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'Satoshi', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        navara: {
          bg: '#1c1f1a',          // Deep botanical obsidian / charcoal olive
          dark: '#141712',        // Deepest forest black
          panel: '#232e1b',       // Botanical evergreen olive
          olive: '#2a3b19',       // Deep moss olive
          card: '#242a20',        // Warm dark olive card
          cardInner: '#1c2219',   // Inner card tone
          ivory: '#f4f1ea',       // Luminous alabaster / warm parchment
          cream: '#e8e4db',       // Soft linen cream
          stone: '#c9c4b5',       // Muted clay beige
          sage: '#aaab87',        // Soft herbal sage
          matcha: '#d4e0bc',      // Pale matcha accent
          border: 'rgba(244, 241, 234, 0.12)',
          borderSubtle: 'rgba(244, 241, 234, 0.06)',
          terracotta: '#b85c3c',  // Botanical terracotta active highlight
          terracottaSoft: 'rgba(184, 92, 60, 0.15)',
        },
        brand: {
          50: '#f7f6f2',
          100: '#eeebe1',
          200: '#ded7c5',
          300: '#c7bca1',
          400: '#aaab87',
          500: '#8f9a72',
          600: '#6d7853',
          700: '#525c3e',
          800: '#3a4a2f',
          900: '#232e1b',
          950: '#1c1f1a',
        },
        slate: {
          850: '#181c16',
          900: '#1c1f1a',
          950: '#141712',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
