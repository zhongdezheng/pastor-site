/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#fefdfb', 100: '#fdf9f2', 200: '#f9f0e0', 300: '#f2e2c4', 400: '#e8cd9a', 500: '#dbb474', 600: '#c99a52', 700: '#a87d40', 800: '#886536', 900: '#6f5330', 950: '#3d2b18' },
        clay: { 50: '#f7f5f3', 100: '#ede9e3', 200: '#dbd3c8', 300: '#c4b7a5', 400: '#ac9881', 500: '#9a836a', 600: '#8a725d', 700: '#735d4e', 800: '#5f4d42', 900: '#4e4038', 950: '#2b211d' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
