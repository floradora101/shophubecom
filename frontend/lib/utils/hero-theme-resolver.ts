import type { HeroTheme } from "@/lib/ui-tokens";

// Valid hero themes - must match the keys in ui.themes
const VALID_THEMES: HeroTheme[] = [
  "crimson",
  "charcoal",
  "burgundy",
  "oil",
  "silver",
  "midnight",
];

export function isValidHeroTheme(theme: string): theme is HeroTheme {
  return VALID_THEMES.includes(theme as HeroTheme);
}

export function validateHeroTheme(
  theme: string | undefined,
  slideId?: string
): HeroTheme {
  // If theme is undefined or invalid, use default
  if (!theme || !isValidHeroTheme(theme)) {
    const defaultTheme: HeroTheme = "crimson";

    // Dev-only warning for invalid themes
    if (process.env.NODE_ENV === "development") {
      console.error(
        `Invalid hero theme "${theme}" for slide ${slideId || "unknown"}. ` +
          `Valid themes: ${VALID_THEMES.join(", ")}. ` +
          `Falling back to "${defaultTheme}".`
      );
    }

    return defaultTheme;
  }

  return theme;
}

// Runtime assertion for theme validation (useful for tests)
export function assertValidHeroTheme(
  theme: string
): asserts theme is HeroTheme {
  if (!isValidHeroTheme(theme)) {
    throw new Error(
      `Invalid hero theme "${theme}". Valid themes: ${VALID_THEMES.join(", ")}`
    );
  }
}
