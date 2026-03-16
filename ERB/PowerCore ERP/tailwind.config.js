/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:       '#875A7B',
          'primary-light':'#9B6B8A',
          'primary-dark': '#6C4A6A',
          teal:          '#00A09D',
          'teal-light':  '#00BFB3',
          'teal-dark':   '#008C89',
          /* dark-mode surfaces (Odoo-style) */
          bg:      '#1e1e1e',
          surface: '#252526',
          surface2:'#2d2d2d',
          'navy-light': '#252526',
          border:  'rgba(255,255,255,0.1)',
          /* light */
          page:    '#F0F2F5',
          card:    '#FFFFFF',
          'gray-text':'#1F2937',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'none' } },
        slideIn:{ '0%': { transform: 'translateX(20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-in':'slideIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
