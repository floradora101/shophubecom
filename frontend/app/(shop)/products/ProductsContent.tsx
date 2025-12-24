/**
 * Shared Products Content Component
 *
 * Used by both /products and /products/category/[category] routes.
 * Handles category from route params or query params.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronDown, Filter, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/SectionTitle";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isCategoryPage = pathname?.startsWith("/products/category/");

  // Sort dropdown state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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

  // Use mock categories
  const categories = useMemo(
    () => mockCategories.map(mockCategoryToCategory),
    []
  );

  // Normalize mock products once to avoid repeated conversions
  const allMockProducts = useMemo(
    () => mockProducts.map(mockProductToProduct),
    []
  );

  // Build category tree helpers for filtering
  const categoryTreeHelpers = useMemo((): CategoryTreeHelpers => {
    const categoryIdMap = new Map<string, string>();
    const childrenByParentId = new Map<string, string[]>();

    categories.forEach((cat) => {
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
  }, [categories]);

  // Filter and sort products using pure function
  const filteredProducts = useMemo(
    () => filterSortProducts(allMockProducts, filters, categoryTreeHelpers),
    [allMockProducts, filters, categoryTreeHelpers]
  );

  // Mock loading states
  const productsLoading = false;
  const productsError = false;

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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 relative">
      {/* Enhanced Background layers - 2026 depth */}
      <div className="fixed inset-0 bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.08),transparent_70%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.06),transparent_70%)] -z-10" />
      {/* Subtle animated gradient overlay */}
      <div
        className="fixed inset-0 bg-linear-to-br from-transparent via-primary-50/20 to-transparent opacity-30 animate-pulse -z-10"
        style={{ animationDuration: "8s" }}
      />

      <div className="space-y-8 relative z-0">
        {/* Breadcrumb */}
        <div className="border-b border-slate-200/60">
          <Container className="py-4">
            <nav
              className="flex items-center gap-2 text-sm"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              {currentCategory ? (
                <>
                  <Link
                    href="/products"
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Products
                  </Link>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-900 font-medium truncate max-w-xs">
                    {currentCategory.name}
                  </span>
                </>
              ) : (
                <span className="text-slate-900 font-medium truncate max-w-xs">
                  Products
                </span>
              )}
            </nav>
          </Container>
        </div>

        {/* Immersive Main Content - 2026 Style */}
        <Container className="pt-6 pb-10 md:pt-8 md:pb-16">
          {/* Results Count and Controls - Above Grid */}
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* Results Count */}
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {products.length}
              </span>
              <span className="mx-1">of</span>
              <span className="text-slate-700">{totalResults}</span>
              <span className="ml-1">products</span>
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
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
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        filters.sortBy === option.value
                          ? "text-primary-700 font-medium bg-primary-50"
                          : "text-slate-700 hover:bg-slate-50"
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
              <div className="sticky top-8 space-y-6 animate-in slide-in-from-left-4 duration-700 delay-200">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-warm-gray-200/50 hover:shadow-xl transition-all duration-500 group">
                  <div className="mb-6">
                    <SectionTitle
                      badgeText="Refine Your Search"
                      title=""
                      subtitle="Find exactly what you're looking for"
                      icon={Star}
                      showHearts={false}
                      className="text-left"
                      badgeClassName="justify-start"
                    />
                  </div>
                  <FiltersSidebar
                    categories={categories}
                    selectedCategory={filters.category}
                    onCategoryChange={updateFilters.setCategory}
                    priceRange={priceRange}
                    onPriceRangeChange={updateFilters.setPriceRange}
                    inStockOnly={filters.inStockOnly}
                    onInStockChange={updateFilters.setInStockOnly}
                  />
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary-50/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
              </div>
            </aside>

            {/* Enhanced Products Content */}
            <div className="flex-1 min-w-0 space-y-8">
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
                <div className="animate-in slide-in-from-bottom-4 duration-500 bg-red-50/80 backdrop-blur-sm rounded-2xl p-8 border border-red-200/50 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                />
              </div>

              {/* Premium Pagination with Smart Interactions */}
              {safeTotalPages > 1 && (
                <div className="mt-12 animate-in slide-in-from-bottom-4 duration-700 delay-700">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-warm-gray-200/40">
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
                          <span className="text-sm font-medium text-primary-700">
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
            </div>
          </div>
        </Container>
      </div>

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
      />
    </div>
  );
}
