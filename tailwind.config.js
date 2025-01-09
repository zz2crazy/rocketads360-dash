/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '800' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};