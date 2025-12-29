// Admin categories listing and management page.
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { CategoryGroups } from "@/features/admin/components/categories/CategoryGroups";
import { CategoryEmptyState } from "@/features/admin/components/categories/CategoryEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { ActiveFilterChips } from "@/features/admin/components/categories/ActiveFilterChips";
import {
  parseCategoryFiltersFromSearchParams,
  updateCategorySearchParams,
  type CanonicalCategoryFilters,
} from "@/features/admin/components/categories/utils/filters";

import {
  useAdminCategoriesQuery,
  useAdminAllCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/features/admin/queries/categories";
import { USE_ADMIN_MOCKS } from "@/lib/flags";
import {
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import type { Category } from "@/features/products/types";

// Sort options for the dropdown - same as products page
const SORT_OPTIONS = [
  { value: "name-desc", label: "Z to A" },
  { value: "name-asc", label: "A to Z" },
];

function AdminCategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sort dropdown state - same as products page
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
  const filters = useMemo(() => {
    return parseCategoryFiltersFromSearchParams(searchParams);
  }, [searchParams]);

  // Extract for easier use
  const { search, sortBy } = filters;

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ||
    SORT_OPTIONS.find((o) => o.value === "name-desc")?.label ||
    "Sort";

  // Get data from either mock data or API
  const mockCategoriesData = useMemo(() => {
    if (!USE_ADMIN_MOCKS)
      return { categories: [], allCategories: [], productCounts: {} };

    // Use raw mock categories for debugging - they should work with the table
    const categories = mockCategories.map(mockCategoryToCategory);

    // Add mock product counts (generate once, not on every render)
    const productCounts: Record<string, number> = {};
    categories.forEach((cat, index) => {
      // Use index-based pseudo-random for stability
      productCounts[cat.id] = (index % 50) + 1; // Mock product counts
    });

    return { categories, allCategories: categories, productCounts };
  }, []);

  // API queries (keep intact even when using mocks)
  const {
    data: apiCategoriesData,
    isLoading,
    error,
  } = useAdminCategoriesQuery(
    USE_ADMIN_MOCKS
      ? undefined
      : {
          page: 1,
          limit: 1000, // Get all for client-side filtering
          sortBy: "name",
          sortOrder: "asc",
        }
  );

  // Keep query intact for when mocks are disabled
  useAdminAllCategoriesQuery();

  // Determine which data source to use
  const categoriesData = USE_ADMIN_MOCKS
    ? mockCategoriesData
    : apiCategoriesData;

  // Client-side filtering and sorting
  const filteredCategories = useMemo(() => {
    let categories: Category[];

    if (USE_ADMIN_MOCKS) {
      categories = mockCategoriesData.categories;
    } else {
      categories = (categoriesData as { data?: Category[] })?.data || [];
    }

    let filtered = categories;

    // Apply search filter
    if (search) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortBy === "name-asc" ? comparison : -comparison;
    });

    return filtered;
  }, [mockCategoriesData.categories, search, sortBy, categoriesData]);

  // Product counts
  const productCounts = useMemo(() => {
    if (USE_ADMIN_MOCKS) {
      return mockCategoriesData.productCounts || {};
    }

    const counts: Record<string, number> = {};
    filteredCategories.forEach((cat: Category) => {
      counts[cat.id] =
        (cat as Category & { productCount?: number })?.productCount || 0;
    });
    return counts;
  }, [mockCategoriesData.productCounts, filteredCategories]);

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useDeleteCategoryMutation();

  // Show error toast if query fails (only when using API)
  useEffect(() => {
    if (!USE_ADMIN_MOCKS && error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load categories";
      toast.error(errorMessage);
    }
  }, [error]);

  const handleDelete = async (id: string) => {
    const category = filteredCategories.find((c: Category) => c.id === id);
    if (!category) return;

    const productCount = productCounts[id] || 0;
    const confirmMessage =
      productCount > 0
        ? `This category has ${productCount} product(s). Deleting it will affect those products. Are you sure you want to delete "${category.name}"?`
        : `Are you sure you want to delete "${category.name}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Category deleted successfully");
      // React Query automatically invalidates and refetches cache
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete category. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Handle filter updates (update URL params)
  const updateFilters = useMemo(
    () => ({
      setSearch: (searchValue: string) => {
        const newParams = updateCategorySearchParams(searchParams, {
          search: searchValue,
        });
        router.push(
          newParams.toString()
            ? `/admin/categories?${newParams.toString()}`
            : "/admin/categories",
          { scroll: false }
        );
      },

      setSortBy: (sortByValue: CanonicalCategoryFilters["sortBy"]) => {
        const newParams = updateCategorySearchParams(searchParams, {
          sortBy: sortByValue,
        });
        router.push(
          newParams.toString()
            ? `/admin/categories?${newParams.toString()}`
            : "/admin/categories",
          { scroll: false }
        );
      },
    }),
    [searchParams, router]
  );

  const handleResetFilters = () => {
    router.push("/admin/categories", { scroll: false });
  };

  const handleRemoveFilter = (filterType: "search" | "sortBy") => {
    const updates: Partial<{
      search: string | null;
      sortBy: CanonicalCategoryFilters["sortBy"] | null;
    }> = {};

    if (filterType === "search") {
      updates.search = null;
    } else if (filterType === "sortBy") {
      updates.sortBy = "name-desc";
    }

    const newParams = updateCategorySearchParams(searchParams, updates);
    router.push(
      newParams.toString()
        ? `/admin/categories?${newParams.toString()}`
        : "/admin/categories",
      { scroll: false }
    );
  };

  const hasFilters = search !== null || sortBy !== "name-desc";
  const isEmpty = filteredCategories.length === 0;
  const showEmptyState = isEmpty && !isLoading;

  return (
    <AdminPageShell
      title="Categories"
      description="Manage product categories to organize your store"
      actions={
        <Link href="/admin/categories/new">
          <Button className="gap-2 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Results Count and Controls - Same as Products Page */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {filteredCategories.length}
            </span>
            <span className="mx-1">of</span>
            <span className="text-gray-700">
              {USE_ADMIN_MOCKS ? mockCategoriesData.categories.length : "total"}
            </span>
            <span className="ml-1">
              {filteredCategories.length === 1 ? "category" : "categories"}
            </span>
            {hasFilters && <span className="ml-1">found</span>}
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input - Standardized UI Input */}
            <div className="relative max-w-sm flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search categories..."
                value={search || ""}
                onChange={(e) => updateFilters.setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown - Same as Products Page */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="gap-2 w-full sm:w-auto justify-between sm:justify-center rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105"
                aria-expanded={isSortOpen}
                aria-haspopup="true"
              >
                <span className="truncate">{currentSortLabel}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform shrink-0",
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
                          option.value as CanonicalCategoryFilters["sortBy"]
                        );
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        sortBy === option.value
                          ? "text-primary-600 font-medium bg-primary-50"
                          : "text-gray-700 hover:bg-slate-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Chips - Same as Products Page */}
        <ActiveFilterChips
          search={search}
          sortBy={sortBy}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleResetFilters}
        />

        {/* Loading state */}
        {isLoading && !USE_ADMIN_MOCKS && (
          <Card className="p-12">
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          </Card>
        )}

        {/* Empty state */}
        {showEmptyState && (
          <CategoryEmptyState
            hasFilters={hasFilters}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Categories list */}
        {!isEmpty && (
          <div>
            <CategoryGroups
              categories={filteredCategories}
              productCounts={productCounts}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <AdminCategoriesContent />
    </Suspense>
  );
}
