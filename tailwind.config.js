const token = (name) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      ink: token('ink'),
      brand: token('brand'),
      orange: token('brand-orange'),
      pink: token('brand-pink'),
      peach: token('peach'),
      canvas: token('canvas'),
      unlock: token('unlock'),
      muted: token('muted'),
      teal: token('teal'),
      fg: token('fg'),
      surface: token('surface'),
      accent: token('accent'),
    },
    fontFamily: {
      display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    extend: {
      borderRadius: { card: '20px' },
    },
  },
  plugins: [],
};
