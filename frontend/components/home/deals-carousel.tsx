// DealsCarousel: Horizontal scroll of products on sale using ProductCard
"use client";

import { useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/features/products/components/ProductCard";
import { SectionHeader } from "./shared/section-header";
import { mockProducts, mockProductToProduct } from "@/lib/mock-data/mock-data";

export function DealsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Query products that are on sale from mock data
  const dealProducts = useMemo(() => {
    return mockProducts
      .filter((product) => product.isOnSale)
      .map(mockProductToProduct);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Early return if no deal products
  if (dealProducts.length === 0) {
    return null;
  }

  return (
    <Section spacing="md" className="relative overflow-hidden bg-transparent">
      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <SectionHeader
            badge={{
              icon: Sparkles,
              text: "Limited Time Offers",
              gradient: "from-orange-100 via-primary-100 to-orange-100",
            }}
            title={{
              italic: "Special",
              bold: "Deals",
            }}
            description="Exclusive offers you won't want to miss"
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
            {dealProducts.map((product) => (
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
