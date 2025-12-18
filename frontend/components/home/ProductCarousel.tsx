// Reusable carousel of featured products.
"use client";

import { useRef, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types/product.types";

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  showViewAll?: boolean;
  className?: string;
}

export function ProductCarousel({
  products,
  title = "Featured Products",
  showViewAll = true,
  className = "",
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            {/* Navigation Arrows */}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="p-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="p-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
            {showViewAll && (
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors ml-2"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={product} />
            </div>
          ))}
          {/* End spacer for proper padding on last item */}
          <div className="shrink-0 w-1" />
        </div>

        {/* Mobile View All */}
        {showViewAll && (
          <div className="mt-5 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              View All Products
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
