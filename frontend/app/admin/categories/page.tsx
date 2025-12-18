// Admin categories listing and management page.
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryList } from "@/components/admin/categories/CategoryList";
import { CategoryFilters } from "@/components/admin/categories/CategoryFilters";
import {
  useAdminCategoriesQuery,
  useAdminAllCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/lib/queries/admin/categories.queries";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";
import type { Category } from "@/lib/types/product.types";

type SortField = "name" | "createdAt";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const limit = 10;

  // React Query hooks - automatically cached and deduplicated
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useAdminCategoriesQuery({
    search: debouncedSearch,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  // Load all categories for parent lookup (cached separately, shared across components)
  const { data: allCategories = [] } = useAdminAllCategoriesQuery();

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useDeleteCategoryMutation();

  // Extract data from query result
  const categories = categoriesData?.data || [];
  const total = categoriesData?.total || 0;
  const totalPages = categoriesData?.totalPages || 1;

  // Extract product counts from categories
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.id] =
        (cat as Category & { productCount?: number })?.productCount || 0;
    });
    return counts;
  }, [categories]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load categories";
      toast.error(errorMessage);
    }
  }, [error]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    const category = categories.find((c) => c.id === id);
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
      console.error("Failed to delete category:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete category. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage product categories ({total} categories)
              </p>
            </div>
            <Link href="/admin/categories/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <CategoryFilters
          search={search}
          onSearchChange={setSearch}
          onReset={handleResetFilters}
        />

        {/* Categories List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : (
          <>
            <CategoryList
              categories={categories}
              allCategories={allCategories}
              productCounts={productCounts}
              onDelete={handleDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} categories
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          (p >= page - 1 && p <= page + 1)
                      )
                      .map((p, idx, arr) => (
                        <div key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <Button
                            variant={page === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(p)}
                            className="min-w-[40px]"
                          >
                            {p}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
