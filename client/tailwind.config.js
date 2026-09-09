/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        saffron: {
          500: '#ff9933',
          600: '#e67300',
        },
        chakra: {
          500: '#000080',
          600: '#000066',
        }
      }
    },
  },
  plugins: [],
}
