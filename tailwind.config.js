/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // บรรทัดนี้สำคัญมาก ต้องมี!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}