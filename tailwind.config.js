/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C5CE7',    // Основной фиолетовый цвет
        secondary: '#2D3436',  // Тёмный фон
        accent: '#00B894',     // Акцентный зелёный
        dark: '#1E1E1E',       // Тёмный фон для карточек
        light: '#F5F6FA',      // Светлый фон
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-bg.jpg')",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-orbitron)'],
      },
    },
  },
  plugins: [],
} 