"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Package,
  Folder,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text, Heading } from "@/components/ui/typography";
import { Stack } from "@/components/ui/stack";
import type { Category } from "@/features/products/types";

interface CategoryGroupsProps {
  categories: Category[];
  productCounts: Record<string, number>;
  onDelete: (id: string) => void;
}

interface CategoryGroup {
  parent: Category;
  children: Category[];
  totalProducts: number;
}

export function CategoryGroups({
  categories,
  productCounts,
  onDelete,
}: CategoryGroupsProps) {
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set()
  );

  // Basic validation
  if (!Array.isArray(categories)) {
    return (
      <div className="p-4 bg-red-100 text-red-800">
        Error: categories is not an array
      </div>
    );
  }

  if (!productCounts || typeof productCounts !== "object") {
    return (
      <div className="p-4 bg-red-100 text-red-800">
        Error: productCounts is invalid
      </div>
    );
  }

  // Build parent->children tree
  const categoryGroups: CategoryGroup[] = [];

  // Get all parent categories (those without parentId)
  const parentCategories = categories.filter((cat) => !cat.parentId);
  const childCategories = categories.filter((cat) => cat.parentId);

  // Group children by parent
  const childrenByParent = new Map<string, Category[]>();
  childCategories.forEach((child) => {
    if (child.parentId) {
      if (!childrenByParent.has(child.parentId)) {
        childrenByParent.set(child.parentId, []);
      }
      childrenByParent.get(child.parentId)!.push(child);
    }
  });

  // Create groups
  parentCategories.forEach((parent) => {
    const children = childrenByParent.get(parent.id) || [];
    const totalProducts =
      children.reduce((sum, child) => sum + (productCounts[child.id] || 0), 0) +
      (productCounts[parent.id] || 0);

    categoryGroups.push({
      parent,
      children,
      totalProducts,
    });
  });

  // Handle any orphaned children (children whose parent is not in the filtered list)
  const parentIds = new Set(parentCategories.map((p) => p.id));
  const orphanedChildren = childCategories.filter(
    (child) => child.parentId && !parentIds.has(child.parentId)
  );

  if (orphanedChildren.length > 0) {
    // Create a virtual "Ungrouped" parent for orphaned children
    const ungroupedTotalProducts = orphanedChildren.reduce(
      (sum, child) => sum + (productCounts[child.id] || 0),
      0
    );
    categoryGroups.push({
      parent: {
        id: "ungrouped",
        name: "Ungrouped Categories",
        slug: "ungrouped",
        description: "Categories without a parent",
      } as Category,
      children: orphanedChildren,
      totalProducts: ungroupedTotalProducts,
    });
  }

  const toggleExpanded = (parentId: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  if (categories.length === 0) {
    return null;
  }

  // Fallback: If no groups were created, show categories in simple list
  if (categoryGroups.length === 0 && categories.length > 0) {
    return (
      <>
        {/* Desktop Fallback */}
        <div className="hidden md:block">
          <Card className="p-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="p-2 bg-gray-50 rounded">
                  {category.name} (ID: {category.id}) - Parent:{" "}
                  {category.parentId || "None"}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Mobile Fallback */}
        <div className="md:hidden space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="p-2 bg-gray-50 rounded">
                  {category.name} (ID: {category.id}) - Parent:{" "}
                  {category.parentId || "None"}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="block">
        <Card className="overflow-hidden">
          <div className="divide-y divide-warm-gray-200">
            {categoryGroups.map((group) => {
              const isExpanded = expandedParents.has(group.parent.id);
              const hasChildren = group.children.length > 0;

              return (
                <div key={group.parent.id}>
                  {/* Parent Header Row */}
                  <div className="bg-warm-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          hasChildren && toggleExpanded(group.parent.id)
                        }
                        className="flex items-center gap-3 flex-1 text-left hover:bg-warm-gray-100 -m-2 p-2 rounded transition-colors"
                        disabled={!hasChildren}
                      >
                        <div className="flex items-center gap-2">
                          {hasChildren ? (
                            isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-warm-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-warm-gray-500" />
                            )
                          ) : (
                            <div className="w-4" />
                          )}
                          <Folder className="h-5 w-5 text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Heading level="h4" className="truncate">
                              {group.parent.name}
                            </Heading>
                            <Badge variant="secondary">
                              {group.children.length}{" "}
                              {group.children.length === 1
                                ? "subcategory"
                                : "subcategories"}
                            </Badge>
                            <Badge variant="secondary">
                              {group.totalProducts} products
                            </Badge>
                          </div>
                          {group.parent.description && (
                            <Text className="text-sm text-warm-gray-600 mt-1 line-clamp-1">
                              {group.parent.description}
                            </Text>
                          )}
                        </div>
                      </button>

                      <div className="flex gap-2 ml-4">
                        <Link href={`/admin/categories/${group.parent.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(group.parent.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Children Rows */}
                  {isExpanded && hasChildren && (
                    <div className="divide-y divide-warm-gray-200">
                      {group.children.map((child) => (
                        <div key={child.id} className="px-6 py-4 bg-white">
                          <div className="flex items-center justify-between ml-8 pl-4 border-l-2 border-warm-gray-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FolderOpen className="h-4 w-4 text-warm-gray-400 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Text className="font-medium text-warm-gray-900 truncate">
                                    {child.name}
                                  </Text>
                                  <Badge
                                    variant="secondary"
                                    className="font-mono text-xs"
                                  >
                                    {child.slug}
                                  </Badge>
                                </div>
                                {child.description && (
                                  <Text className="text-sm text-warm-gray-600 mt-1 line-clamp-1">
                                    {child.description}
                                  </Text>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Package className="h-4 w-4 text-warm-gray-400" />
                                <Text className="text-sm font-medium">
                                  {productCounts[child.id] || 0}
                                </Text>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4 shrink-0">
                              <Link href={`/admin/categories/${child.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onDelete(child.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {categoryGroups.map((group: CategoryGroup) => {
          const isExpanded = expandedParents.has(group.parent.id);
          const hasChildren = group.children.length > 0;

          return (
            <Card key={group.parent.id} className="p-4">
              <Stack spacing="md">
                {/* Parent Header */}
                <div className="flex items-start justify-between">
                  <button
                    onClick={() =>
                      hasChildren && toggleExpanded(group.parent.id)
                    }
                    className="flex items-start gap-3 flex-1 text-left"
                    disabled={!hasChildren}
                  >
                    <div className="flex items-center gap-2 pt-1">
                      {hasChildren ? (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-warm-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-warm-gray-500" />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                      <Folder className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Heading level="h4" className="truncate">
                          {group.parent.name}
                        </Heading>
                        <Badge variant="secondary" className="text-xs">
                          {group.children.length}
                        </Badge>
                      </div>
                      {group.parent.description && (
                        <Text className="text-sm text-warm-gray-600 line-clamp-2">
                          {group.parent.description}
                        </Text>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-warm-gray-400" />
                          <Text className="text-sm font-medium">
                            {group.totalProducts} products
                          </Text>
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex gap-2 ml-2 shrink-0">
                    <Link href={`/admin/categories/${group.parent.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(group.parent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children Cards */}
                {isExpanded && hasChildren && (
                  <div className="ml-8 pl-4 border-l-2 border-warm-gray-200 space-y-3">
                    {group.children.map((child) => (
                      <Card key={child.id} className="p-3 bg-warm-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FolderOpen className="h-4 w-4 text-warm-gray-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Text className="font-medium text-warm-gray-900 truncate">
                                  {child.name}
                                </Text>
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-xs"
                                >
                                  {child.slug}
                                </Badge>
                              </div>
                              {child.description && (
                                <Text className="text-sm text-warm-gray-600 mt-1 line-clamp-1">
                                  {child.description}
                                </Text>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <Package className="h-3 w-3 text-warm-gray-400" />
                                <Text className="text-xs font-medium">
                                  {productCounts[child.id] || 0} products
                                </Text>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-2 shrink-0">
                            <Link href={`/admin/categories/${child.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onDelete(child.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Stack>
            </Card>
          );
        })}
      </div>
    </>
  );
}
