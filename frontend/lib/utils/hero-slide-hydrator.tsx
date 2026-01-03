import { useMemo, useCallback } from "react";
import { validateHeroTheme } from "./hero-theme-resolver";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product, Category } from "@/features/products/types";

interface HydratedHeroSlide {
  id: string;
  theme: HeroTheme;
  content: React.ReactNode;
}

interface HeroSlideHydrationOptions {
  slides: HeroSlide[];
  productsBySlug?: Record<string, Product> | Map<string, Product>;
  categoriesBySlug?: Record<string, Category> | Map<string, Category>;
}

/**
 * Centralized slide processing utility
 * Takes raw slides + data and returns processed slides with resolved data
 */
export function useHeroSlideProcessor({
  slides,
  productsBySlug,
  categoriesBySlug,
}: HeroSlideHydrationOptions): {
  slides: HeroSlide[];
  getResolvedData: (slide: HeroSlide) => {
    product?: Product;
    category?: Category;
  };
} {
  const processedSlides = useMemo(() => {
    // Filter active slides and sort by priority
    const activeSlides = slides
      .filter((slide) => slide.isActive)
      .sort((a, b) => b.priority - a.priority);

    return activeSlides;
  }, [slides]);

  const getResolvedData = useCallback(
    (slide: HeroSlide) => {
      // Resolve product data if needed
      let product: Product | undefined;
      if (slide.media.kind === "product" && slide.media.productSlug) {
        if (productsBySlug instanceof Map) {
          product = productsBySlug.get(slide.media.productSlug);
        } else {
          product = productsBySlug?.[slide.media.productSlug];
        }
      }

      // Resolve category data if needed
      let category: Category | undefined;
      // TODO: Add category resolution logic when category slides are implemented

      return { product, category };
    },
    [productsBySlug, categoriesBySlug]
  );

  return { slides: processedSlides, getResolvedData };
}

/**
 * Helper to resolve product from slide media
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
 * Helper to resolve category from slide
 */
export function resolveSlideCategory(
  slide: HeroSlide,
  categoriesBySlug?: Record<string, Category> | Map<string, Category>
): Category | undefined {
  // TODO: Implement when category slides are added
  return undefined;
}
