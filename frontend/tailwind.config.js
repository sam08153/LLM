/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'founder-blue': '#0a192f',
        'founder-gold': '#ffd700',
      }
    },
  },
  plugins: [],
}
