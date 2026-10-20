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
        botanical: {
          bg: '#faf9f5',          // Luminous warm alabaster white
          surface: '#ffffff',     // Pure crisp white card surface
          card: '#ffffff',        // Crisp white cards
          cardMuted: '#f5f4ee',   // Soft warm linen card
          subtle: '#f0ede4',      // Delicate warm tone
          border: '#e6e2d8',      // Elegant delicate border
          borderSubtle: '#eeebe3',
          text: '#1a2217',        // Deep forest charcoal text
          textMuted: '#586352',   // Refined muted olive text
          textSubtle: '#808c79',  // Light herbal stone text
          sage: '#637852',        // Herbal sage green
          sageLight: '#eef2ea',   // Pale sage pill background
          sageBorder: '#cbd7c1',  // Pale sage border
          moss: '#2d3b25',        // Deep botanical moss
          mossDark: '#1c2417',    // Forest obsidian
          terracotta: '#b85c3c',  // Botanical terracotta highlight
          terracottaLight: '#fbf0eb', // Pale terracotta pill background
        },
        brand: {
          50: '#f7f9f5',
          100: '#edf2e9',
          200: '#dae4d2',
          300: '#bdd1b1',
          400: '#94b383',
          500: '#637852',
          600: '#526642',
          700: '#425335',
          800: '#2d3b25',
          900: '#1c2417',
          950: '#12190f',
        },
        slate: {
          850: '#1a2118',
          900: '#141a12',
          950: '#0e120d',
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
