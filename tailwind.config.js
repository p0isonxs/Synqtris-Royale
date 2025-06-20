module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
 theme: {
    extend: {
      animation: {
        'bounce-in-out': 'bounce-in-out 0.95s cubic-bezier(0.5, 1.5, 0.3, 1) both',
      },
      keyframes: {
        'bounce-in-out': {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(-40px)' },
          '30%': { opacity: '1', transform: 'scale(1.1) translateY(0)' },
          '70%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.6) translateY(40px)' },
        },
      },
    },
  },
  plugins: [],
};