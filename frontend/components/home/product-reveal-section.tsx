// ProductRevealSection: Swipe-to-reveal section with price drops
"use client";

import { useMemo } from "react";
import { Zap, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
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
  // Prepare reveal products: 4 price drop reveals
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

    // Add exactly 4 price drop reveals
    productsWithDiscounts.slice(0, 4).forEach((product) => {
      reveals.push({
        product,
        revealType: "price",
      });
    });

    // Fallback: if not enough discounted products found, create sale-like experiences
    if (reveals.length < 4) {
      const remainingProducts = safeProducts.filter(
        (p) => !reveals.some((r) => r.product.id === p.id)
      );
      remainingProducts.slice(0, 4 - reveals.length).forEach((product) => {
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

    // Return exactly 4 price reveals
    return reveals.slice(0, 4);
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
            description="Discover exclusive price drops by dragging the handle"
          />

          {/* Reveal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {revealProducts.map((reveal) => (
              <SwipeRevealCard
                key={`${reveal.product.id}-${reveal.revealType}`}
                product={reveal.product}
                revealType={reveal.revealType}
              />
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
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100">
              <div className="animate-shimmer w-4 h-4 rounded bg-current" />
              <div className="animate-shimmer h-4 w-40 rounded bg-current" />
            </div>
            <div className="animate-shimmer h-10 w-64 rounded bg-current" />
            <div className="animate-shimmer h-5 w-96 rounded bg-current" />
          </div>

          {/* Reveal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-shimmer"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Card content skeleton */}
                <div className="p-6">
                  {/* Image area */}
                  <div className="aspect-square w-full rounded-lg bg-current mb-4" />

                  {/* Text content */}
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 rounded bg-current" />
                    <div className="h-4 w-full rounded bg-current" />
                    <div className="h-4 w-2/3 rounded bg-current" />

                    {/* Price area */}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="h-5 w-16 rounded bg-current" />
                      <div className="h-5 w-20 rounded bg-current" />
                    </div>
                  </div>

                  {/* Swipe indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 rounded bg-current" />
                      <div className="w-8 h-8 rounded-full bg-current" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Helper Text */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded animate-shimmer bg-current" />
              <div className="h-4 w-40 rounded animate-shimmer bg-current" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded animate-shimmer bg-current" />
              <div className="h-4 w-48 rounded animate-shimmer bg-current" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
