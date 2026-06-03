import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hextech-inspired palette
        void: '#010a13',
        abyss: '#091016',
        slate: '#1e2328',
        steel: '#3c3c41',
        gold: {
          DEFAULT: '#c8aa6e',
          bright: '#f0e6d2',
          dark: '#785a28',
          deep: '#463714',
        },
        hextech: {
          DEFAULT: '#0ac8b9',
          dim: '#0397ab',
          deep: '#005a82',
        },
        blood: '#be1e37',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px #785a28, 0 0 12px rgba(200,170,110,0.25)',
        hextech: '0 0 18px rgba(10,200,185,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'glow-pulse': 'glow-pulse 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
