/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pure-black': '#000000',
        'deep-grey': '#0b0b0b',
        'electric-cyan': '#00f3ff',
        'neon-violet': '#bc00ff',
        'acid-green': '#39ff14',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Fuente principal limpia
        mono: ['Space Mono', 'monospace'], // Fuente para elementos de estado
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.7), 0 0 10px rgba(0, 243, 255, 0.5)' },
          '50%': { boxShadow: '0 0 15px rgba(0, 243, 255, 1), 0 0 25px rgba(0, 243, 255, 0.8)' },
        },
      },
      animation: {
        glow: 'glow 1.5s infinite alternate',
      },
    },
  },
  plugins: [],
}