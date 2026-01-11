
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
}

export interface ProductSpotlightSlide extends BaseHeroSlide {
  type: "PRODUCT_SPOTLIGHT";
  // Product spotlight specific fields
  features?: Array<{
    iconName?: string; // Lucide icon name string
    text: string;
  }>;
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

export type LandscapeTextVariant = "minimal" | "glass" | "editorial" | "neon";
export type LandscapeBadgeVariant = "solid" | "outline" | "pill";

export interface LandscapeImageSlide
  extends Omit<BaseHeroSlide, "media" | "headline" | "description"> {
  type: "LANDSCAPE_IMAGE";
  // Landscape hero specific fields - backward compatible
  subtitle?: string; // Optional subtitle text (for backward compatibility)
  textPosition?: "left" | "center" | "right"; // Text positioning on the image (for backward compatibility)
  overlayOpacity?: number; // Dark overlay opacity (0-1) (for backward compatibility)

  // Override to make optional since content can provide these
  headline?: string;
  description?: string;

  // New structured content and styling (optional for backward compatibility)
  content?: {
    badgeText?: string;
    subtitle?: string;
    headline?: string;
    highlight?: string;
    description?: string;
  };
  textStyle?: {
    variant?: LandscapeTextVariant;
    placement?: "left" | "center" | "right"; // Where the block sits on screen
    textAlign?: "left" | "center" | "right"; // Text alignment within the block
    maxWidth?: "sm" | "md" | "lg";
    headlineDecoration?:
      | "none"
      | "underline"
      | "gradient"
      | "accentBar"
      | "outline"
      | "outlineFill"
      | "glow"
      | "redAccent"
      | "neon"
      | "redNeonGlow"
      | "doubleUnderline"
      | "wavyUnderline"
      | "animatedUnderline"
      | "boxed"
      | "shadow"
      | "metallic"
      | "glitch"
      | "stripe"
      | "silverGlow"
      | "chrome"
      | "silverOutline"
      | "iceGlow"
      | "platinum";
    highlightEffect?: "none" | "underlineGlow" | "pulse" | "shimmer" | "bounce"; // Special effects for highlight text
    animation?: {
      maskReveal?: boolean; // Text mask reveal animation
      stagger?: boolean; // Staggered element animations
    };
    badgeVariant?: LandscapeBadgeVariant;
  };
  overlay?: {
    opacity?: number;
    type?: "solid" | "gradient";
  };

  actionButton?: {
    label: string;
    href: string;
    icon?: string; // Lucide icon name
  };

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
