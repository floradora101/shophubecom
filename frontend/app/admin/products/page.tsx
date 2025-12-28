// Admin product listing and management page.
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductList } from "@/features/admin/components/products/ProductList";
import { ProductFilters } from "@/features/admin/components/products/ProductFilters";
import { LoadingSpinner, TableSkeleton } from "@/components/ui/loading-spinner";
import { Pagination } from "@/components/ui/pagination";
import {
  useAdminProductsQuery,
  useDeleteProductMutation,
} from "@/features/admin/queries/products";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import {
  parseAdminFiltersFromSearchParams,
  updateAdminSearchParams,
  adminFiltersToApiParams,
} from "@/features/admin/utils/filters";

type SortField = "name" | "price" | "stock" | "createdAt";

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse filters from URL (single source of truth)
  const filters = useMemo(
    () => parseAdminFiltersFromSearchParams(searchParams),
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
      const newParams = updateAdminSearchParams(searchParams, {
        search: debouncedSearch || null,
        page: 1, // Reset to page 1 when search changes
      });
      router.replace(`/admin/products?${newParams.toString()}`, {
        scroll: false,
      });
    }
  }, [debouncedSearch, filters.search, searchParams, router]);

  // Convert filters to API params
  const apiParams = useMemo(() => adminFiltersToApiParams(filters), [filters]);

  // React Query hooks - automatically cached and deduplicated
  // Note: Backend only supports "name" | "price" | "createdAt"
  const querySortBy = (filters.sortBy || "createdAt") as
    | "name"
    | "price"
    | "createdAt";

  const {
    data: productsData,
    isLoading,
    error,
  } = useAdminProductsQuery({
    search: apiParams.search,
    categoryId: apiParams.categoryId,
    page: apiParams.page,
    limit: apiParams.limit,
    sortBy: querySortBy,
    sortOrder: apiParams.sortOrder,
  });

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useDeleteProductMutation();

  // Extract data from query result
  const products = productsData?.data || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(extractErrorMessage(error, "Failed to load products"));
    }
  }, [error]);

  // Update URL with filter changes
  const updateFilters = useMemo(
    () => ({
      setSearch: (search: string) => {
        setLocalSearch(search);
        // Debounce will handle URL update
      },

      setCategoryId: (categoryId: string | null) => {
        const newParams = updateAdminSearchParams(searchParams, {
          categoryId,
          page: 1, // Reset to page 1 when category changes
        });
        router.push(`/admin/products?${newParams.toString()}`);
      },

      setPage: (page: number) => {
        const newParams = updateAdminSearchParams(searchParams, {
          page,
        });
        router.push(`/admin/products?${newParams.toString()}`);
      },

      setSort: (
        sortBy: "name" | "price" | "createdAt",
        sortOrder: "asc" | "desc"
      ) => {
        const newParams = updateAdminSearchParams(searchParams, {
          sortBy,
          sortOrder,
          page: 1, // Reset to page 1 when sort changes
        });
        router.push(`/admin/products?${newParams.toString()}`);
      },
    }),
    [searchParams, router]
  );

  const handleSort = (field: SortField) => {
    const backendField =
      field === "stock"
        ? "createdAt"
        : (field as "name" | "price" | "createdAt");
    if (filters.sortBy === backendField) {
      updateFilters.setSort(
        backendField,
        filters.sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      updateFilters.setSort(backendField, "asc");
    }
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
      toast.error(
        extractErrorMessage(
          error,
          "Failed to delete product. Please try again."
        )
      );
    }
  };

  const handleResetFilters = () => {
    updateFilters.setSearch("");
    updateFilters.setCategoryId(null);
    updateFilters.setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-600">
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
          search={localSearch}
          categoryId={filters.categoryId || ""}
          onSearchChange={updateFilters.setSearch}
          onCategoryChange={(cat) => updateFilters.setCategoryId(cat || null)}
          onReset={handleResetFilters}
        />

        {/* Products List */}
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <>
            <ProductList
              products={products}
              sortBy={(filters.sortBy || "createdAt") as SortField}
              sortOrder={filters.sortOrder || "desc"}
              onSort={handleSort}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={10}
              onPageChange={updateFilters.setPage}
              itemName="products"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
