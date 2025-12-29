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
import { mockProducts, mockProductToProduct } from "@/lib/mock-data/mock-data";

export function LatestProductsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Query latest products from mock data (take first 8 products to simulate latest)
  const latestProducts = useMemo(() => {
    return mockProducts.slice(0, 8).map(mockProductToProduct);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Early return if no latest products
  if (latestProducts.length === 0) {
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
              gradient: "from-blue-100 via-primary-100 to-blue-100",
            }}
            title={{
              italic: "Latest",
              bold: "Products",
            }}
            description="Discover our newest arrivals and trending items"
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

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth"
          >
            {latestProducts.map((product) => (
              <div key={product.id} className="shrink-0 w-[280px]">
                <ProductCard product={product} layout="vertical" />
              </div>
            ))}
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <SkeletonBlock className="w-5 h-5 rounded" />
              <SkeletonBlock className="h-6 w-32 rounded" />
            </div>
            <SkeletonBlock className="h-10 w-80 mx-auto rounded mb-2" />
            <SkeletonBlock className="h-5 w-64 mx-auto rounded" />
          </div>

          {/* Navigation arrows skeleton */}
          <div className="flex justify-between items-center">
            <SkeletonBlock className="w-12 h-12 rounded-full" />
            <SkeletonBlock className="w-12 h-12 rounded-full" />
          </div>

          {/* Carousel skeleton */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="shrink-0 w-[280px]">
                <div className="bg-white rounded-2xl shadow-lg border border-warm-gray-200 overflow-hidden">
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
