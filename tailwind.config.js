/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5FAF8",
        card: "#FFFFFF",
        primary: "#6BAFA7",
        secondary: "#A7D8D0",
        accent: "#7AAFD6",
        ink: "#243233",
        muted: "#6F8585",
        sage: "#9CCFB8",
        clay: "#8FBFC5",
        ivory: "#F7FBF8",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(36, 50, 51, 0.08)",
        hover: "0 24px 60px rgba(36, 50, 51, 0.13)",
        insetSoft: "inset 0 1px 0 rgba(255,255,255,0.86)",
      },
      borderRadius: {
        panel: "28px",
        card: "22px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
