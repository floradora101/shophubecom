"use client";

import Link from "next/link";
import { Edit, Trash2, Package, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import type { Category } from "@/features/products/types";

interface CategoriesTableProps {
  categories: Category[];
  allCategories: Category[];
  productCounts: Record<string, number>;
  onDelete: (id: string) => void;
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export function CategoriesTable({
  categories,
  allCategories,
  productCounts,
  onDelete,
}: CategoriesTableProps) {
  const parentLookup = new Map<string, string>();
  allCategories.forEach((cat) => {
    if (cat.id && cat.name) parentLookup.set(cat.id, cat.name);
  });

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="hidden lg:block overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-warm-gray-200">
          <thead className="bg-warm-gray-50">
            <tr>
              {[
                { key: "name", label: "Category", className: "w-64" },
                { key: "slug", label: "Slug", className: "w-48" },
                { key: "parent", label: "Parent", className: "w-48" },
                { key: "products", label: "Products", className: "w-32" },
                { key: "createdAt", label: "Created", className: "w-32" },
                { key: "actions", label: "Actions", className: "w-48" },
              ].map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-warm-gray-500 uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-gray-200 bg-white">
            {categories.map((category) => {
              const productCount = productCounts[category.id] || 0;
              const isParent = !category.parentId;
              const parentName = category.parentId
                ? parentLookup.get(category.parentId) || "—"
                : "—";

              return (
                <tr key={category.id} className="hover:bg-warm-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {isParent ? (
                        <Folder className="h-5 w-5 text-primary-500" />
                      ) : (
                        <FolderOpen className="h-5 w-5 text-warm-gray-400" />
                      )}
                      <div>
                        <Text className="font-medium text-warm-gray-900">
                          {category.name}
                        </Text>
                        {category.description && (
                          <Text className="text-sm text-warm-gray-600 mt-1 line-clamp-1">
                            {category.description}
                          </Text>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {category.slug}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Text className="text-sm text-warm-gray-700">
                      {parentName}
                    </Text>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-warm-gray-400" />
                      <Text className="text-sm font-medium">
                        {productCount}
                      </Text>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Text className="text-sm text-warm-gray-500">
                      {formatDate(category.createdAt)}
                    </Text>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
