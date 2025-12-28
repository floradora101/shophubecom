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
        // Primary colors mapped to CSS variables
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
        },
        // Warm colors mapped to CSS variables
        cream: {
          50: "var(--cream-50)",
          100: "var(--cream-100)",
          200: "var(--cream-200)",
        },
        "warm-gray": {
          50: "var(--warm-gray-50)",
          100: "var(--warm-gray-100)",
          200: "var(--warm-gray-200)",
          300: "var(--warm-gray-300)",
          400: "var(--warm-gray-400)",
          500: "var(--warm-gray-500)",
          600: "var(--warm-gray-600)",
          700: "var(--warm-gray-700)",
          800: "var(--warm-gray-800)",
          900: "var(--warm-gray-900)",
        },
        // Neutral grays mapped to CSS variables
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
          700: "var(--gray-700)",
          800: "var(--gray-800)",
          900: "var(--gray-900)",
        },
        // Semantic colors mapped to CSS variables
        success: "var(--success)",
        "success-light": "var(--success-light)",
        error: "var(--error)",
        "error-light": "var(--error-light)",
        warning: "var(--warning)",
        info: "var(--info)",
        yellow: "var(--yellow)",
        "yellow-light": "var(--yellow-light)",
        "light-gray": "var(--light-gray)",
        // Secondary accent colors
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
        },
        // Base colors
        white: "var(--white)",
        black: "var(--black)",
        // Border colors
        border: "var(--border-color)",
        "border-hover": "var(--border-color-hover)",
        "border-focus": "var(--border-color-focus)",
        "border-error": "var(--border-color-error)",
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
      width: {
        "70": "17.5rem" /* 280px - for trending cards */,
      },
      fontFamily: {
        // Tech-optimized typography system - clean & modern
        sans: ["var(--font-inter)", "system-ui", "sans-serif"], // Primary body font
        display: ["var(--font-dm-sans)", "sans-serif"], // Headlines - modern geometric
        mono: ["var(--font-geist-mono)", "monospace"], // Technical specs & code
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
        "7xl": "var(--font-size-7xl)",
        "8xl": "var(--font-size-8xl)",
        "9xl": "var(--font-size-9xl)",
      },
      fontWeight: {
        thin: "var(--font-weight-thin)",
        extralight: "var(--font-weight-extralight)",
        light: "var(--font-weight-light)",
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
        extrabold: "var(--font-weight-extrabold)",
        black: "var(--font-weight-black)",
      },
      lineHeight: {
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },
      letterSpacing: {
        tighter: "var(--letter-spacing-tighter)",
        tight: "var(--letter-spacing-tight)",
        normal: "var(--letter-spacing-normal)",
        wide: "var(--letter-spacing-wide)",
        wider: "var(--letter-spacing-wider)",
        widest: "var(--letter-spacing-widest)",
      },
      zIndex: {
        dropdown: "var(--z-index-dropdown)",
        sticky: "var(--z-index-sticky)",
        fixed: "var(--z-index-fixed)",
        "modal-backdrop": "var(--z-index-modal-backdrop)",
        modal: "var(--z-index-modal)",
        popover: "var(--z-index-popover)",
        tooltip: "var(--z-index-tooltip)",
        toast: "var(--z-index-toast)",
      },
      animation: {
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "hero-bg":
          "radial-gradient(circle at 30% 20%, rgba(220, 38, 38, 0.1), transparent 50%), radial-gradient(circle at 70% 80%, rgba(220, 38, 38, 0.08), transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default withUt(config);
