/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#0f9d58',
          dark: '#0a7d45',
          light: '#e8f6ee',
        },
        accent: '#ef4056',
      },
      boxShadow: {
        card: '0 1px 8px rgba(0,0,0,0.06)',
        nav: '0 -1px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
