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
    <Section spacing="md" className="relative overflow-hidden bg-transparent">
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
