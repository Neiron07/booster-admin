export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        fox: {
          50:  '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#1a1d27',
          border:  '#252838',
          hover:   '#1e2130',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(99,102,241,0.08), 0 4px 16px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(99,102,241,0.3)',
      }
    }
  },
  plugins: []
}
