/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'void': '#0a0a0f',
        'abyss': '#12121a',
        'nebula': {
          100: '#f0e6ff',
          200: '#d4b8ff',
          300: '#b98aff',
          400: '#9d5cff',
          500: '#822eff',
          600: '#6a00f4',
          700: '#5200bd',
          800: '#3a0086',
          900: '#22004f',
        },
        'cosmic': {
          100: '#e6f4ff',
          200: '#b8e1ff',
          300: '#8aceff',
          400: '#5cbbff',
          500: '#2ea8ff',
          600: '#0095f4',
          700: '#0073bd',
          800: '#005186',
          900: '#002f4f',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(130, 46, 255, 0.5), 0 0 10px rgba(130, 46, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(130, 46, 255, 0.8), 0 0 30px rgba(130, 46, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
