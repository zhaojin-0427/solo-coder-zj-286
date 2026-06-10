/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cream: {
          50: '#FBF9F6',
          100: '#F5F1EB',
          200: '#E8E0D4',
          300: '#D4C8B6',
        },
        burgundy: {
          50: '#F5E6E9',
          100: '#E6C4CB',
          500: '#8B2635',
          600: '#72202C',
          700: '#5A1922',
        },
        sage: {
          100: '#DCE5DC',
          300: '#A5B9A5',
          500: '#6B8E6B',
          600: '#557055',
        },
        ink: {
          900: '#1C1C1C',
          700: '#3A3A3A',
          500: '#6B6560',
          300: '#A8A39E',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(28, 28, 28, 0.06)',
        card: '0 8px 32px rgba(28, 28, 28, 0.08)',
        glow: '0 0 20px rgba(139, 38, 53, 0.25)',
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
