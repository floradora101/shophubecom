// Admin coupons listing and management page.
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CouponList } from "@/components/admin/coupons/CouponList";
import { adminApi } from "@/lib/data/mockAdmin";
import type { Coupon } from "@/lib/types/product.types";

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

      const sorted = [...result.data].sort((a, b) => {
        const aVal =
          sortBy === "value"
            ? Number(a.value ?? 0)
            : sortBy === "startsAt" || sortBy === "expiresAt"
            ? new Date((a as Coupon)[sortBy] || "").getTime()
            : sortBy === "usageLimit"
            ? Number(a.usageLimit ?? 0)
            : String((a as Coupon)[sortBy] ?? "").toLowerCase();
        const bVal =
          sortBy === "value"
            ? Number(b.value ?? 0)
            : sortBy === "startsAt" || sortBy === "expiresAt"
            ? new Date((b as Coupon)[sortBy] || "").getTime()
            : sortBy === "usageLimit"
            ? Number(b.usageLimit ?? 0)
            : String((b as Coupon)[sortBy] ?? "").toLowerCase();

        if (sortOrder === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      });

      setCoupons(sorted);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load coupons:", error);
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
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      alert(
        (error as Error).message || "Failed to delete coupon. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
              <p className="mt-1 text-sm text-gray-500">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search coupons by code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Promotions List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading coupons...</p>
          </div>
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
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} coupons
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
