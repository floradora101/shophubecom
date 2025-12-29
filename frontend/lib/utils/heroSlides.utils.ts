import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { mockHeroSlides, getHeroSlides } from "@/dev/mocks/heroSlides.mock";
import { getDiscountInfo } from "@/lib/utils/products";

export interface DiscountInfo {
  discountPercent: number;
  originalPrice?: number;
  hasDiscount: boolean;
}

/**
 * Calculate discount information for a product
 */
export function calculateProductDiscountInfo(product?: Product): DiscountInfo {
  if (!product) {
    return {
      discountPercent: 0,
      originalPrice: undefined,
      hasDiscount: false,
    };
  }

  const { hasDiscount, discountPercent, originalPrice } = getDiscountInfo(product);

  return { discountPercent, originalPrice: originalPrice || undefined, hasDiscount };
}

/**
 * Resolve product data for a slide if it references a product
 */
export function resolveSlideProduct(
  slide: HeroSlide,
  productsBySlug?: Record<string, Product> | Map<string, Product>
): Product | undefined {
  if (slide.media.kind !== "product" || !slide.media.productSlug) {
    return undefined;
  }

  if (productsBySlug instanceof Map) {
    return productsBySlug.get(slide.media.productSlug);
  }

  return productsBySlug?.[slide.media.productSlug];
}

/**
 * Filter slides to only include active ones based on current date and isActive flag
 */
export function filterActiveSlides(
  slides: HeroSlide[],
  now = new Date()
): HeroSlide[] {
  if (!slides || !Array.isArray(slides)) {
    return [];
  }

  return slides.filter((slide) => {
    if (!slide.isActive) return false;

    const startsAt = slide.startsAt ? new Date(slide.startsAt) : null;
    const endsAt = slide.endsAt ? new Date(slide.endsAt) : null;

    if (startsAt && startsAt > now) return false;
    if (endsAt && endsAt < now) return false;

    return true;
  });
}

/**
 * Sort slides by priority (descending) then by id (stable sort)
 */
export function sortSlides(slides: HeroSlide[]): HeroSlide[] {
  if (!slides || !Array.isArray(slides)) {
    return [];
  }

  return [...slides].sort((a, b) => {
    // Higher priority first
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Stable sort by id
    return a.id.localeCompare(b.id);
  });
}

/**
 * Compatibility adapter to build slides from featured products
 * This allows gradual migration from product-driven to slide-driven approach
 */
export function buildSlidesFromFeaturedProducts(
  products: Product[]
): HeroSlide[] {
  return products.map((product, index) => ({
    id: `compat-product-${product.id}`,
    type: "PRODUCT_SPOTLIGHT" as const,
    priority: 1, // Low priority for compatibility slides
    isActive: true,

    badgeText: "Featured Product",
    headline:
      product.name.length > 20
        ? product.name.substring(0, 20) + "..."
        : product.name,
    description:
      product.description ||
      "Discover this amazing product with premium quality and exceptional performance.",

    ctaPrimary: {
      label: "Shop Now",
      href: `/products/${product.slug}`,
    },

    media: {
      kind: "product" as const,
      productSlug: product.slug,
      alt: product.name,
    },

    theme: {
      accentToken: "primary" as const,
    },
  }));
}

/**
 * Get all hero slides from backend (mock for now)
 */
export { getHeroSlides };

/**
 * Content uniqueness assertion for development
 * Logs warning if slides have identical headline + description combinations
 */
export function assertUniqueSlideContent(slides: HeroSlide[]): void {
  if (process.env.NODE_ENV !== "development") return;

  const contentMap = new Map<string, string>();

  slides.forEach((slide) => {
    const key = `${slide.headline}|${slide.description}`;
    if (contentMap.has(key)) {
      console.warn(
        `⚠️  Duplicate slide content detected:\n` +
          `   Slide "${slide.id}" (${
            slide.type
          }) has the same headline+description as "${contentMap.get(key)}"\n` +
          `   Headline: "${slide.headline}"\n` +
          `   Description: "${slide.description}"`
      );
    } else {
      contentMap.set(key, slide.id);
    }
  });
}
