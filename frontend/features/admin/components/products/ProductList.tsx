"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminProduct } from "@/features/admin/types";

type SortField = "name" | "price" | "stock" | "createdAt";

interface ProductListProps {
  products: AdminProduct[];
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
}

const formatPrice = (product: AdminProduct) => {
  const currency = product.currency || "USD";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  const minPrice = product.minPrice ?? product.price ?? 0;
  const maxPrice = product.maxPrice ?? product.price ?? 0;

  if (minPrice === maxPrice) {
    return formatter.format(minPrice);
  } else {
    return `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
  }
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export function ProductList({
  products,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: ProductListProps) {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "name", label: "Product" },
                { key: "price", label: "Price" },
                { key: "stock", label: "Stock" },
                { key: "variants", label: "Variants" },
                { key: "createdAt", label: "Created" },
                { key: "actions", label: "Actions" },
              ].map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {["actions", "variants"].includes(col.key) ? (
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
            {safeProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.slug}</div>
                  {product.category?.name ? (
                    <div className="text-xs text-gray-500">
                      {product.category.parent?.name && (
                        <span className="text-gray-400">
                          {product.category.parent.name} &gt;{" "}
                        </span>
                      )}
                      {product.category.name}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(product)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.effectiveStock ?? product.stock ?? 0}
                  {(product.effectiveStock ?? product.stock ?? 0) < 5 ? (
                    <span className="ml-2 text-xs text-red-600">Low</span>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.variants?.length ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(product.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => onDelete(product.id)}
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

      {safeProducts.length === 0 && (
        <div className="p-8 text-center text-gray-500">No products found.</div>
      )}
    </div>
  );
}
