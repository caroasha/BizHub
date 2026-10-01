/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a73e8',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1a73e8',
          700: '#1d4ed8',
          800: '#0d47a1',
          900: '#1e3a5f',
        },
        teal: {
          50: '#f0fdfa',
          500: '#0d9488',
          600: '#0f766e',
        },
      },
    },
  },
  plugins: [],
};