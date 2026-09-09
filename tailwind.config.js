/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05060A',
          900: '#0A0B14',
          800: '#11121F',
          700: '#1A1B2E',
          600: '#252740',
        },
        accent: {
          violet: '#8B5CF6',
          pink: '#EC4899',
          cyan: '#22D3EE',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slow-spin': 'spin 20s linear infinite',
        'slow-spin-rev': 'spin 30s linear infinite reverse',
      },
    },
  },
  plugins: [],
};
