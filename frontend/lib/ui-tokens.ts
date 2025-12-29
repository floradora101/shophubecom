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

  // Color tokens - comprehensive color system from globals.css
  colors: {
    // Primary red theme
    primary: {
      50: "var(--primary-50)",
      100: "var(--primary-100)",
      200: "var(--primary-200)",
      300: "var(--primary-300)",
      400: "var(--primary-400)",
      500: "var(--primary-500)",
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

  // Hero slide theme configurations
  themes: {
    primary: {
      accent: "text-primary-600",
      accentLight: "text-primary-500",
      accentDark: "text-primary-700",
      bgGradient: "from-primary-50 to-primary-100/50",
      bgSolid: "bg-primary-50",
      border: "border-primary-200/50",
      borderLight: "border-primary-100/30",
      badgeBg: "bg-primary-100",
      badgeBorder: "border-primary-200/50",
      glow: "bg-primary-500/20",
    } as const,

    secondary: {
      accent: "text-secondary-600",
      accentLight: "text-secondary-500",
      accentDark: "text-secondary-700",
      bgGradient: "from-secondary-50 to-secondary-100/50",
      bgSolid: "bg-secondary-50",
      border: "border-secondary-200/50",
      borderLight: "border-secondary-100/30",
      badgeBg: "bg-secondary-100",
      badgeBorder: "border-secondary-200/50",
      glow: "bg-secondary-500/20",
    } as const,

    blue: {
      accent: "text-blue-600",
      accentLight: "text-blue-500",
      accentDark: "text-blue-700",
      bgGradient: "from-blue-50 to-blue-100/50",
      bgSolid: "bg-blue-50",
      border: "border-blue-200/50",
      borderLight: "border-blue-100/30",
      badgeBg: "bg-blue-100",
      badgeBorder: "border-blue-200/50",
      glow: "bg-blue-500/20",
    } as const,

    success: {
      accent: "text-success",
      accentLight: "text-success-light",
      accentDark: "text-green-700",
      bgGradient: "from-green-50 to-green-100/50",
      bgSolid: "bg-green-50",
      border: "border-green-200/50",
      borderLight: "border-green-100/30",
      badgeBg: "bg-green-100",
      badgeBorder: "border-green-200/50",
      glow: "bg-green-500/20",
    } as const,

    warning: {
      accent: "text-warning",
      accentLight: "text-yellow-500",
      accentDark: "text-yellow-700",
      bgGradient: "from-yellow-50 to-yellow-100/50",
      bgSolid: "bg-yellow-50",
      border: "border-yellow-200/50",
      borderLight: "border-yellow-100/30",
      badgeBg: "bg-yellow-100",
      badgeBorder: "border-yellow-200/50",
      glow: "bg-yellow-500/20",
    } as const,

    cream: {
      accent: "text-warm-gray-700",
      accentLight: "text-warm-gray-600",
      accentDark: "text-warm-gray-800",
      bgGradient: "from-cream-50 to-cream-100/50",
      bgSolid: "bg-cream-50",
      border: "border-warm-gray-200/50",
      borderLight: "border-warm-gray-100/30",
      badgeBg: "bg-cream-100",
      badgeBorder: "border-warm-gray-200/50",
      glow: "bg-warm-gray-500/10",
    } as const,
  } as const,
} as const;

// Type exports for TypeScript safety
export type SectionSpacing = keyof typeof ui.sectionY;
export type StackSpacing = keyof typeof ui.stack;
export type GapSpacing = keyof typeof ui.gap;
export type IconSize = keyof typeof ui.icon;
export type TypographySpacing = keyof typeof ui.typography;
export type ColorToken = keyof typeof ui.colors;
export type HeroTheme = keyof typeof ui.themes;

// Helper functions for applying tokens
export const getIconClass = (size: IconSize = "md") => ui.icon[size];
export const getGapClass = (size: GapSpacing = "md") => ui.gap[size];
export const getTypographySpacing = (
  type: TypographySpacing = "splitHeading"
) => ui.typography[type];

// Color token helpers
export const getColorValue = (token: ColorToken) => ui.colors[token];
export const getHeroTheme = (theme: HeroTheme) => ui.themes[theme];

// Hero slide theme utilities
export const getHeroAccentClasses = (theme: HeroTheme = "primary") => {
  const themeConfig = ui.themes[theme];
  return {
    accent: themeConfig.accent,
    accentLight: themeConfig.accentLight,
    accentDark: themeConfig.accentDark,
    bgGradient: themeConfig.bgGradient,
    bgSolid: themeConfig.bgSolid,
    border: themeConfig.border,
    borderLight: themeConfig.borderLight,
    badgeBg: themeConfig.badgeBg,
    badgeBorder: themeConfig.badgeBorder,
    glow: themeConfig.glow,
  };
};
