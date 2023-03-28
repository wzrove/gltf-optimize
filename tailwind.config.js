/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', 'videolist.html','./src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['dark', 'light'],
  },
};
