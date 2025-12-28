// UI Design Tokens for consistent spacing, sizing, and layout
// These tokens standardize spacing patterns across the application

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
} as const;

// Type exports for TypeScript safety
export type SectionSpacing = keyof typeof ui.sectionY;
export type StackSpacing = keyof typeof ui.stack;
export type GapSpacing = keyof typeof ui.gap;
export type IconSize = keyof typeof ui.icon;
export type TypographySpacing = keyof typeof ui.typography;

// Helper functions for applying tokens
export const getIconClass = (size: IconSize = "md") => ui.icon[size];
export const getGapClass = (size: GapSpacing = "md") => ui.gap[size];
export const getTypographySpacing = (
  type: TypographySpacing = "splitHeading"
) => ui.typography[type];
