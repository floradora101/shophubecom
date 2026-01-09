"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectWithOptions as Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/typography";
import { listCategories, deleteCategory } from "../_lib/admin-data";
import type { Category } from "@/features/products/types";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderOpen,
} from "lucide-react";

type FilterType = "all" | "parents" | "children";
type SortType = "name" | "createdAt";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("name");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const allCategories = useMemo(() => listCategories(), []);

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = allCategories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (filter) {
        case "parents":
          return !category.parentId;
        case "children":
          return !!category.parentId;
        default:
          return true;
      }
    });

    // Sort categories
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    return filtered;
  }, [allCategories, searchTerm, filter, sortBy]);

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      // In a real app, you'd trigger a re-fetch here
      window.location.reload();
    }
  };

  const getHierarchyPreview = (category: Category) => {
    if (!category.parentId) return "Parent Category";

    const parent = allCategories.find((c) => c.id === category.parentId);
    return parent ? `${parent.name} › ${category.name}` : category.name;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage your product categories and subcategories"
        actions={
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>

            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as FilterType)}
              options={[
                { value: "all", label: "All Categories" },
                { value: "parents", label: "Parent Categories" },
                { value: "children", label: "Subcategories" },
              ]}
            />

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortType)}
              options={[
                { value: "name", label: "Sort by Name" },
                { value: "createdAt", label: "Sort by Date" },
              ]}
            />
          </div>

          <Text variant="meta" className="text-warm-gray-600">
            {filteredAndSortedCategories.length} categories
          </Text>
        </div>
      </Card>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredAndSortedCategories.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-warm-gray-400 mx-auto mb-4" />
              <Text className="text-lg font-medium text-warm-gray-900 mb-2">
                No categories found
              </Text>
              <Text className="text-warm-gray-600 mb-4">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Get started by creating your first category."}
              </Text>
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          filteredAndSortedCategories.map((category) => (
            <Card key={category.id} padding="md" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Text className="font-medium text-warm-gray-900">
                      {category.name}
                    </Text>
                    {!category.parentId && (
                      <Badge variant="secondary">Parent</Badge>
                    )}
                    {category.parentId && (
                      <Badge variant="secondary">Subcategory</Badge>
                    )}
                  </div>
                  <Text variant="meta" className="text-warm-gray-600 mb-2">
                    {getHierarchyPreview(category)}
                  </Text>
                  {category.description && (
                    <Text variant="meta" className="text-warm-gray-600 mb-2">
                      {category.description}
                    </Text>
                  )}
                  <div className="flex items-center gap-4 text-sm text-warm-gray-500">
                    <span>{category.productCount || 0} products</span>
                    <span>
                      Created{" "}
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(category)}
                      className="text-error hover:text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone.
              {categoryToDelete?.productCount &&
                categoryToDelete.productCount > 0 && (
                  <span className="block mt-2 text-error font-medium">
                    Warning: This category contains{" "}
                    {categoryToDelete.productCount} products.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-error hover:bg-error/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
