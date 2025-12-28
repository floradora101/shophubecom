// LatestProductsCarousel: Horizontal scroll of latest products using ProductCard
"use client";

import { useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
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
                <button
                  onClick={() => scroll("left")}
                  className="p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-primary-600" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-primary-600" />
                </button>
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
                <ProductCard product={product} />
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
              <div className="animate-shimmer w-5 h-5 rounded bg-current" />
              <div className="animate-shimmer h-6 w-32 rounded bg-current" />
            </div>
            <div className="animate-shimmer h-10 w-80 mx-auto rounded bg-current mb-2" />
            <div className="animate-shimmer h-5 w-64 mx-auto rounded bg-current" />
          </div>

          {/* Navigation arrows skeleton */}
          <div className="flex justify-between items-center">
            <div className="animate-shimmer w-12 h-12 rounded-full bg-current" />
            <div className="animate-shimmer w-12 h-12 rounded-full bg-current" />
          </div>

          {/* Carousel skeleton */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="shrink-0 w-[280px]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-warm-gray-200 overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square animate-shimmer bg-current" />

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="animate-shimmer h-5 w-full rounded bg-current" />
                    <div className="animate-shimmer h-4 w-3/4 rounded bg-current" />
                    <div className="flex items-center justify-between">
                      <div className="animate-shimmer h-6 w-16 rounded bg-current" />
                      <div className="animate-shimmer h-8 w-8 rounded bg-current" />
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
