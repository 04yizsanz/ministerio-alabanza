/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta del ministerio — tonos rosados/rojos suaves para las plantillas
        ministry: {
          50:  '#fff0f3',
          100: '#ffe0e7',
          200: '#ffc2cf',
          300: '#ff91a8',
          400: '#ff5478',
          500: '#ff1f4f',
          600: '#e8003a',
          700: '#c40030',
          800: '#a1002c',
          900: '#87032a',
        },
      },
    },
  },
  plugins: [],
}
