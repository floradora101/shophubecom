"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { NavigationButton } from "@/components/ui/navigation-button";
import { Container } from "@/components/ui/container";
import { COMPACT_CATEGORY_ICONS } from "../catalog.constants";
import type { CanonicalFilters } from "@/features/products/utils/filters";
import { cn } from "@/lib/utils/cn";
import { ReadonlyURLSearchParams } from "next/navigation";

type UpdateSearchParamsFn = (
  currentParams: ReadonlyURLSearchParams,
  updates: Partial<CanonicalFilters>
) => URLSearchParams;

interface UpdateFilters {
  setCategory: (categorySlug: string | null) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setSortBy: (sortBy: CanonicalFilters["sortBy"]) => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  setMinRating: (minRating: number | null) => void;
  setBrands: (brands: string[] | null) => void;
  setPage: (page: number) => void;
}

interface CategoryCarouselProps {
  filters: CanonicalFilters;
  searchParams: ReadonlyURLSearchParams;
  router: ReturnType<typeof useRouter>;
  basePath: string;
  updateSearchParams: UpdateSearchParamsFn;
  updateFilters: UpdateFilters;
  title?: {
    italic: string;
    bold: string;
  };
}

interface CategoryIconProps {
  category: (typeof COMPACT_CATEGORY_ICONS)[0];
  filters: CanonicalFilters;
  onCategoryClick: (categorySlug: string) => void;
}

function CategoryIcon({
  category,
  filters,
  onCategoryClick,
}: CategoryIconProps) {
  const IconComponent = category.icon;
  const isActive = filters.category === category.slug;

  return (
    <button
      onClick={() => onCategoryClick(category.slug)}
      className={cn(
        "group flex flex-col items-center p-4 sm:p-5 rounded-lg transition-all duration-500 min-h-[100px] sm:min-h-[120px] w-full relative overflow-hidden",
        isActive
          ? "bg-white shadow-2xl shadow-primary-500/10 border-primary-200"
          : "bg-white/40 backdrop-blur-sm border-transparent hover:bg-white hover:shadow-xl hover:shadow-warm-gray-200/50"
      )}
    >
      {/* Active Indicator Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-linear-to-br from-primary-50/50 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Modern Icon Container */}
        <div
          className={cn(
            "relative p-4 sm:p-5 rounded-lg transition-all duration-500 transform group-hover:scale-110",
            isActive
              ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 rotate-3"
              : "bg-warm-gray-100 text-warm-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:-rotate-3"
          )}
        >
          <IconComponent
            className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-500",
              isActive && "scale-110"
            )}
          />
        </div>

        {/* Animated Sparkle for Active */}
        {isActive && (
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-primary-400 animate-pulse" />
        )}
      </div>

      <h3
        className={cn(
          "text-xs sm:text-sm font-bold text-center mt-4 transition-colors duration-300 tracking-tight leading-none",
          isActive ? "text-primary-900" : "text-warm-gray-500 group-hover:text-warm-gray-900"
        )}
      >
        {category.name}
      </h3>

      {/* Active Bottom Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-primary-600 transition-all duration-500 rounded-t-full",
          isActive ? "w-12 opacity-100" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-50"
        )}
      />
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
  title = {
    italic: "Advanced",
    bold: "Hardware",
  },
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
    const walk = (x - startPos) * 2;
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
        left: Math.max(
          0,
          Math.min(
            newPosition,
            scrollRef.current.scrollWidth - scrollRef.current.clientWidth
          )
        ),
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
      updateScrollState();
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
    [scrollCarousel]
  );

  const handleCategoryClick = (categorySlug: string) => {
    // If clicking the same category, clear the filter (toggle behavior)
    if (filters.category === categorySlug) {
      updateFilters.setCategory(null);
    } else {
      updateFilters.setCategory(categorySlug);
    }
  };

  return (
    <div className="relative bg-linear-to-b from-warm-gray-50/80 to-transparent border-b border-warm-gray-100 overflow-hidden">
      {/* Boutique Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-warm-gray-200/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <Container className="relative z-10 py-10">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 sm:px-0">
            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 border border-white/20 shadow-lg text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3 text-white" />
                <span>Explore Tech Ecosystem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-warm-gray-900 tracking-tight">
                {title.italic} <span className="italic font-normal text-primary-600">{title.bold}</span>
              </h2>
            </div>

            {/* Navigation Buttons */}
            <div className="hidden sm:flex gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
              <NavigationButton
                direction="left"
                variant="secondary"
                onClick={() => scrollCarousel("left")}
                aria-label="Previous categories"
                className={cn("h-12 w-12", !canScrollLeft && "opacity-50 cursor-not-allowed pointer-events-none")}
              />
              <NavigationButton
                direction="right"
                variant="secondary"
                onClick={() => scrollCarousel("right")}
                aria-label="Next categories"
                className={cn("h-12 w-12", !canScrollRight && "opacity-50 cursor-not-allowed pointer-events-none")}
              />
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className="relative">
            {/* Drag-based Horizontal Scroll Carousel */}
            <div className="overflow-visible px-2">
              <div
                ref={scrollRef}
                className={cn(
                  "flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide cursor-grab focus:outline-none py-4",
                  isDragging && "cursor-grabbing select-none"
                )}
                style={{
                  scrollBehavior: isDragging ? "auto" : "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
                tabIndex={0}
                role="region"
                aria-label="Category carousel - drag to scroll"
                onKeyDown={handleKeyDown}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {COMPACT_CATEGORY_ICONS.map((category, index) => (
                  <div
                    key={category.slug}
                    className="flex-shrink-0 w-[110px] sm:w-[140px] md:w-[160px]"
                    style={{
                      animation: `fade-in 0.7s ease-out ${index * 100}ms both, slide-in-from-bottom-4 0.7s ease-out ${index * 100}ms both`,
                    }}
                  >
                    <CategoryIcon
                      category={category}
                      filters={filters}
                      onCategoryClick={handleCategoryClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
