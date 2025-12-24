/**
 * DEPRECATED: This theme file is no longer used.
 *
 * All design tokens are now centralized in:
 * - app/globals.css (CSS variables)
 * - tailwind.config.ts (Tailwind extensions)
 *
 * Please use the design system components instead:
 * - Container, Section, Stack, Grid, PageHeader
 * - Button, Input, Textarea, Select, Checkbox, Radio
 * - Card, Badge, Typography components
 *
 * For colors: use warm-gray-* instead of gray-*
 * For spacing: use design tokens from globals.css
 * For radius/shadows: use Tailwind classes with design tokens
 */

// Legacy theme object for backward compatibility
// TODO: Remove this file after all components are migrated
export const theme = {
  radius: {
    card: "rounded-2xl",
    pill: "rounded-full",
  },
  shadow: {
    card: "shadow-sm",
    hover: "hover:shadow-lg",
  },
  border: {
    base: "border border-warm-gray-200",
  },
  surfaces: {
    base: "bg-white",
    alt: "bg-warm-gray-50",
  },
  text: {
    heading: "text-warm-gray-900",
    body: "text-warm-gray-700",
    muted: "text-warm-gray-600",
  },
  spacing: {
    sectionY: "py-8 md:py-12",
    gutter: "px-4 sm:px-6 lg:px-8",
  },
} as const;

export function cnTheme(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(" ");
}
