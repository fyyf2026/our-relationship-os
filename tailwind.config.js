/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5F8FC",
        card: "#FFFFFF",
        primary: "#6F9FCF",
        secondary: "#DCEBFA",
        accent: "#D9A7B0",
        ink: "#253344",
        muted: "#718096",
        sage: "#DCEBFA",
        clay: "#F5E3E7",
        ivory: "#F8FBFF",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(47, 79, 111, 0.10)",
        hover: "0 24px 60px rgba(47, 79, 111, 0.15)",
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
