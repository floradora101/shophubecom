// UI Design Tokens for consistent spacing, sizing, colors, and layout
// These tokens standardize all design patterns across the application

export const ui = {
  // Container gutters - responsive horizontal padding
  gutter: "px-4 sm:px-6 lg:px-8",

  // Section vertical spacing - standardized page section padding
  sectionY: {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
    xl: "py-20",
    "2xl": "py-24",
  } as const,

  // Stack vertical spacing - standardized component internal spacing
  stack: {
    xs: "space-y-2",
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
    "2xl": "space-y-12",
  } as const,

  // Gap spacing - standardized horizontal/vertical gaps between items
  gap: {
    "1.5": "gap-1.5",
    "2.5": "gap-2.5",
    xs: "gap-3",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
    "2xl": "gap-16",
  } as const,

  // Icon sizing - consistent icon dimensions
  icon: {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    hero: "h-8 w-8",
  } as const,

  // Typography spacing - consistent spacing for split headings and text elements
  typography: {
    // Spacing between italic and bold parts in split headings
    splitHeading: "ml-3", // 0.75rem - provides natural word separation
  } as const,

  // Hero layout - consistent dimensions and spacing
  hero: {
    // Fixed responsive height using clamp for stable layout
    // 520px min (mobile), 72svh ideal (desktop), 760px max
    height: "h-[clamp(520px,72svh,760px)]",
    // New single hero height token for 2026 design
    h: "clamp(520px, 72svh, 760px)",
  } as const,

  // Color tokens - comprehensive color system from globals.css
  //
  // 🚨 RESTRICTED PALETTE FOR STOREFRONT 🚨
  //
  // Storefront components MUST use ONLY these color families:
  // - Design System tokens: bg, fg, surface, surface-muted, muted-fg, border, border-hover, ring
  // - Primary/Secondary: primary-*, secondary-*
  // - Semantic: success, error, warning, info
  //
  // DO NOT use: gray-*, slate-*, zinc-*, neutral-*, warm-gray-*, cream-*, white, black
  // These should be replaced with ds tokens above.
  //
  // Admin-only components may use unrestricted colors if needed.
  //
  colors: {
    // Primary red theme
    primary: {
      50: "var(--primary-50)",
      100: "var(--primary-100)",
      200: "var(--primary-200)",
      300: "var(--primary-300)",
      400: "var(--primary-400)",
      500: "var(--primary-600)",
      600: "var(--primary-600)",
    } as const,

    // Secondary warm amber theme
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
      900: "var(--secondary-900)",
    } as const,

    // Warm neutral colors
    cream: {
      50: "var(--cream-50)",
      100: "var(--cream-100)",
      200: "var(--cream-200)",
    } as const,

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
    } as const,

    // Neutral base colors
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
    } as const,

    // Semantic colors
    success: "var(--success)",
    "success-light": "var(--success-light)",
    error: "var(--error)",
    "error-light": "var(--error-light)",
    warning: "var(--warning)",
    info: "var(--info)",
    yellow: "var(--yellow)",
    "yellow-light": "var(--yellow-light)",
    "light-gray": "var(--light-gray)",

    // Base colors
    white: "var(--white)",
    black: "var(--black)",
    background: "var(--background)",
    foreground: "var(--foreground)",
  } as const,

  // Motion tokens - standardized animation system
  // Motion Guidelines:
  // - fast (200ms): button hovers, small interactions, micro-feedback
  // - base (300ms): standard transitions, form feedback, component state changes
  // - slow (500ms): hero animations, large layout changes, image zooms
  // - hero (500ms + premium ease): main hero slider, premium interactions
  // - hover (200ms): all hover effects
  // - enter/exit: modal/panel enter (250ms)/exit (200ms) animations
  motion: {
    fast: "duration-200 ease-out",
    base: "duration-300 ease-out",
    slow: "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", // premium ease
    hero: "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    hover: "duration-200 ease-out",
    enter: "duration-250 ease-out",
    exit: "duration-200 ease-in",
    transform: "transition-transform",
    opacity: "transition-opacity",
    colors: "transition-colors",
    all: "transition-all",
  } as const,

  // Fixed red-black theme - no theme switching functionality
  theme: {
    accent: "text-primary-600",
    accentLight: "text-primary-500",
    accentDark: "text-primary-700",
    bgGradient:
      "bg-linear-to-r from-primary-500 via-primary-600 to-primary-700",
    bgSolid: "bg-primary-500",
    border: "border-primary-600/20",
    borderLight: "border-primary-500/30",
    badgeBg: "bg-linear-to-r from-primary-500 via-primary-600 to-primary-700",
    badgeBorder: "border-white/22",
    glow: "bg-primary-600/20",
  } as const,
} as const;

// Type exports for TypeScript safety
export type SectionSpacing = keyof typeof ui.sectionY;
export type StackSpacing = keyof typeof ui.stack;
export type GapSpacing = keyof typeof ui.gap;
export type IconSize = keyof typeof ui.icon;
export type TypographySpacing = keyof typeof ui.typography;
export type ColorToken = keyof typeof ui.colors;
export type HeroTheme = "red-black"; // Fixed red-black theme only
export type MotionToken = keyof typeof ui.motion;
export type HeroLayoutToken = keyof typeof ui.hero;

// Helper functions for applying tokens
export const getIconClass = (size: IconSize = "md") => ui.icon[size];
export const getGapClass = (size: GapSpacing = "md") => ui.gap[size];
export const getTypographySpacing = (
  type: TypographySpacing = "splitHeading"
) => ui.typography[type];

// Color token helpers
export const getColorValue = (token: ColorToken) => ui.colors[token];
export const getHeroTheme = () => ui.theme; // Always returns red-black theme

// Motion token helpers
export const getMotion = (token: MotionToken) => ui.motion[token];
export const motion = (...tokens: MotionToken[]) =>
  tokens.map(getMotion).join(" ");

// Hero theme validation utility (moved to separate file)
// getHeroAccentClasses removed - themes now use CSS variables
