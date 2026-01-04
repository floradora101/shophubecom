import type { HeroTheme } from "@/lib/ui-tokens";

export type HeroSlideType =
  | "PRODUCT_SPOTLIGHT"
  | "CATEGORY_SPOTLIGHT"
  | "OFFER"
  | "TESTIMONIAL"
  | "LANDSCAPE_IMAGE";

export interface BaseHeroSlide {
  id: string;
  type: HeroSlideType;
  priority: number;
  isActive: boolean;
  startsAt?: string; // ISO date string
  endsAt?: string; // ISO date string

  // Content fields
  badgeText?: string;
  headline: string;
  highlight?: string; // Optional secondary headline part
  description: string;

  // CTA
  ctaPrimary: {
    label: string;
    href: string;
  };
  ctaSecondary?: {
    label: string;
    href: string;
  };

  // Media
  media: {
    kind: "product" | "image" | "video" | "none";
    productSlug?: string;
    imageUrl?: string;
    videoUrl?: string;
    alt?: string;
    position?: "center" | "top" | "bottom" | "left" | "right"; // For LANDSCAPE_HERO cropping
    aspect?: "landscape" | "default"; // For non-fullscreen slides
  };

  // Theme
  theme?: {
    accentToken?: HeroTheme;
  };
}

export interface ProductSpotlightSlide extends BaseHeroSlide {
  type: "PRODUCT_SPOTLIGHT";
  // Product spotlight specific fields can be added here if needed
}

export interface CategorySpotlightSlide extends BaseHeroSlide {
  type: "CATEGORY_SPOTLIGHT";
  categoryBullets: string[]; // 3 quick bullet points about the category
}

export interface OfferSlide extends BaseHeroSlide {
  type: "OFFER";
  offerLabel: string;
  offerEndsAt: string; // ISO date string
  promoCode?: string;
}

export interface TestimonialSlide extends BaseHeroSlide {
  type: "TESTIMONIAL";
  quote: string;
  authorName: string;
  rating: number; // 0-5
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

export interface LandscapeImageSlide extends Omit<BaseHeroSlide, "media"> {
  type: "LANDSCAPE_IMAGE";
  // Landscape hero specific fields
  subtitle?: string; // Optional subtitle text
  textPosition?: "left" | "center" | "right"; // Text positioning on the image
  overlayOpacity?: number; // Dark overlay opacity (0-1)
  // Restrict media to only images for landscape slides
  media: {
    kind: "image";
    imageUrl: string;
    alt?: string;
    position?: "center" | "top" | "bottom" | "left" | "right";
  };
}

export type HeroSlide =
  | ProductSpotlightSlide
  | CategorySpotlightSlide
  | OfferSlide
  | TestimonialSlide
  | LandscapeImageSlide;
