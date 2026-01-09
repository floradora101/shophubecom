/**
 * Shared Products Content Component
 *
 * Used by both /products and /products/category/[category] routes.
 * Handles category from route params or query params.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
  ReadonlyURLSearchParams,
} from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Filter,
} from "lucide-react";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Stack } from "@/components/ui/stack";
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import {
  parseFiltersFromSearchParams,
  updateSearchParams,
  type CanonicalFilters,
} from "@/features/products/utils/filters";

type UpdateSearchParamsFn = (
  currentParams: ReadonlyURLSearchParams,
  updates: Partial<CanonicalFilters>
) => URLSearchParams;
import {
  filterSortProducts,
  paginateProducts,
  type CategoryTreeHelpers,
} from "@/features/products/utils/productFiltering";
import { FiltersSidebar } from "./components/FiltersSidebar";
import { FiltersDrawer } from "./components/FiltersDrawer";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { ProductsGrid } from "./components/ProductsGrid";
import { cn } from "@/lib/utils/cn";
import { COMPACT_CATEGORY_ICONS } from "./catalog.constants";

interface UpdateFilters {
  setCategory: (categorySlug: string | null) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setSortBy: (sortBy: CanonicalFilters["sortBy"]) => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  setMinRating: (minRating: number | null) => void;
  setBrands: (brands: string[] | null) => void;
  setPage: (page: number) => void;
}
import { FiltersSidebarSkeleton } from "@/components/ui/loading-spinner";


// Cyberpunk Category Icon Carousel Component
function CategoryCarousel({
  categories,
  scrollRef,
  isDragging,
  canScrollLeft,
  canScrollRight,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleKeyDown,
  scrollCarousel,
  filters,
  searchParams,
  router,
  basePath,
  updateSearchParams,
  updateFilters,
}: {
  categories: typeof COMPACT_CATEGORY_ICONS;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  scrollCarousel: (direction: "left" | "right") => void;
  filters: CanonicalFilters;
  searchParams: ReadonlyURLSearchParams;
  router: ReturnType<typeof useRouter>;
  basePath: string;
  updateSearchParams: UpdateSearchParamsFn;
  updateFilters: UpdateFilters;
}) {
  const handleCategoryClick = (categorySlug: string) => {
    updateFilters.setCategory(categorySlug);
  };

  const CategoryIcon = ({
    category,
  }: {
    category: (typeof COMPACT_CATEGORY_ICONS)[0];
  }) => {
    const IconComponent = category.icon;
    const isActive = filters.category === category.slug;

    return (
      <button
        onClick={() => handleCategoryClick(category.slug)}
        className="group flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:bg-white/10 min-h-[80px] sm:min-h-[100px]"
      >
        <div className="relative">
          {/* Multi-layer Glow Effects */}
          <div
            className={`absolute inset-0 ${category.iconBg} rounded-2xl blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 scale-125`}
          />
          <div
            className={`absolute inset-0 ${category.iconBg} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 scale-110`}
          />

          {/* Main Icon Container */}
          <div
            className={`relative p-3 sm:p-4 ${
              category.iconBg
            } rounded-2xl border border-gray-600/30 group-hover:border-gray-500/50 group-hover:scale-105 sm:group-hover:scale-110 transition-all duration-500 ${
              category.glowColor
            } group-hover:shadow-2xl ${
              isActive ? "ring-2 ring-primary-400/50 bg-primary-400/10" : ""
            }`}
          >
            <IconComponent
              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                category.accentColor
              } drop-shadow-lg transition-colors duration-300 ${
                isActive ? "text-primary-300" : ""
              }`}
            />

            {/* Animated Dots */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity delay-100" />

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-pulse opacity-0 group-hover:opacity-80" />
            </div>
          </div>
        </div>

        <h3
          className={`text-sm font-semibold text-center mt-3 transition-colors duration-300 ${
            isActive
              ? "text-primary-300"
              : "text-gray-300 group-hover:text-white"
          }`}
        >
          {category.name}
        </h3>
      </button>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Advanced Tech Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Floating Tech Elements */}
        <div className="absolute top-8 left-20 w-16 h-16 border border-primary-400/20 rounded-lg rotate-12 animate-pulse" />
        <div className="absolute top-16 right-32 w-12 h-12 border border-emerald-400/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-8 left-1/3 w-10 h-10 border border-violet-400/20 rounded-lg rotate-45 animate-pulse delay-500" />
        <div className="absolute top-1/2 right-20 w-8 h-8 border border-orange-400/20 rounded-full animate-pulse delay-1500" />

        {/* Data Flow Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-400/30 to-transparent animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-pulse delay-2000" />
      </div>

      <Container className="relative z-10 py-6">
        <div className="space-y-6">
          {/* Carousel Navigation */}
          <div className="relative max-w-7xl mx-auto">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollCarousel("left")}
              disabled={!canScrollLeft}
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-full shadow-xl border border-gray-700/50 flex items-center justify-center hover:bg-gray-700/80 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-primary-400 transition-colors" />
              <div className="absolute inset-0 bg-primary-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>

            <button
              onClick={() => scrollCarousel("right")}
              disabled={!canScrollRight}
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-full shadow-xl border border-gray-700/50 flex items-center justify-center hover:bg-gray-700/80 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Next categories"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-primary-400 transition-colors" />
              <div className="absolute inset-0 bg-primary-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>

            {/* Drag-based Horizontal Scroll Carousel */}
            <div className="overflow-hidden px-2 sm:px-6">
              <div
                ref={scrollRef}
                className={`flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide cursor-grab focus:outline-none ${
                  isDragging ? "cursor-grabbing select-none" : ""
                }`}
                style={{
                  scrollBehavior: isDragging ? "auto" : "smooth",
                  WebkitOverflowScrolling: "touch", // iOS momentum scrolling
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
                {categories.map((category, index) => (
                  <div
                    key={category.slug}
                    className="flex-shrink-0 w-20 sm:w-24 md:w-28 lg:w-32"
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    <CategoryIcon category={category} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Removed drag hint from small screens as requested */}

          {/* Bottom Tech Accent */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 md:gap-3 px-2 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md rounded-full border border-gray-600/30">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-400 rounded-full animate-pulse delay-200" />
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-violet-400 rounded-full animate-pulse delay-400" />
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-orange-400 rounded-full animate-pulse delay-600" />
              </div>
              <span className="text-gray-400 text-xs font-medium">
                Curated Excellence
              </span>
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-orange-400 rounded-full animate-pulse delay-600" />
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-violet-400 rounded-full animate-pulse delay-400" />
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-400 rounded-full animate-pulse delay-200" />
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Sort options for the dropdown
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
];

interface ProductsContentProps {
  categorySlug?: string | null;
}

export function ProductsContent({ categorySlug }: ProductsContentProps) {
  // All hooks must be declared first, in order
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Carousel state (removed for drag-based approach)

  // Responsive logic removed - drag carousel adapts naturally

  // Drag-based carousel navigation
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
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

  // Scroll state for navigation buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll state when scrolling occurs
  const updateScrollState = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    }
  }, []);

  // Listen for scroll events
  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", updateScrollState);
      // Initial check
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

  // Performance guard: delay expensive computations until user interacts
  // Initialize this FIRST before any other state to avoid "before initialization" errors
  const [hasInteractedState, setHasInteracted] = useState(false);
  // Use a const to ensure it's always available (no temporal dead zone issues)
  const hasInteracted = hasInteractedState;

  // Sort dropdown state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Derived values (non-hook computations)
  const isCategoryPage = pathname?.startsWith("/products/category/");
  const isSearchResultsPage = pathname?.startsWith("/search/results");

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSortOpen]);

  // Parse filters from URL (single source of truth)
  // For category pages, category comes from route param, not query param
  const filters = useMemo(() => {
    const baseFilters = parseFiltersFromSearchParams(searchParams);
    // Override category from route if we're on a category page
    if (isCategoryPage && categorySlug) {
      return { ...baseFilters, category: categorySlug };
    }
    // For regular products page, use category from query params (if any)
    return baseFilters;
  }, [searchParams, categorySlug, isCategoryPage]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ||
    SORT_OPTIONS[0].label;

  // Build the base path for navigation (either /products or /products/category/[slug])
  const basePath = useMemo(() => {
    if (isCategoryPage && categorySlug) {
      return `/products/category/${categorySlug}`;
    }
    return "/products";
  }, [isCategoryPage, categorySlug]);

  // Use mock categories - only compute when user has interacted
  const categories = useMemo(() => {
    if (!hasInteracted) return [];
    return mockCategories.map(mockCategoryToCategory);
  }, [hasInteracted]);

  // Normalize mock products once to avoid repeated conversions - only when user has interacted
  const allMockProducts = useMemo(() => {
    if (!hasInteracted) return [];
    return mockProducts.map(mockProductToProduct);
  }, [hasInteracted]);

  // Build category tree helpers for filtering - only when user has interacted
  const categoryTreeHelpers = useMemo((): CategoryTreeHelpers => {
    if (!hasInteracted) {
      return { categoryIdMap: new Map(), getDescendantIds: () => new Set() };
    }

    // Compute categories internally to avoid dependency issues
    const computedCategories = mockCategories.map(mockCategoryToCategory);
    const categoryIdMap = new Map<string, string>();
    const childrenByParentId = new Map<string, string[]>();

    computedCategories.forEach((cat) => {
      categoryIdMap.set(cat.slug, cat.id);
      if (cat.parentId) {
        childrenByParentId.set(cat.parentId, [
          ...(childrenByParentId.get(cat.parentId) ?? []),
          cat.id,
        ]);
      }
    });

    const getDescendantIds = (rootId: string): Set<string> => {
      const out = new Set<string>([rootId]);
      const stack = [rootId];

      while (stack.length) {
        const current = stack.pop()!;
        const kids = childrenByParentId.get(current) ?? [];
        for (const k of kids) {
          if (!out.has(k)) {
            out.add(k);
            stack.push(k);
          }
        }
      }
      return out;
    };

    return { categoryIdMap, getDescendantIds };
  }, [hasInteracted]);

  // Filter and sort products using pure function - only when user has interacted
  const filteredProducts = useMemo(() => {
    if (!hasInteracted) return [];
    return filterSortProducts(allMockProducts, filters, categoryTreeHelpers);
  }, [allMockProducts, filters, categoryTreeHelpers, hasInteracted]);

  // Track user interaction (scroll, click, etc.)
  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true);

    // Listen for user interactions that indicate they're ready to see content
    window.addEventListener("scroll", handleInteraction, {
      once: true,
      passive: true,
    });
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    // Auto-enable immediately

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Simulate loading states for demonstration
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError] = useState(false);

  // Set loading to false immediately when filters change - only when user has interacted
  useEffect(() => {
    if (!hasInteracted) return;

    setProductsLoading(false);
  }, [filters, hasInteracted]); // eslint-disable-line react-hooks/set-state-in-effect

  const isLoading = productsLoading;
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  // Paginate filtered products
  const ITEMS_PER_PAGE = 10;
  const paginationResult = useMemo(
    () => paginateProducts(filteredProducts, filters.page, ITEMS_PER_PAGE),
    [filteredProducts, filters.page]
  );

  const products = paginationResult.items;
  const totalResults = paginationResult.total;
  const totalPages = paginationResult.totalPages;

  // Update URL with filter changes
  const updateFilters = useMemo(
    () => ({
      setCategory: (categorySlug: string | null) => {
        // Preserve existing query params when switching category
        if (categorySlug) {
          // Going to category page - keep query params except remove category from query
          const newParams = updateSearchParams(searchParams, {
            page: 1, // Reset to page 1 when changing category
          });
          router.push(
            `/products/category/${categorySlug}?${newParams.toString()}`
          );
        } else {
          // Going to main products page - keep query params
          const newParams = updateSearchParams(searchParams, {
            page: 1, // Reset to page 1 when changing category
          });
          router.push(`/products?${newParams.toString()}`);
        }
      },

      setPriceRange: (range: { min: number; max: number }) => {
        const newParams = updateSearchParams(searchParams, {
          minPrice: range.min > 0 ? range.min : null,
          maxPrice: range.max < Number.MAX_SAFE_INTEGER ? range.max : null,
          page: 1, // Reset to page 1 when price range changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setSortBy: (sortBy: CanonicalFilters["sortBy"]) => {
        const newParams = updateSearchParams(searchParams, {
          sortBy,
          page: 1, // Reset to page 1 when sort changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setInStockOnly: (inStockOnly: boolean) => {
        const newParams = updateSearchParams(searchParams, {
          inStockOnly,
          page: 1, // Reset to page 1 when stock filter changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setMinRating: (minRating: number | null) => {
        const newParams = updateSearchParams(searchParams, {
          minRating,
          page: 1, // Reset to page 1 when rating filter changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setBrands: (brands: string[] | null) => {
        const newParams = updateSearchParams(searchParams, {
          brands,
          page: 1, // Reset to page 1 when brands filter changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setPage: (page: number) => {
        const newParams = updateSearchParams(searchParams, {
          page,
        });
        router.push(`${basePath}?${newParams.toString()}`, { scroll: false });
      },
    }),
    [searchParams, router, basePath]
  );

  // Scroll to top of products grid when filters change (but not on pagination)
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    // If filters changed (not just page), scroll to top
    if (
      prevFilters.category !== filters.category ||
      prevFilters.search !== filters.search ||
      prevFilters.minPrice !== filters.minPrice ||
      prevFilters.maxPrice !== filters.maxPrice ||
      prevFilters.inStockOnly !== filters.inStockOnly ||
      prevFilters.sortBy !== filters.sortBy
    ) {
      // Filter changed, scroll to top of products area
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevFiltersRef.current = filters;
  }, [filters]);

  // Get current category name for breadcrumb
  const currentCategory = categories.find((c) => c.slug === filters.category);

  // Get available brands from all products
  const getAvailableBrands = useMemo(() => {
    if (!hasInteracted) return [];
    const brandSet = new Set<string>();
    allMockProducts.forEach((product) => {
      if (product.brand) {
        brandSet.add(product.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [allMockProducts, hasInteracted]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStockOnly ||
      filters.minRating ||
      (filters.brands && filters.brands.length > 0) ||
      filters.sortBy !== "latest"
    );
  }, [filters]);

  // Calculate price range for filters from ALL filtered products (not just current page)
  const maxProductPrice = useMemo(
    () =>
      filteredProducts.length
        ? Math.max(...filteredProducts.map((p) => p.price))
        : 0,
    [filteredProducts]
  );

  const priceRange = useMemo(
    () => ({
      min: filters.minPrice ?? 0,
      max: filters.maxPrice ?? Math.max(maxProductPrice, 5000),
    }),
    [filters.minPrice, filters.maxPrice, maxProductPrice]
  );

  // Clamp page when it exceeds totalPages after filtering
  const safeTotalPages = Math.max(1, totalPages);
  const prevTotalPagesRef = useRef(totalPages);
  useEffect(() => {
    const prevTotalPages = prevTotalPagesRef.current;
    prevTotalPagesRef.current = totalPages;

    // Only clamp if totalPages decreased and current page exceeds it
    if (prevTotalPages > totalPages && filters.page > safeTotalPages) {
      const newParams = updateSearchParams(searchParams, {
        page: safeTotalPages,
      });
      router.replace(`${basePath}?${newParams.toString()}`, { scroll: false });
    }
  }, [
    totalPages,
    filters.page,
    searchParams,
    router,
    basePath,
    safeTotalPages,
  ]);

  // Handle removing individual filters
  const handleRemoveFilter = (filterType: keyof CanonicalFilters) => {
    if (filterType === "category") {
      // Navigate to products page (remove category)
      router.push("/products");
      return;
    }

    const updates: Partial<CanonicalFilters> = { page: 1 };

    if (filterType === "minPrice" || filterType === "maxPrice") {
      // Remove both price filters together
      updates.minPrice = null;
      updates.maxPrice = null;
    } else if (filterType === "page") {
      updates.page = 1;
    } else if (filterType === "sortBy") {
      updates.sortBy = "latest";
    } else if (filterType === "inStockOnly") {
      updates.inStockOnly = false;
    } else {
      // search
      updates[filterType] = null;
    }

    const newParams = updateSearchParams(searchParams, updates);
    router.push(`${basePath}?${newParams.toString()}`);
  };

  // Handle clear all filters
  const handleClearAll = () => {
    if (isCategoryPage && categorySlug) {
      router.push("/products");
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen relative">
      <Stack spacing="xs" className="relative z-0">
        {/* Cyberpunk Category Carousel - Top of Page */}
        <CategoryCarousel
          categories={COMPACT_CATEGORY_ICONS}
          scrollRef={scrollRef}
          isDragging={isDragging}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          handleKeyDown={handleKeyDown}
          scrollCarousel={scrollCarousel}
          filters={filters}
          searchParams={searchParams}
          router={router}
          basePath={basePath}
          updateSearchParams={updateSearchParams}
          updateFilters={updateFilters}
        />

        {/* Breadcrumb */}
        <div className="border-b border-border/60 bg-gray-50/30">
          <Container className="py-3">
            <nav
              className="flex items-center gap-2 text-sm"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="text-muted-fg hover:text-fg transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-fg" />
              {isSearchResultsPage ? (
                <>
                  <Link
                    href="/search"
                    className="text-muted-fg hover:text-fg transition-colors"
                  >
                    Search
                  </Link>
                  <ChevronRight className="h-4 w-4 text-muted-fg" />
                  <span className="text-fg font-medium truncate max-w-xs">
                    Results
                  </span>
                </>
              ) : currentCategory ? (
                <>
                  <Link
                    href="/products"
                    className="text-muted-fg hover:text-fg transition-colors"
                  >
                    Products
                  </Link>
                  <ChevronRight className="h-4 w-4 text-muted-fg" />
                  <span className="text-fg font-medium truncate max-w-xs">
                    {currentCategory.name}
                  </span>
                </>
              ) : (
                <span className="text-fg font-medium truncate max-w-xs">
                  Products
                </span>
              )}
            </nav>
          </Container>
        </div>

        {/* Immersive Main Content - 2026 Style */}
        <Container size="full" className="pt-3 pb-10 md:pt-4 md:pb-16">
          {/* Results Count and Controls */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Results Count */}
            <div className="text-sm text-muted-fg">
              <span className="font-semibold text-fg">{products.length}</span>
              <span className="mx-1">of</span>
              <span className="text-muted-fg">{totalResults}</span>
              <span className="ml-1">products</span>
              {filters.search && (
                <span className="ml-2 text-primary-600">
                  for &quot;{filters.search}&quot;
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="gap-2 w-full sm:w-auto justify-between sm:justify-center"
                aria-expanded={isSortOpen}
                aria-haspopup="true"
              >
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isSortOpen && "rotate-180 text-primary-600"
                  )}
                />
              </Button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-50">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilters.setSortBy(
                          option.value as CanonicalFilters["sortBy"]
                        );
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        filters.sortBy === option.value
                          ? "text-primary-600 font-medium bg-primary-50"
                          : "text-muted-fg hover:bg-red-50 hover:scale-105"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters Button (Mobile) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersDrawerOpen(true)}
              className="gap-2 lg:hidden"
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          <div className="flex gap-12 lg:gap-16">
            {/* Enhanced Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-8">
                <Stack
                  spacing="lg"
                  className="animate-in slide-in-from-left-4 duration-700 delay-200"
                >
                  {isLoading ? (
                    <FiltersSidebarSkeleton />
                  ) : (
                    <FiltersSidebar
                      categories={categories}
                      selectedCategory={filters.category}
                      onCategoryChange={updateFilters.setCategory}
                      priceRange={priceRange}
                      onPriceRangeChange={updateFilters.setPriceRange}
                      inStockOnly={filters.inStockOnly}
                      onInStockChange={updateFilters.setInStockOnly}
                      minRating={filters.minRating}
                      onMinRatingChange={updateFilters.setMinRating}
                      selectedBrands={filters.brands}
                      onBrandsChange={updateFilters.setBrands}
                      availableBrands={getAvailableBrands}
                    />
                  )}
                </Stack>
              </div>
            </aside>

            {/* Enhanced Products Content */}
            <Stack spacing="xl" className="flex-1 min-w-0">
              {/* Smart Active Filter Chips */}
              <div className="animate-in slide-in-from-right-4 duration-700 delay-300">
                <ActiveFilterChips
                  filters={filters}
                  categories={categories}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearAll}
                />
              </div>

              {/* Enhanced Error State with Micro-interactions */}
              {productsError && (
                <div className="animate-in slide-in-from-bottom-4 duration-500 bg-red-50/80 backdrop-blur-sm rounded-lg p-8 border border-red-200/50 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-2">
                        Something went wrong
                      </p>
                      <p className="text-xs text-red-700 mb-4">
                        We couldn&apos;t load the products. Please check your
                        connection and try again.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="text-red-700 border-red-300 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Products Grid with Progressive Loading */}
              <div className="animate-in fade-in duration-700 delay-500">
                <ProductsGrid
                  products={products}
                  isLoading={isLoading}
                  onClearFilters={handleClearAll}
                  searchTerm={filters.search}
                  hasActiveFilters={hasActiveFilters()}
                />
              </div>

              {/* Premium Pagination with Smart Interactions */}
              {safeTotalPages > 1 && (
                <div className="mt-12 animate-in slide-in-from-bottom-4 duration-700 delay-700">
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-warm-gray-200/40">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateFilters.setPage(Math.max(1, filters.page - 1))
                        }
                        disabled={filters.page === 1 || isLoading}
                        aria-label="Previous page"
                        className="rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </Button>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl">
                          <span className="text-sm font-medium text-primary-600">
                            Page {filters.page} of {safeTotalPages}
                          </span>
                          {isLoading && (
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateFilters.setPage(
                            Math.min(safeTotalPages, filters.page + 1)
                          )
                        }
                        disabled={filters.page === safeTotalPages || isLoading}
                        aria-label="Next page"
                        className="rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                      >
                        Next
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Stack>
          </div>
        </Container>
      </Stack>

      {/* Mobile Filters Drawer */}
      <FiltersDrawer
        open={isFiltersDrawerOpen}
        onOpenChange={setIsFiltersDrawerOpen}
        categories={categories}
        selectedCategory={filters.category}
        onCategoryChange={updateFilters.setCategory}
        priceRange={priceRange}
        onPriceRangeChange={updateFilters.setPriceRange}
        inStockOnly={filters.inStockOnly}
        onInStockChange={updateFilters.setInStockOnly}
        minRating={filters.minRating}
        onMinRatingChange={updateFilters.setMinRating}
        selectedBrands={filters.brands}
        onBrandsChange={updateFilters.setBrands}
        availableBrands={getAvailableBrands}
      />
    </div>
  );
}
