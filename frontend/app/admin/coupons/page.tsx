// Admin coupons listing and management page.
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CouponList } from "@/features/admin/components/coupons/CouponList";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Pagination } from "@/components/ui/pagination";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { createCustomSortFunction } from "@/lib/utils/sorting";
import { adminApi } from "@/dev/mocks/mockAdmin";
import type { Coupon } from "@/features/products/types";

type SortField = "code" | "startsAt" | "expiresAt" | "value" | "usageLimit";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("startsAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getCoupons({
        search,
        page,
        limit,
      });

      const sorted = [...result.data].sort(
        createCustomSortFunction<Coupon>((item) => {
          if (sortBy === "value") return Number(item.value ?? 0);
          if (sortBy === "startsAt" || sortBy === "expiresAt") {
            const dateStr = (item as Coupon)[sortBy];
            return dateStr ? new Date(dateStr).getTime() : 0;
          }
          if (sortBy === "usageLimit") return Number(item.usageLimit ?? 0);
          return String((item as Coupon)[sortBy] ?? "").toLowerCase();
        }, sortOrder)
      );

      setCoupons(sorted);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, search, sortBy, sortOrder]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

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
    const coupon = coupons.find((p) => p.id === id);
    if (!coupon) return;

    if (
      !confirm(
        `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await adminApi.deleteCoupon(id);
      await loadPromotions();
      toast.success("Coupon deleted successfully");
    } catch (error) {
      toast.error(
        extractErrorMessage(error, "Failed to delete coupon. Please try again.")
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage discount codes ({total} coupons)
              </p>
            </div>
            <Link href="/admin/coupons/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Coupon
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search coupons by code..."
          className="mb-6"
        />

        {/* Coupons List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <CouponList
              coupons={coupons}
              onDelete={handleDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
              itemName="coupons"
            />
          </>
        )}
      </div>
    </div>
  );
}
