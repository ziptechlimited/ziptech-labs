/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E8EDF6",
        accent: "#C6FF3D",
        secondary: "#7DD3FC",
        background: "#07080A",
        surface: "#0E1116",
        text: "#E8EDF6",
        muted: "#A0A9B7",
        danger: "#FF4D4D",
        warning: "#FBBF24",
        success: "#22C55E",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
