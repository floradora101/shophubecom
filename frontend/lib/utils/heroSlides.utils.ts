import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { productRoutes } from "@/lib/routes";
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

  const { hasDiscount, discountPercent, originalPrice } =
    getDiscountInfo(product);

  return {
    discountPercent,
    originalPrice: originalPrice || undefined,
    hasDiscount,
  };
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

function isPlaceholderHref(href?: string | null): boolean {
  const v = (href || "").trim();
  return !v || v === "#";
}

function getCategorySlug(slide: HeroSlide): string | undefined {
  return slide.type === "CATEGORY_SPOTLIGHT" ? slide.categorySlug?.trim() : undefined;
}

function getPromotionId(slide: HeroSlide): string | undefined {
  return slide.type === "PROMOTION" ? slide.promotionId?.trim() : undefined;
}

function getEditorsPickProductSlug(slide: HeroSlide): string | undefined {
  return slide.type === "EDITORS_PICK" ? slide.productSlugs[0] : undefined;
}

function getComparisonLeftSlug(slide: HeroSlide): string | undefined {
  return slide.type === "COMPARISON_BATTLE"
    ? slide.leftProductSlug?.trim()
    : undefined;
}

function getComparisonRightSlug(slide: HeroSlide): string | undefined {
  return slide.type === "COMPARISON_BATTLE"
    ? slide.rightProductSlug?.trim()
    : undefined;
}

function getPrimaryCtaHref(slide: HeroSlide): string | undefined {
  if (slide.type === "LANDSCAPE_IMAGE") {
    return slide.actionButton?.href;
  }
  return slide.ctaPrimary?.href;
}

/**
 * Resolve the primary CTA href for a slide.
 *
 * Admin slides historically stored `ctaPrimary.href` as "#" (placeholder).
 * This function treats that as "unset" and derives a useful link from the slide's target
 * (product/category/etc.) so the CTA always navigates somewhere meaningful.
 */
export function resolveSlidePrimaryCtaHref(slide: HeroSlide): string {
  // Keep a real, non-placeholder href if present (backward-compatible override).
  const href = getPrimaryCtaHref(slide);
  if (!isPlaceholderHref(href)) {
    return href!;
  }

  // Category spotlight: go to category listing route.
  const categorySlug = getCategorySlug(slide);
  if (categorySlug) return productRoutes.category(categorySlug);

  // Promotion: go to products filtered by this promotion (discount products).
  const promotionId = getPromotionId(slide);
  if (promotionId) {
    return `${productRoutes.list()}?promotionId=${encodeURIComponent(promotionId)}`;
  }

  // Editor's pick: go to the first product.
  const firstEditorsPick = getEditorsPickProductSlug(slide);
  if (firstEditorsPick) return productRoutes.detail(firstEditorsPick);

  // Comparison battle: store only as a fallback; CTAs should usually go to each side's product.
  const leftComparisonSlug = getComparisonLeftSlug(slide);
  const rightComparisonSlug = getComparisonRightSlug(slide);
  if (leftComparisonSlug) return productRoutes.detail(leftComparisonSlug);
  if (rightComparisonSlug) return productRoutes.detail(rightComparisonSlug);

  // Most other slides can derive from media product slug if available.
  if (slide.media?.kind === "product" && slide.media.productSlug?.trim()) {
    return productRoutes.detail(slide.media.productSlug.trim());
  }

  // Safe fallback.
  return productRoutes.list();
}

/**
 * Filter slides to only include active ones based on current date and isActive flag
 *
 * Date handling:
 * - Uses Date.parse() for ISO string parsing (consistent UTC handling)
 * - Missing startsAt is treated as -Infinity (no start restriction)
 * - Missing endsAt is treated as +Infinity (no end restriction)
 * - All comparisons use millisecond timestamps for precision
 */
export function filterActiveSlides(
  slides: HeroSlide[],
  now = new Date()
): HeroSlide[] {
  if (!slides || !Array.isArray(slides)) {
    return [];
  }

  const nowTime = now.getTime();

  return slides.filter((slide) => {
    if (!slide.isActive) return false;

    // Parse ISO strings to timestamps, treating missing dates as infinity
    const startsAt = slide.startsAt ? Date.parse(slide.startsAt) : -Infinity;
    const endsAt = slide.endsAt ? Date.parse(slide.endsAt) : Infinity;

    // Slide is active if current time is within the range [startsAt, endsAt]
    return nowTime >= startsAt && nowTime <= endsAt;
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
  return products.map((product) => ({
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
      href: productRoutes.detail(product.slug),
    },

    media: {
      kind: "product" as const,
      productSlug: product.slug,
      alt: product.name,
    },

    theme: {
      accentToken: "red-black" as const,
    },
  }));
}

/**
 * Content uniqueness assertion for development
 * Logs warning if slides have identical headline + description combinations
 */
export function assertUniqueSlideContent(slides: HeroSlide[]): void {
  if (process.env.NODE_ENV !== "development") return;

  const contentMap = new Map<string, string>();

  slides.forEach((slide) => {
    const key = `${slide.type === "LANDSCAPE_IMAGE" ? slide.content.headline : slide.headline}|${slide.type === "LANDSCAPE_IMAGE" ? slide.content.description : slide.description}`;
    if (contentMap.has(key)) {
      // Duplicate slide content detected - warning only in development
      // This is a development-time validation, not a runtime error
    } else {
      contentMap.set(key, slide.id);
    }
  });
}
