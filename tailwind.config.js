/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Resume color themes - bg, text, border, hover
    "bg-blue-100",   "text-blue-600",   "border-blue-200",   "hover:border-blue-200",
    "bg-purple-100", "text-purple-600", "border-purple-200", "hover:border-purple-200",
    "bg-green-100",  "text-green-600",  "border-green-200",  "hover:border-green-200",
    "bg-red-100",    "text-red-600",    "border-red-200",    "hover:border-red-200",
    "bg-orange-100", "text-orange-600", "border-orange-200", "hover:border-orange-200",
    "bg-gray-100",   "text-gray-600",   "border-gray-200",   "hover:border-gray-200",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}