/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#101318',
        text: '#ffffff',
        muted: 'rgba(255, 255, 255, 0.55)',
        'chip-bg': 'rgba(255, 255, 255, 0.07)',
        'friend-card': 'rgba(255, 255, 255, 0.02)',
        'top-add-bg': '#ffffff',
        'top-add-text': '#000000',
      },
      backgroundImage: {
        'stripe-gradient': 'linear-gradient(180deg, rgba(255, 179, 71, 0.9) 0%, rgba(255, 119, 81, 0.9) 100%)',
        'avatar-gradient': 'linear-gradient(140deg, #ffb347 0%, #ff7751 100%)',
      },
    },
  },
  plugins: [],
};
