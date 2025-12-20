/**
 * Product Catalog Listing Page
 *
 * This page implements URL-based filtering where the URL is the single source of truth.
 * All filters are stored in URL search params for shareability and correctness.
 *
 * FILTERING ARCHITECTURE:
 *
 * 1. URL as Source of Truth:
 *    - All filters (category, search, price, sort, inStockOnly) are in URL
 *    - No client-side filtering after server pagination
 *    - No Zustand store for filters
 *    - Browser back/forward navigation works correctly
 *
 * 2. Server-Side Filtering:
 *    - All filters applied on backend BEFORE pagination
 *    - inStockOnly filter uses effectiveStock > 0
 *    - Total count reflects filtered results
 *
 * 3. Query Parameter Building:
 *    - Debounced search (300ms) updates URL and resets page=1
 *    - Price range uses Apply button; updates URL and resets page=1
 *    - Sort change updates URL and resets page=1
 *    - Pagination updates only page in URL
 *
 * 4. React Query:
 *    - Query key includes all backend-relevant params (canonicalized)
 *    - Proper cache invalidation on filter changes
 *
 * @see frontend/lib/utils/filters.ts - URL filter parsing/updating utilities
 * @see frontend/lib/queries/products.ts - React Query integration
 */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronDown, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import { useCategoriesQuery } from "@/features/categories/queries";
import { useProductsQuery } from "@/features/products/queries";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";
import {
  parseFiltersFromSearchParams,
  updateSearchParams,
  filtersToApiParams,
  type CanonicalFilters,
} from "@/features/products/utils/filters";

const SORT_OPTIONS = [
  { value: "latest", label: "Sort by latest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "name", label: "Sort by name" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse filters from URL (single source of truth)
  const filters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  // Debounce search input to avoid excessive API calls while typing
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debouncedSearch = useDebouncedValue(localSearch, 300);

  // Sync local search with URL search
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newParams = updateSearchParams(searchParams, {
        search: debouncedSearch || null,
        page: 1, // Reset to page 1 when search changes
      });
      router.replace(`/products?${newParams.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, filters.search, searchParams, router]);

  // Fetch categories
  const { data: categoriesData } = useCategoriesQuery();
  const categories = useMemo(
    () => (Array.isArray(categoriesData) ? categoriesData : []),
    [categoriesData]
  );

  // Build category slug -> ID map
  const categoryIdMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      map.set(cat.slug, cat.id);
    });
    return map;
  }, [categories]);

  // Convert filters to API params
  const apiParams = useMemo(
    () => filtersToApiParams(filters, categoryIdMap),
    [filters, categoryIdMap]
  );

  // Fetch products with server-side filtering
  const {
    data: productsResult,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorDetails,
  } = useProductsQuery(apiParams);

  const products = useMemo(() => productsResult?.data ?? [], [productsResult]);
  const totalPages = useMemo(
    () => productsResult?.totalPages ?? 1,
    [productsResult]
  );
  const totalResults = productsResult?.total ?? 0;

  const isLoading = productsLoading;
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Update URL with filter changes
  const updateFilters = useMemo(
    () => ({
      setCategory: (category: string | null) => {
        const newParams = updateSearchParams(searchParams, {
          category,
          page: 1, // Reset to page 1 when category changes
        });
        router.push(`/products?${newParams.toString()}`);
      },

      setSearch: (search: string) => {
        setLocalSearch(search);
        // Debounce will handle URL update
      },

      setPriceRange: (range: { min: number; max: number }) => {
        const newParams = updateSearchParams(searchParams, {
          minPrice: range.min > 0 ? range.min : null,
          maxPrice: range.max < Number.MAX_SAFE_INTEGER ? range.max : null,
          page: 1, // Reset to page 1 when price range changes
        });
        router.push(`/products?${newParams.toString()}`);
      },

      setSortBy: (sortBy: CanonicalFilters["sortBy"]) => {
        const newParams = updateSearchParams(searchParams, {
          sortBy,
          page: 1, // Reset to page 1 when sort changes
        });
        router.push(`/products?${newParams.toString()}`);
      },

      setInStockOnly: (inStockOnly: boolean) => {
        const newParams = updateSearchParams(searchParams, {
          inStockOnly,
          page: 1, // Reset to page 1 when stock filter changes
        });
        router.push(`/products?${newParams.toString()}`);
      },

      setPage: (page: number) => {
        const newParams = updateSearchParams(searchParams, {
          page,
        });
        router.push(`/products?${newParams.toString()}`);
      },
    }),
    [searchParams, router]
  );

  // Get current category name for breadcrumb
  const currentCategory = categories.find((c) => c.slug === filters.category);

  // Calculate price range for filters (from products or default)
  const maxProductPrice = useMemo(
    () => (products.length ? Math.max(...products.map((p) => p.price)) : 0),
    [products]
  );

  const priceRange = useMemo(
    () => ({
      min: filters.minPrice ?? 0,
      max: filters.maxPrice ?? Math.max(maxProductPrice, 5000),
    }),
    [filters.minPrice, filters.maxPrice, maxProductPrice]
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb & Sort Bar */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  HOME
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  PRODUCTS
                </Link>
                {currentCategory && (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-semibold uppercase">
                      {currentCategory.name}
                    </span>
                  </>
                )}
                {filters.search && (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-semibold">
                      Search: &quot;{filters.search}&quot;
                    </span>
                  </>
                )}
              </nav>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isSortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFilters.setSortBy(
                            option.value as CanonicalFilters["sortBy"]
                          );
                          setIsSortOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          filters.sortBy === option.value
                            ? "text-primary-500 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <ProductFilters
                categories={categories}
                selectedCategory={filters.category}
                onCategoryChange={updateFilters.setCategory}
                showInStockOnly={filters.inStockOnly}
                onStockFilterChange={updateFilters.setInStockOnly}
                priceRange={priceRange}
                onPriceRangeChange={updateFilters.setPriceRange}
              />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">{products.length}</span> of{" "}
                  <span className="font-semibold">{totalResults}</span>{" "}
                  {totalResults === 1 ? "product" : "products"}
                </p>
                {productsError && (
                  <div className="text-sm text-red-600 space-y-1">
                    <p className="font-semibold">Failed to load products.</p>
                    <p className="text-xs">
                      {productsErrorDetails instanceof Error
                        ? productsErrorDetails.message
                        : "Please check your connection and try again."}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-xl animate-pulse aspect-3/4"
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Clear all filters
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                      <button
                        className="px-4 py-2 text-sm rounded border border-gray-300 disabled:opacity-50"
                        onClick={() =>
                          updateFilters.setPage(Math.max(1, filters.page - 1))
                        }
                        disabled={filters.page === 1}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {filters.page} of {totalPages}
                      </span>
                      <button
                        className="px-4 py-2 text-sm rounded border border-gray-300 disabled:opacity-50"
                        onClick={() =>
                          updateFilters.setPage(
                            Math.min(totalPages, filters.page + 1)
                          )
                        }
                        disabled={filters.page === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-white">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner variant="full" />
          </div>
          <Footer />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
