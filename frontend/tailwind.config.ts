import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fefaf7",
          100: "#faf5f0",
          200: "#f5ede3",
          300: "#ede0d1",
          400: "#d4c4b0",
        },
        "warm-gray": {
          50: "#faf9f7",
          100: "#f5f3f0",
          200: "#e8e5e0",
          300: "#d6d1c9",
          400: "#b8b2a8",
          500: "#9a9387",
          600: "#7a7366",
          700: "#5d564c",
          800: "#3f3a33",
          900: "#2d2926",
        },
        border: "var(--color-border)",
        "border-hover": "var(--color-border-hover)",
        "border-focus": "var(--color-border-focus)",
        "border-error": "var(--color-border-error)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        hover: "var(--shadow-hover)",
      },
      spacing: {
        "section-sm": "var(--spacing-xl)" /* py-10 mobile, py-16 desktop */,
        "section-md": "var(--spacing-2xl)" /* py-16 mobile, py-24 desktop */,
        "section-lg": "var(--spacing-3xl)" /* py-24 mobile, py-32 desktop */,
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        accent: ["var(--font-caveat)", "cursive"],
        card: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default withUt(config);
