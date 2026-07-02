/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: [
          "var(--font-quicksand)",
          "SF Pro Rounded",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        aura: {
          bg: "#0a0a0a",
          blue: "#6b8cae",
          amber: "#d4a574",
          green: "#7fb0a0",
          purple: "#9184a8",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
