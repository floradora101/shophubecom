"use client";

import Link from "next/link";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types/product.types";

type SortField = "name" | "createdAt";

interface CategoryListProps {
  categories: Category[];
  allCategories?: Category[];
  productCounts: Record<string, number>;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export function CategoryList({
  categories,
  allCategories,
  productCounts,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: CategoryListProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const categoriesForLookup = allCategories || safeCategories;
  const parentLookup = new Map<string, string>();
  categoriesForLookup.forEach((cat) => {
    if (cat.id && cat.name) parentLookup.set(cat.id, cat.name);
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "name", label: "Category" },
                { key: "slug", label: "Slug" },
                { key: "parent", label: "Parent" },
                { key: "products", label: "Products" },
                { key: "createdAt", label: "Created" },
                { key: "actions", label: "Actions" },
              ].map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {["actions", "slug", "parent", "products"].includes(
                    col.key
                  ) ? (
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
            {safeCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No categories found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create your first category to organize products.
                  </p>
                </td>
              </tr>
            ) : (
              safeCategories.map((category) => {
                const productCount = productCounts[category.id] || 0;
                return (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {category.parentId
                        ? parentLookup.get(category.parentId) || "—"
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        {productCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => onDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

