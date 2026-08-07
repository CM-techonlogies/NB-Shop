/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1e5',
          100: '#ffe1cc',
          200: '#ffc299',
          300: '#ffa366',
          400: '#ff8433',
          500: '#FF6B00',
          600: '#e66000',
          700: '#cc5500',
          800: '#993f00',
          900: '#662a00',
        },
        green: {
          50: '#e8f5ee',
          100: '#c5e5d3',
          200: '#9dd0b6',
          300: '#72bb97',
          400: '#4aaa7c',
          500: '#1A6B3C',
          600: '#166035',
          700: '#12512c',
          800: '#0d3d21',
          900: '#082815',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          50: '#FFFCF7',
          100: '#FFF8F0',
          200: '#FFE9CC',
        }
      },
      fontFamily: {
        body: ['Nunito', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        sans: ['Nunito', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'primary': '0 4px 14px rgba(255, 107, 0, 0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
