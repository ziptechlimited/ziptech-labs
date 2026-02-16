/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#2563EB',
        secondary: '#10B981',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#1F2937',
        muted: '#6B7280',
        danger: '#DC2626',
        warning: '#F59E0B',
        success: '#16A34A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
