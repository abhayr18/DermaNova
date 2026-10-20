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
        serif: ['Newsreader', '"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'Fragment Mono', 'ui-monospace', 'monospace'],
        sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'stitch-resting': '0px 2px 8px -2px rgba(48, 77, 64, 0.04), 0px 8px 24px -4px rgba(48, 77, 64, 0.06)',
        'stitch-hover': '0px 4px 12px -2px rgba(48, 77, 64, 0.06), 0px 16px 36px -6px rgba(48, 77, 64, 0.08)',
        'stitch-modal': '0px 12px 32px -4px rgba(37, 41, 35, 0.08), 0px 24px 64px -12px rgba(37, 41, 35, 0.12)',
      },
      colors: {
        dn: {
          bg: '#FAF9F6',
          surface: '#FFFFFF',
          sage: '#527665',
          forest: '#304D40',
          softSage: '#E8EFE9',
          lavender: '#EEEAF5',
          blush: '#F3E5E2',
          text: '#252923',
          textSecondary: '#777D76',
          border: '#E8E8E1',
          borderSubtle: '#F0EFEA',
        },
        botanical: {
          bg: '#FAF9F6',
          surface: '#ffffff',
          card: '#ffffff',
          cardMuted: '#f5f4ee',
          subtle: '#f0ede4',
          border: '#E8E8E1',
          borderSubtle: '#eeebe3',
          text: '#252923',
          textMuted: '#777D76',
          textSubtle: '#808c79',
          sage: '#527665',
          sageLight: '#E8EFE9',
          sageBorder: '#cbd7c1',
          moss: '#304D40',
          mossDark: '#1c2417',
          terracotta: '#b85c3c',
          terracottaLight: '#F3E5E2',
        },
        brand: {
          50: '#f7f9f5',
          100: '#E8EFE9',
          200: '#dae4d2',
          300: '#bdd1b1',
          400: '#94b383',
          500: '#527665',
          600: '#436153',
          700: '#304D40',
          800: '#263d33',
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
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
};
