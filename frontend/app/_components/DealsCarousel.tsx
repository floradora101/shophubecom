// LatestProductsCarousel: Horizontal scroll of latest products using ProductCard
"use client";

import { useRef, useMemo } from "react";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { NavigationButton } from "@/components/ui/navigation-button";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
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

// Skeleton component extracted to separate server component file
// See: app/_components/LatestProductsCarouselSkeleton.tsx
