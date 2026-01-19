// ProductRevealSection: Swipe-to-reveal grid with price drops
"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Zap, Tag, ChevronDown, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { NavigationButton } from "@/components/ui/navigation-button";
import { SwipeRevealCard } from "./SwipeRevealCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BackgroundGradients } from "./shared/BackgroundGradients";
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

  // Trigger animations on mount - immediate load (no fake delay)
  useEffect(() => {
    setIsLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              gradient: "from-primary-50 via-primary-100 to-primary-50",
            }}
            title={{ italic: "Swipe", bold: "to Reveal" }}
            description="Discover exclusive price drops with our interactive 2026 reveal cards. Experience the thrill of the hunt."
          />

          {/* Reveal Cards Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {revealProducts.slice(0, visibleCards).map((reveal, index) => (
              <div
                key={`${reveal.product.id}-${reveal.revealType}`}
                className="group relative transform transition-all duration-700 ease-out hover:scale-[1.03] hover:-translate-y-2 animate-fadeInUp"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* 2026 Style: Animated Glow behind card */}
                <div className="absolute -inset-1 bg-linear-to-r from-primary-600/20 to-primary-600/0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card container */}
                <div className="relative rounded-lg shadow-xl overflow-hidden border border-white/5 bg-gray-900 h-full">
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
            <div className="flex justify-center pt-8 sm:pt-12">
              <button
                onClick={handleToggleCards}
                className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-8 py-3 sm:px-10 sm:py-4 bg-primary-600 text-white font-black rounded-lg transition-all duration-500 shadow-2xl border border-primary-500/50 hover:bg-primary-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-500/20 overflow-hidden uppercase tracking-widest text-xs sm:text-sm"
                aria-label={
                  visibleCards === 4
                    ? `Show ${revealProducts.length - 4} more deals`
                    : "Show fewer deals"
                }
              >
                {/* 2026 Style: Internal glow */}
                <div className="absolute inset-0 bg-linear-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {visibleCards === 4 ? (
                  <>
                    <Sparkles className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                    <span className="relative z-10 tracking-tight">
                      Expand Experience
                    </span>
                    <ChevronDown className="h-5 w-5 text-white transition-transform duration-500 group-hover:translate-y-1" />
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-5 w-5 text-white transition-transform duration-500 group-hover:-rotate-180" />
                    <span className="relative z-10 tracking-tight">
                      Collapse Deals
                    </span>
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

// Skeleton component extracted to separate server component file
// See: app/_components/ProductRevealSectionSkeleton.tsx
