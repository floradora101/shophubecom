// Admin product listing and management page.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductList } from "@/components/admin/products/ProductList";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import {
  useAdminProductsQuery,
  useDeleteProductMutation,
} from "@/lib/queries/admin/products.queries";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";

type SortField = "name" | "price" | "stock" | "createdAt";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  // React Query hooks - automatically cached and deduplicated
  // Note: Backend only supports "name" | "price" | "createdAt", so filter out "stock"
  const querySortBy =
    sortBy === "stock"
      ? "createdAt"
      : (sortBy as "name" | "price" | "createdAt");

  const {
    data: productsData,
    isLoading,
    error,
  } = useAdminProductsQuery({
    search: debouncedSearch,
    categoryId,
    page,
    limit,
    sortBy: querySortBy,
    sortOrder,
  });

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useDeleteProductMutation();

  // Extract data from query result
  const products = productsData?.data || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load products";
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
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Product deleted successfully");
      // React Query automatically invalidates and refetches cache
    } catch (error) {
      console.error("Failed to delete product:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete product. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product catalog ({total} products)
              </p>
            </div>
            <Link href="/admin/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <ProductFilters
          search={search}
          categoryId={categoryId}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
          onReset={handleResetFilters}
        />

        {/* Products List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            <ProductList
              products={products}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} products
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
