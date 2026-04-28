/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#01342F',
          DEFAULT: '#078F65',
          light: '#0AB884',
          50: '#E6F7F1',
          100: '#C0ECDE',
          200: '#8DDCBF',
          300: '#5ACC9F',
          400: '#33BF87',
          500: '#078F65',
          600: '#067B57',
          700: '#056549',
          800: '#01342F',
          900: '#012420',
        },
      },
    },
  },
  plugins: [],
};
