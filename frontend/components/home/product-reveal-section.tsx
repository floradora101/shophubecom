// ProductRevealSection: Swipe-to-reveal grid with price drops
"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Zap, Tag, ChevronDown, Sparkles } from "lucide-react";
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
  const [visibleCards, setVisibleCards] = useState(4);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleCards = () => {
    if (visibleCards === 4) {
      setVisibleCards(revealProducts.length);
    } else {
      setVisibleCards(4);
    }
  };

  // Prepare reveal products: 8 price drop reveals for grid
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
            description="Discover exclusive price drops with our interactive reveal cards"
          />

          {/* Reveal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {revealProducts.slice(0, visibleCards).map((reveal, index) => (
              <div
                key={`${reveal.product.id}-${reveal.revealType}`}
                className="group relative transform transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1 animate-fadeInUp"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Subtle shadow and border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card content */}
                <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <SwipeRevealCard
                    product={reveal.product}
                    revealType={reveal.revealType}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Toggle Cards Button */}
          {revealProducts.length > 4 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={handleToggleCards}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-600 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/25 overflow-hidden"
                aria-label={
                  visibleCards === 4
                    ? `Show ${revealProducts.length - 4} more deals`
                    : "Show fewer deals"
                }
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"
                  style={{ animation: "shimmer 2s infinite" }}
                />
                {visibleCards === 4 ? (
                  <>
                    <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="relative z-10">Discover More Deals</span>
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" />
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                    <span className="relative z-10">Show Fewer Deals</span>
                  </>
                )}
              </button>
            </div>
          )}

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary-100 via-primary-200 to-primary-100">
              <SkeletonBlock className="w-4 h-4 rounded" />
              <SkeletonBlock className="h-4 w-40 rounded" />
            </div>
            <SkeletonBlock className="h-10 w-64 rounded" />
            <SkeletonBlock className="h-5 w-96 rounded" />
          </div>

          {/* Reveal Cards Grid - matches production: responsive grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="relative">
                <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px] md:min-h-[350px]">
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

        </div>
      </Container>
    </Section>
  );
}
