/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        slate: {
          750: '#1e2537',
          850: '#141a28',
          950: '#0a0f1e',
        }
      }
    },
  },
  plugins: [],
}
