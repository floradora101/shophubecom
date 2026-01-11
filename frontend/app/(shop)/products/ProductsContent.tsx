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
import { Filter, ChevronRight, ChevronDown } from "lucide-react";
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
import { Pagination } from "./components/Pagination";
import { cn } from "@/lib/utils/cn";
import {
  COMPACT_CATEGORY_ICONS,
  SORT_OPTIONS,
  ITEMS_PER_PAGE,
} from "./catalog.constants";
import { CategoryCarousel } from "./components/CategoryCarousel";

interface UpdateFilters {
  setCategory: (categorySlug: string | null) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setSortBy: (sortBy: CanonicalFilters["sortBy"]) => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  setMinRating: (minRating: number | null) => void;
  setBrands: (brands: string[] | null) => void;
  setPage: (page: number) => void;
}
import { FiltersSidebarSkeleton } from "@/lib/ui/loading";

// CategoryCarousel moved to components/CategoryCarousel.tsx

// SORT_OPTIONS moved to catalog.constants.ts

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

  // CategoryCarousel moved to separate component - no longer needs scroll handling

  // Performance guard removed - load immediately for better UX
  const hasInteracted = true;

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

  // Track user interaction (scroll, click, etc.) - logic removed
  useEffect(() => {
    // No-op - everything loads immediately now
  }, []);

  // Simulate loading states for demonstration
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError] = useState(false);
  const [gridLayout, setGridLayout] = useState<"cozy" | "compact">("cozy");

  // Set loading to false immediately when filters change
  useEffect(() => {
    // Just a tiny delay to show the "updating" state if needed, or keep it false
    setProductsLoading(false);
  }, [filters]);

  const isLoading = productsLoading;
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  // Paginate filtered products
  // ITEMS_PER_PAGE moved to catalog.constants.ts
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

  // Get current category title for carousel
  const currentCategoryTitle = useMemo(() => {
    if (isCategoryPage && currentCategory) {
      return {
        italic: "Category",
        bold: currentCategory.name,
      };
    }
    return {
      italic: "Advanced",
      bold: "Hardware",
    };
  }, [isCategoryPage, currentCategory]);

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
          filters={filters}
          searchParams={searchParams}
          router={router}
          basePath={basePath}
          updateSearchParams={updateSearchParams}
          updateFilters={updateFilters}
          title={currentCategoryTitle}
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

            {/* Sort and Grid Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-warm-gray-100 p-1 rounded-lg mr-2">
                <button
                  onClick={() => setGridLayout("cozy")}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    gridLayout === "cozy"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-warm-gray-500 hover:text-warm-gray-900"
                  )}
                  title="Cozy View"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setGridLayout("compact")}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    gridLayout === "compact"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-warm-gray-500 hover:text-warm-gray-900"
                  )}
                  title="Compact View"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM11 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM18 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM4 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM11 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM18 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM4 19a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM11 19a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM18 19a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"
                    />
                  </svg>
                </button>
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
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
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
                  layout={gridLayout}
                />
              </div>

              {/* Professional Pagination */}
              <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700 delay-700">
                <Pagination
                  currentPage={filters.page}
                  totalPages={safeTotalPages}
                  onPageChange={updateFilters.setPage}
                  isLoading={isLoading}
                />
              </div>
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
