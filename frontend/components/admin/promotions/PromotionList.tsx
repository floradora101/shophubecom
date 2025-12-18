"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/lib/types/product.types";

type SortField = "name" | "startsAt" | "expiresAt" | "value";

interface PromotionListProps {
  promotions: Promotion[];
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
}

const sortableColumns: SortField[] = ["name", "value", "startsAt", "expiresAt"];

const formatValue = (promotion: Promotion) => {
  const type = promotion.type || promotion.discountType || "PERCENTAGE";
  const value = promotion.value ?? promotion.discountValue ?? 0;
  return type === "PERCENTAGE"
    ? `${value}%`
    : `$${Number(value || 0).toFixed(2)}`;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export function PromotionList({
  promotions,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: PromotionListProps) {
  const columns = [
    { key: "name", label: "Promotion" },
    { key: "code", label: "Code" },
    { key: "value", label: "Value" },
    { key: "startsAt", label: "Starts" },
    { key: "expiresAt", label: "Expires" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => {
                const isSortable = sortableColumns.includes(
                  col.key as SortField
                );
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {isSortable ? (
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
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{promotion.name}</div>
                  {promotion.description ? (
                    <div className="text-xs text-gray-500">
                      {promotion.description}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {promotion.code || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatValue(promotion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(
                    promotion.startsAt || promotion.startDate || undefined
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(
                    promotion.expiresAt || promotion.endDate || undefined
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      promotion.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {promotion.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                  <Link href={`/admin/promotions/${promotion.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => onDelete(promotion.id)}
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

      {promotions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No promotions found.
        </div>
      )}
    </div>
  );
}
