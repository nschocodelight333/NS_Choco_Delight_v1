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
        choco: {
          50:  '#FFF8F0',
          100: '#FEF0DB',
          200: '#FDD9B0',
          300: '#F9BB7B',
          400: '#D4A574',
          500: '#C9A063',
          600: '#8D6E63',
          700: '#6D4C41',
          800: '#4E342E',
          900: '#3E2723',
          950: '#1A0F0C',
        },
        gold: {
          300: '#F0D080',
          400: '#D4A574',
          500: '#C9A063',
          600: '#B8860B',
        },
        cream: '#FFF8F0',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'choco': '0 4px 24px rgba(62, 39, 35, 0.15)',
        'choco-lg': '0 8px 40px rgba(62, 39, 35, 0.2)',
        'gold': '0 4px 20px rgba(201, 160, 99, 0.3)',
      },
      backgroundImage: {
        'choco-gradient': 'linear-gradient(135deg, #3E2723 0%, #6D4C41 50%, #8D6E63 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A063 0%, #D4A574 100%)',
        'cream-gradient': 'linear-gradient(180deg, #FFF8F0 0%, #FEF0DB 100%)',
      },
    },
  },
  plugins: [],
};
