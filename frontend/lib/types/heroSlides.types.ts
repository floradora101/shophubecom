export type HeroSlideType =
  | "PRODUCT_SPOTLIGHT"
  | "CATEGORY_SPOTLIGHT"
  | "OFFER"
  | "TESTIMONIAL";

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
    kind: "product" | "image" | "none";
    productSlug?: string;
    imageUrl?: string;
    alt?: string;
  };

  // Theme
  theme?: {
    accentToken?: "primary" | "blue" | "green";
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

export type HeroSlide =
  | ProductSpotlightSlide
  | CategorySpotlightSlide
  | OfferSlide
  | TestimonialSlide;
