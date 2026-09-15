/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0EFFE',
          100: '#E0DEFD',
          200: '#C2BCFB',
          300: '#9B91F8',
          400: '#6B5DF3',
          500: '#4F46E5',
          600: '#3525CD',
          700: '#2A1DB5',
          800: '#211693',
          900: '#1B1278',
        },
        mint: {
          50: '#F0FDF8',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#6CF8BB',
          500: '#10B981',
          600: '#059669',
        },
        surface: {
          light: '#FAF8FF',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
