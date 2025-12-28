/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
  },

  /**
   * 🔴 IMPORTANT
   * Prevent Tailwind from outputting `lab()` / `oklch()` colors
   * which crash html2canvas and break Scene2 rendering
   */
  experimental: {
    optimizeUniversalDefaults: true,
  },

  future: {
    disableColorOpacityUtilitiesByDefault: true,
  },

  plugins: [],
};
