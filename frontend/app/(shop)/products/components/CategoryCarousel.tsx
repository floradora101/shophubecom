"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPACT_CATEGORY_ICONS } from "../catalog.constants";
import type { CanonicalFilters } from "@/features/products/utils/filters";

interface CategoryCarouselProps {
  filters: CanonicalFilters;
  searchParams: URLSearchParams;
  router: any; // Next.js router
  basePath: string;
  updateSearchParams: (params: URLSearchParams, updates: Partial<CanonicalFilters>) => URLSearchParams;
  updateFilters: {
    setCategory: (categorySlug: string | null) => void;
  };
}

interface CategoryIconProps {
  category: typeof COMPACT_CATEGORY_ICONS[0];
  isActive: boolean;
  onClick: (categorySlug: string) => void;
}

function CategoryIcon({ category, isActive, onClick }: CategoryIconProps) {
  const IconComponent = category.icon;

  return (
    <button
      onClick={() => onClick(category.slug)}
      className={`group relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
        isActive
          ? "border-primary-400 bg-gradient-to-br from-primary-500/20 to-primary-600/10 shadow-lg shadow-primary-500/25 scale-105"
          : "border-border hover:border-primary-300 bg-white/5 hover:bg-white/10 hover:shadow-md hover:scale-102"
      }`}
      aria-label={`Filter by ${category.name}`}
    >
      {/* Glow effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-primary-400/20 blur-sm -z-10" />
      )}

      <div className="flex flex-col items-center justify-center h-full p-2">
        {/* Icon */}
        <div className={`relative mb-1 ${category.iconBg} p-2 rounded-lg transition-all duration-300 ${
          isActive ? "scale-110" : "group-hover:scale-105"
        }`}>
          <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${category.accentColor} transition-colors duration-300 ${
            isActive ? "drop-shadow-lg" : ""
          }`} />
          {/* Icon glow */}
          {isActive && (
            <div className="absolute inset-0 rounded-lg bg-primary-400/30 blur-sm -z-10" />
          )}
        </div>

        {/* Label */}
        <span className={`text-xs font-medium transition-colors duration-300 ${
          isActive ? "text-primary-300" : "text-gray-300 group-hover:text-white"
        }`}>
          {category.name}
        </span>
      </div>
    </button>
  );
}

export function CategoryCarousel({
  filters,
  searchParams,
  router,
  basePath,
  updateSearchParams,
  updateFilters,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startPos) * 2; // Scroll speed multiplier
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartPos(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startPos) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newPosition =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  const updateScrollState = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", updateScrollState);
      updateScrollState(); // Initial check
      return () => element.removeEventListener("scroll", updateScrollState);
    }
  }, [updateScrollState]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollCarousel("left");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollCarousel("right");
      }
    },
    []
  );

  const handleCategoryClick = (categorySlug: string) => {
    updateFilters.setCategory(categorySlug);
  };

  return (
    <div className="relative">
      {/* Navigation buttons */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
          onClick={() => scrollCarousel("left")}
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
          onClick={() => scrollCarousel("right")}
          aria-label="Scroll categories right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={`flex gap-3 overflow-x-auto scrollbar-hide pb-2 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Product categories"
      >
        {COMPACT_CATEGORY_ICONS.map((category) => (
          <CategoryIcon
            key={category.slug}
            category={category}
            isActive={filters.category === category.slug}
            onClick={handleCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}
