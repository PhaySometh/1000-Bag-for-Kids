const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#78C320",
        darkBlue: "#13284c",
        altGreen: "#76bc21",
        warm: "#FFD8A6",
      },
      fontFamily: {
        sans: [
          "Niradei",
          "Noto Sans Khmer",
          "Inter",
          "ui-sans-serif",
          "system-ui",
        ],
      },
    },
  },
  plugins: [],
};
