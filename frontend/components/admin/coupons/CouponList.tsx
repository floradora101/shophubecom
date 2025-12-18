"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Coupon } from "@/lib/types/product.types";

type SortField = "code" | "startsAt" | "expiresAt" | "value" | "usageLimit";

interface CouponListProps {
  coupons: Coupon[];
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
}

export function CouponList({
  coupons,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: CouponListProps) {
  const renderDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString() : "—";

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "code", label: "Code" },
                { key: "value", label: "Value" },
                { key: "startsAt", label: "Starts" },
                { key: "expiresAt", label: "Expires" },
                { key: "usageLimit", label: "Limit" },
                { key: "status", label: "Status" },
                { key: "actions", label: "Actions" },
              ].map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {["actions", "status"].includes(col.key) ? (
                    col.label
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => onSort(col.key as SortField)}
                    >
                      {col.label}
                      {sortBy === col.key && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {coupon.code}
                  {coupon.description ? (
                    <span className="block text-xs text-gray-500">
                      {coupon.description}
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(() => {
                    const type = coupon.type || "PERCENTAGE";
                    const value = coupon.value ?? 0;
                    return type === "PERCENTAGE" ? `${value}%` : `$${value}`;
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {renderDate(coupon.startsAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {renderDate(coupon.expiresAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {coupon.usageLimit
                    ? `${coupon.usageLimit} total`
                    : "Unlimited"}
                  {coupon.perUserLimit
                    ? ` / ${coupon.perUserLimit} per user`
                    : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      coupon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                  <Link href={`/admin/coupons/${coupon.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => onDelete(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {coupons.length === 0 && (
        <div className="p-8 text-center text-gray-500">No coupons found.</div>
      )}
    </div>
  );
}
