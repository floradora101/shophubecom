// Admin orders listing page.
"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderList } from "@/features/admin/components/orders/OrderList";
import { useAdminOrdersQuery } from "@/features/admin/queries/orders";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";
import { extractErrorMessage } from "@/lib/utils/error-handler";

type SortField =
  | "orderNumber"
  | "customer"
  | "status"
  | "totalAmount"
  | "createdAt";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // React Query hooks - automatically cached and deduplicated
  const {
    data: ordersData,
    isLoading,
    error,
  } = useAdminOrdersQuery({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    page,
    limit,
  });

  // Extract data from query result
  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;
  const totalPages = ordersData?.totalPages || 1;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(extractErrorMessage(error, "Failed to load orders"));
    }
  }, [error]);

  // Note: Sorting is handled client-side for now since backend doesn't support it
  // Backend returns orders sorted by placedAt desc by default
  const handleSort = (field: SortField) => {
    // For now, we'll keep the backend default sorting
    // In the future, we can add backend sorting support
    return;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage customer orders ({total} orders)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order number, customer name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <OrderList
              orders={orders}
              sortBy="createdAt"
              sortOrder="desc"
              onSort={handleSort}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} orders
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
