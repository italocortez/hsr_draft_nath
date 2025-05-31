/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00bcd4',
          hover: '#00acc1',
        },
        secondary: '#adb5bd',
        accent: '#ffb700',
        gray: {
          850: '#1a1a1a',
          900: '#121212',
        }
      },
      spacing: {
        'section': '2rem',
        'container': '1rem',
      },
      borderRadius: {
        'container': '0.5rem',
      }
    },
  },
  plugins: [],
}
