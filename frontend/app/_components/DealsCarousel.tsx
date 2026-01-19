// LatestProductsCarousel: Horizontal scroll of latest products using ProductCard
"use client";

import { useRef, useMemo } from "react";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { NavigationButton } from "@/components/ui/navigation-button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { SectionHeader } from "./shared/section-header";
import type { Product } from "@/features/products/types";

interface LatestProductsCarouselProps {
  products: Product[];
}

export function LatestProductsCarousel({
  products,
}: LatestProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Early return if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Section
      spacing="md"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <SectionHeader
            badge={{
              icon: Clock,
              text: "Just Arrived",
              gradient: "from-primary-50 via-primary-100 to-primary-50",
            }}
            title={{
              italic: "Latest",
              bold: "Products",
            }}
            description="Discover our newest arrivals and trending items"
          />

          {/* Carousel with Side Navigation */}
          <div className="relative group/carousel">
            <div className="hidden md:block">
              <NavigationButton
                variant="primary"
                direction="left"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="absolute left-0 top-[40%] -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110 shadow-xl bg-red-600 text-white border-red-500 hover:bg-red-700"
              />
              <NavigationButton
                variant="primary"
                direction="right"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="absolute right-0 top-[40%] -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110 shadow-xl bg-red-600 text-white border-red-500 hover:bg-red-700"
              />
            </div>

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth"
            >
              {products.map((product) => (
                <div key={product.id} className="shrink-0 w-[280px]">
                  <ProductCard product={product} layout="vertical" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Skeleton loader for LatestProductsCarousel component
 * Shows horizontal scroll layout with multiple product card placeholders
 */
export function LatestProductsCarouselSkeleton() {
  return (
    <Section
      spacing="md"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <SkeletonBlock className="w-4 h-4 rounded-lg bg-red-600/10" />
              <SkeletonBlock className="h-4 w-32 rounded-lg" />
            </div>
            <SkeletonBlock className="h-10 w-64 sm:w-80 mx-auto md:mx-0 rounded-lg" />
            <SkeletonBlock className="h-5 w-full max-w-md mx-auto md:mx-0 rounded-lg" />
          </div>

          {/* Carousel skeleton */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="shrink-0 w-[280px]">
                <div className="bg-white rounded-lg shadow-lg border border-warm-gray-200 overflow-hidden">
                  {/* Image */}
                  <SkeletonBlock className="aspect-square" />

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <SkeletonBlock className="h-5 w-full rounded" />
                    <SkeletonBlock className="h-4 w-3/4 rounded" />
                    <div className="flex items-center justify-between">
                      <SkeletonBlock className="h-6 w-16 rounded" />
                      <SkeletonBlock className="h-8 w-8 rounded" />
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
