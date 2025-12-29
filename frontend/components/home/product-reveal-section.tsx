// ProductRevealSection: Swipe-to-reveal carousel with price drops
"use client";

import { useRef, useMemo } from "react";
import { Zap, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { NavigationButton } from "@/components/ui/navigation-button";
import { SwipeRevealCard } from "./swipe-reveal-card";
import { SectionHeader } from "./shared/section-header";
import { BackgroundGradients } from "./shared/background-gradients";
import { getDiscountInfo } from "@/lib/utils";
import { ensureArray } from "@/lib/utils";
import type { Product, Category } from "@/features/products/types";

interface ProductRevealSectionProps {
  products: Product[];
  categories?: Category[];
}

interface RevealProduct {
  product: Product;
  revealType: "price";
}

export function ProductRevealSection({ products }: ProductRevealSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Prepare reveal products: 8 price drop reveals for carousel
  const revealProducts = useMemo<RevealProduct[]>(() => {
    const safeProducts = ensureArray(products);
    if (safeProducts.length === 0) return [];

    // Find products with significant discounts for price reveals (at least 10% off)
    const productsWithDiscounts = safeProducts.filter((p) => {
      const { hasDiscount, discountPercent, originalPrice } =
        getDiscountInfo(p);
      return (
        hasDiscount &&
        discountPercent >= 10 &&
        originalPrice &&
        originalPrice > p.price
      );
    });

    const reveals: RevealProduct[] = [];

    // Add up to 8 price drop reveals
    productsWithDiscounts.slice(0, 8).forEach((product) => {
      reveals.push({
        product,
        revealType: "price",
      });
    });

    // Fallback: if not enough discounted products found, create sale-like experiences
    if (reveals.length < 8) {
      const remainingProducts = safeProducts.filter(
        (p) => !reveals.some((r) => r.product.id === p.id)
      );
      remainingProducts.slice(0, 8 - reveals.length).forEach((product) => {
        // Create a simulated discount for products without real discounts
        const simulatedProduct = {
          ...product,
          originalPrice: product.price * 1.25, // 25% higher "regular" price
          discount: {
            originalPrice: product.price * 1.25,
            discountPercent: 20,
            isOnSale: true,
          },
        };
        reveals.push({
          product: simulatedProduct,
          revealType: "price",
        });
      });
    }

    // Return up to 8 price reveals
    return reveals.slice(0, 8);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (revealProducts.length === 0) {
    return null;
  }

  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <BackgroundGradients variant="decorative" />

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <SectionHeader
            badge={{
              icon: Zap,
              text: "Interactive Discovery",
              gradient: "from-primary-100 via-primary-200 to-primary-100",
            }}
            title={{ italic: "Swipe", bold: "to Reveal" }}
            description="Discover exclusive price drops by dragging the handle"
            actions={
              <div className="hidden md:flex gap-2">
                <NavigationButton
                  variant="primary"
                  direction="left"
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
                />
                <NavigationButton
                  variant="primary"
                  direction="right"
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
                />
              </div>
            }
          />

          {/* Reveal Cards Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth"
          >
            {revealProducts.map((reveal) => (
              <div
                key={`${reveal.product.id}-${reveal.revealType}`}
                className="shrink-0 w-[280px]"
              >
                <SwipeRevealCard
                  product={reveal.product}
                  revealType={reveal.revealType}
                />
              </div>
            ))}
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-2 pt-4 text-sm text-gray-500">
            <Tag className="h-4 w-4 text-primary-500" />
            <span className="font-[var(--font-inter)]">
              Drag to reveal price drops
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Skeleton loader for ProductRevealSection component
 * Shows section header skeleton and swipe reveal card skeletons
 */
export function ProductRevealSectionSkeleton() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <BackgroundGradients variant="decorative" />

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Header - matches SectionHeader structure */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100">
              <SkeletonBlock className="w-4 h-4 rounded" />
              <SkeletonBlock className="h-4 w-40 rounded" />
            </div>
            <SkeletonBlock className="h-10 w-64 rounded" />
            <SkeletonBlock className="h-5 w-96 rounded" />
          </div>

          {/* Reveal Cards Carousel - matches production: horizontal scroll with w-[280px] cards */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="shrink-0 w-[280px]">
                <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[300px] md:min-h-[350px]">
                  {/* Card content skeleton - matches SwipeRevealCard structure */}
                  <div className="p-4 h-full">
                    {/* ProductCard inside SwipeRevealCard */}
                    <div className="flex flex-col w-full">
                      {/* Image area - aspect-square */}
                      <SkeletonBlock className="aspect-square rounded-lg border border-warm-gray-200 mb-3" />

                      {/* Product info */}
                      <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
                        {/* Product name skeleton - matches line-clamp-2 */}
                        <SkeletonBlock className="h-4 md:h-5" />
                        <SkeletonBlock className="h-4 md:h-5 w-3/4" />

                        {/* Rating skeleton (optional) */}
                        <SkeletonBlock className="h-3 w-1/2 mt-1" />

                        {/* Price skeleton - matches pricing layout */}
                        <div className="flex items-baseline gap-2 flex-wrap mt-2">
                          <SkeletonBlock className="h-4 md:h-5 w-16" />
                          <SkeletonBlock className="h-3 w-12" />
                          <SkeletonBlock className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swipe handle - matches SwipeRevealCard handle structure */}
                  <div
                    className="absolute top-0 bottom-0 z-20 flex items-center justify-center select-none"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <SkeletonBlock className="flex items-center justify-center w-6 h-6 rounded-full" />
                      <SkeletonBlock className="flex items-center justify-center w-6 h-6 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-2 pt-4 text-sm text-gray-500">
            <Tag className="h-4 w-4 text-primary-500" />
            <span className="font-[var(--font-inter)]">
              Drag to reveal price drops
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
