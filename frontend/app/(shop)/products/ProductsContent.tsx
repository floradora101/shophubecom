/**
 * Shared Products Content Component
 *
 * Used by both /products and /products/category/[category] routes.
 * Handles category from route params or query params.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useProductFilters } from "./hooks/useProductFilters";
import { useFilterUpdates } from "./hooks/useFilterUpdates";
import { useCategoryTree } from "./hooks/useCategoryTree";
import { useFilterHelpers } from "./hooks/useFilterHelpers";
import { useProductsQuery } from "@/features/products/queries";
import { filtersToApiParams } from "@/features/products/utils/filters";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import {
  updateSearchParams,
  type CanonicalFilters,
} from "@/features/products/utils/filters";
import { FiltersSidebar } from "./components/FiltersSidebar";
import { FiltersDrawer } from "./components/FiltersDrawer";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { ProductsGrid } from "./components/ProductsGrid";
import { Pagination } from "@/components/ui/pagination";
import { ProductResultsHeader } from "./components/ProductResultsHeader";
import { ProductsBreadcrumb } from "./components/ProductsBreadcrumb";
import { cn } from "@/lib/utils/cn";
import { ITEMS_PER_PAGE } from "./catalog.constants";
import { CategoryCarousel } from "./components/CategoryCarousel";
import { extractErrorInfo } from "@/lib/api/error-handler";
import { productRoutes } from "@/lib/routes";

import { FiltersSidebarSkeleton } from "@/lib/ui/loading";

interface ProductsContentProps {
  categorySlug?: string | null;
}

export function ProductsContent({ categorySlug }: ProductsContentProps) {
  // All hooks must be declared first, in order
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Performance guard removed - load immediately for better UX
  const hasInteracted = true;


  // Extract category tree logic to custom hook
  const { categories, categoryTreeHelpers } = useCategoryTree({
    hasInteracted,
    categorySlug,
  });

  // Extract filter-related logic to custom hook
  const {
    filters,
    basePath,
    isCategoryPage,
    isSearchResultsPage,
    isDealsPage,
    currentCategory,
    currentCategoryTitle,
  } = useProductFilters({
    categorySlug,
    categories,
  });


  // Extract filter update handlers to custom hook
  const updateFilters = useFilterUpdates({
    basePath,
    searchParams,
    router,
  });


  // Convert filters to API params format
  const apiParams = useMemo(() => {
    return filtersToApiParams(filters, categoryTreeHelpers.categoryIdMap, {
      limit: ITEMS_PER_PAGE,
    });
  }, [filters, categoryTreeHelpers.categoryIdMap]);

  // Fetch products from API
  const {
    data: productsData,
    isLoading,
    error: productsError,
  } = useProductsQuery(apiParams);

  const products = productsData?.data ?? [];
  const totalResults = productsData?.total ?? 0;
  const totalPages = productsData?.totalPages ?? 0;
  const filteredProducts = products; // For price range calculation, use same products

  const [gridLayout, setGridLayout] = useState<"cozy" | "compact" | "list">(
    "cozy"
  );
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);


  // Scroll to top of products grid when filters change (but not on pagination)
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    // If filters changed (not just page), scroll to top
    if (
      prevFilters.category !== filters.category ||
      prevFilters.search !== filters.search ||
      prevFilters.promotionId !== filters.promotionId ||
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


  // Extract filter helper functions to custom hook
  const { availableBrands, hasActiveFilters, priceRange } = useFilterHelpers({
    hasInteracted,
    filters,
    filteredProducts,
  });

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
      router.push(productRoutes.list());
      return;
    }
    if (filterType === "promotionId") {
      const newParams = updateSearchParams(searchParams, { promotionId: null, page: 1 });
      router.push(`${basePath}?${newParams.toString()}`);
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

  // Handle clear all filters: reset to products list and clear all filter params
  const handleClearAll = () => {
    const newParams = updateSearchParams(searchParams, {
      page: 1,
      search: null,
      promotionId: null,
      minPrice: null,
      maxPrice: null,
      sortBy: "latest",
      inStockOnly: false,
      minRating: null,
      brands: null,
    });
    const targetPath = isCategoryPage ? productRoutes.list() : basePath;
    router.push(`${targetPath}?${newParams.toString()}`);
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
        <ProductsBreadcrumb
          isSearchResultsPage={isSearchResultsPage}
          isDealsPage={isDealsPage}
          currentCategory={currentCategory}
          categories={categories}
        />

        {/* Immersive Main Content - 2026 Style */}
        <Container size="full" className="pt-3 pb-10 md:pt-4 md:pb-16">
          {/* Results Count and Controls */}
          <ProductResultsHeader
            totalResults={totalResults}
            currentPageResults={products.length}
            searchTerm={filters.search}
            currentSort={filters.sortBy}
            onSortChange={updateFilters.setSortBy}
            gridLayout={gridLayout}
            onGridLayoutChange={setGridLayout}
            onOpenFilters={() => setIsFiltersDrawerOpen(true)}
          />

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
                      availableBrands={availableBrands}
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
                        Failed to load products
                      </p>
                      <p className="text-xs text-red-700 mb-4">
                        {extractErrorInfo(productsError).message}
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
                  totalItems={totalResults}
                  itemsPerPage={ITEMS_PER_PAGE}
                  itemName="products"
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
        availableBrands={availableBrands}
        onClearAll={handleClearAll}
        resultsCount={products.length}
      />
    </div>
  );
}
