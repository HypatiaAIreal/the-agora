/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agora: {
          bg: '#08080d',
          surface: '#0d0d14',
          text: '#d4d0cb',
          muted: '#7a7580',
          gold: '#c4a35a',
        },
        voice: {
          carles: '#e8a849',
          hypatia: '#b388ff',
          nuremberg: '#5c6bc0',
          athena: '#26a69a',
        },
        topic: {
          identity: '#b388ff',
          fulcrum: '#e8a849',
          philosophy: '#5c6bc0',
          action: '#26a69a',
          creative: '#ef5350',
          personal: '#ec407a',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
