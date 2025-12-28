"use client";

import Link from "next/link";
import { Edit, Trash2, Package, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { Stack } from "@/components/ui/stack";
import type { Category } from "@/features/products/types";

interface CategoriesCardListProps {
  categories: Category[];
  allCategories: Category[];
  productCounts: Record<string, number>;
  onDelete: (id: string) => void;
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export function CategoriesCardList({
  categories,
  allCategories,
  productCounts,
  onDelete,
}: CategoriesCardListProps) {
  const parentLookup = new Map<string, string>();
  allCategories.forEach((cat) => {
    if (cat.id && cat.name) parentLookup.set(cat.id, cat.name);
  });

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden space-y-4">
      {categories.map((category) => {
        const productCount = productCounts[category.id] || 0;
        const isParent = !category.parentId;
        const parentName = category.parentId
          ? parentLookup.get(category.parentId) || "—"
          : "—";

        return (
          <Card key={category.id} className="p-4">
            <Stack spacing="md">
              {/* Header with icon and name */}
              <div className="flex items-start gap-3">
                {isParent ? (
                  <Folder className="h-5 w-5 text-primary-500 mt-1" />
                ) : (
                  <FolderOpen className="h-5 w-5 text-warm-gray-400 mt-1" />
                )}
                <div className="flex-1 min-w-0">
                  <Text className="font-medium text-warm-gray-900 truncate">
                    {category.name}
                  </Text>
                  {category.description && (
                    <Text className="text-sm text-warm-gray-600 mt-1 line-clamp-2">
                      {category.description}
                    </Text>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Text className="text-warm-gray-500 uppercase text-xs tracking-wide">
                    Slug
                  </Text>
                  <Badge variant="secondary" className="font-mono text-xs mt-1">
                    {category.slug}
                  </Badge>
                </div>
                <div>
                  <Text className="text-warm-gray-500 uppercase text-xs tracking-wide">
                    Products
                  </Text>
                  <div className="flex items-center gap-1 mt-1">
                    <Package className="h-4 w-4 text-warm-gray-400" />
                    <Text className="font-medium">{productCount}</Text>
                  </div>
                </div>
                {parentName !== "—" && (
                  <div>
                    <Text className="text-warm-gray-500 uppercase text-xs tracking-wide">
                      Parent
                    </Text>
                    <Text className="mt-1">{parentName}</Text>
                  </div>
                )}
                <div>
                  <Text className="text-warm-gray-500 uppercase text-xs tracking-wide">
                    Created
                  </Text>
                  <Text className="mt-1">{formatDate(category.createdAt)}</Text>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-warm-gray-200">
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Stack>
          </Card>
        );
      })}
    </div>
  );
}
