/**
 * Site Configuration
 *
 * This file contains site-wide configuration settings.
 * In the future, this can be moved to a database/API endpoint for dynamic configuration.
 */

export interface SiteConfig {
  heroCarousel: {
    backgroundColor: string;
    textColor?: string;
  };
  // Add more config sections as needed
  // theme: { ... }
  // branding: { ... }
}

/**
 * Default site configuration
 * Admin can modify these values
 */
export const siteConfig: SiteConfig = {
  heroCarousel: {
    backgroundColor: "var(--light-gray)", // Light gray - can be changed to any color
    textColor: "var(--gray-900)", // Dark gray for text
  },
};

/**
 * Get hero carousel background color
 */
export function getHeroCarouselBackground(): string {
  return siteConfig.heroCarousel.backgroundColor;
}

/**
 * Get hero carousel text color
 */
export function getHeroCarouselTextColor(): string {
  return siteConfig.heroCarousel.textColor || "var(--gray-900)";
}
