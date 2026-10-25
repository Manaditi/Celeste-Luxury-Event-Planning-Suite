/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF8F5',
          subtle: '#F4EFEA',
          card: '#FFFFFF',
          hover: '#F0E9E0',
        },
        charcoal: {
          900: '#1C1917',
          800: '#292524',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          400: '#A8A29E',
          300: '#D6D3D1',
          200: '#E7E5E4',
          100: '#F5F5F4',
        },
        bronze: {
          50: '#FAF6F0',
          100: '#F5EBDC',
          200: '#EBD5B6',
          300: '#DEBA89',
          400: '#CF9E5E',
          500: '#B4863A',
          600: '#946A29',
          700: '#73501D',
          800: '#523814',
          900: '#33220B',
        },
        champagne: {
          50: '#FDFCF9',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#ECE2D7',
          400: '#DFCFC0',
          500: '#CEB8A3',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'luxury': '0 4px 20px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
        'luxury-lg': '0 10px 30px -4px rgba(28, 25, 23, 0.08), 0 4px 10px -2px rgba(28, 25, 23, 0.04)',
        'gold-glow': '0 0 15px rgba(180, 134, 58, 0.25)',
      }
    },
  },
  plugins: [],
}
