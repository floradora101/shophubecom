
export type HeroSlideType =
  | "PRODUCT_SPOTLIGHT"
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
}

export interface ProductSpotlightSlide extends BaseHeroSlide {
  type: "PRODUCT_SPOTLIGHT";
  // Product spotlight specific fields
  features?: Array<{
    iconName?: string; // Lucide icon name string
    text: string;
  }>;
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

export type LandscapeTheme =
  | "glass-red"
  | "minimal-white"
  | "bold-dark"
  | "centered-glass"
  | "right-industrial";

export interface LandscapeImageSlide
  extends Omit<
    BaseHeroSlide,
    | "media"
    | "headline"
    | "description"
    | "highlight"
    | "badgeText"
    | "ctaPrimary"
    | "ctaSecondary"
  > {
  type: "LANDSCAPE_IMAGE";
  theme: LandscapeTheme;
  content: {
    badge: string;
    headline: string;
    highlight: string;
    description: string;
  };
  media: {
    kind: "image";
    imageUrl: string;
    alt: string;
    position?: "center" | "top" | "bottom" | "left" | "right";
  };
  actionButton: {
    label: string;
    href: string;
  };
}

export type HeroSlide =
  | ProductSpotlightSlide
  | OfferSlide
  | TestimonialSlide
  | LandscapeImageSlide;
