/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Athena coral, from the logo. 500 is the brand color used across the app.
        brand: {
          50: '#FFF5F3',
          100: '#FDE8E4',
          200: '#FAD2CB',
          300: '#F4ABA0',
          400: '#ED8073',
          500: '#E65C52',
          600: '#D3463C',
          700: '#B03830',
        },
        ink: {
          DEFAULT: '#1E2230',
          muted: '#5B6070',
          faint: '#8A8F9C',
        },
        canvas: '#FCF8F7',   // app background behind cards
        line: '#F1E6E3',     // card borders and dividers
      },
      boxShadow: {
        card: '0 1px 2px rgba(60, 30, 25, 0.04), 0 6px 20px rgba(60, 30, 25, 0.05)',
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
}
