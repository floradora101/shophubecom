"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  BarChart3,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { useCategoriesQuery, useDeleteCategoryMutation } from "@/features/categories/queries";
import type { Category } from "@/features/products/types";

interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  parentId: string | null;
  children: CategoryTreeNode[];
}

type SortOption = "name-asc" | "name-desc" | "products-desc" | "products-asc";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Fetch categories - tree view requires full hierarchy (limit 200 covers most stores)
  const { data: categoriesResponse, isLoading, error } = useCategoriesQuery({
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });

  const deleteMutation = useDeleteCategoryMutation();

  // Extract categories array from response, default to empty array
  const categories: Category[] = categoriesResponse?.data || [];

  const treeData = useMemo(() => {
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // First pass: create nodes
    categories.forEach(cat => {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat.productCount || 0,
        parentId: cat.parentId || null,
        children: []
      });
    });

    // Second pass: link parents and children
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Recursive sort function
    const sortNodes = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => {
        switch (sortBy) {
          case "name-asc": return a.name.localeCompare(b.name);
          case "name-desc": return b.name.localeCompare(a.name);
          case "products-desc": return b.productCount - a.productCount;
          case "products-asc": return a.productCount - b.productCount;
          default: return 0;
        }
      });
      nodes.forEach(node => {
        if (node.children.length > 0) sortNodes(node.children);
      });
    };

    sortNodes(roots);
    return roots;
  }, [categories, sortBy]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category and all its subcategories?")) {
      deleteMutation.mutate(id);
    }
  };

  const renderCategoryRow = (node: CategoryTreeNode, depth = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;

    // Simple filter for search (checks name and slug)
    const matchesSearch =
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.slug.toLowerCase().includes(search.toLowerCase());

    // If search is active, we might want to show all matches or keep tree structure
    // For now, let's just render if it matches or has children that match
    const childMatches = node.children.some(child =>
      child.name.toLowerCase().includes(search.toLowerCase()) ||
      child.slug.toLowerCase().includes(search.toLowerCase())
    );

    if (search && !matchesSearch && !childMatches) return null;

    return (
      <React.Fragment key={node.id}>
        <div
          className={cn(
            "flex items-center py-3 px-4 hover:bg-warm-gray-50 transition-colors border-b border-warm-gray-100 group",
            depth > 0 && "bg-warm-gray-50/20"
          )}
          style={{ paddingLeft: `${(depth * 32) + 16}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 hover:bg-warm-gray-200 rounded text-warm-gray-500 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" /> // Spacer for alignment
            )}

            <div className="min-w-0">
              <Text className="font-semibold text-warm-gray-900 group-hover:text-primary-700 transition-colors text-sm truncate">
                {node.name}
              </Text>
              <code className="text-[10px] text-warm-gray-400 font-mono hidden sm:inline-block">
                {node.slug}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <Badge variant="outline" className="bg-white text-warm-gray-600 border-warm-gray-200 font-medium text-[10px] whitespace-nowrap">
              {node.productCount} <span className="hidden sm:inline ml-1">Products</span>
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-warm-gray-100">
                  <MoreHorizontal className="h-4 w-4 text-warm-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 shadow-lg border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Options</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/categories/${node.id}/edit`} className="rounded-lg cursor-pointer flex items-center gap-2 px-2 py-2">
                    <Edit2 className="w-4 h-4 text-warm-gray-400" />
                    <span>Edit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuItem onClick={() => handleDelete(node.id)} className="rounded-lg cursor-pointer flex items-center gap-2 px-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {hasChildren && isExpanded && node.children.map(child => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading level="h2">Categories</Heading>
            <Text className="text-warm-gray-500">
              Manage your product hierarchy with a smart tree view.
            </Text>
          </div>
          <Link href="/admin/categories/new">
            <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </Link>
        </div>

        <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <Text className="text-warm-gray-500">Loading categories...</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading level="h2">Categories</Heading>
            <Text className="text-warm-gray-500">
              Manage your product hierarchy with a smart tree view.
            </Text>
          </div>
          <Link href="/admin/categories/new">
            <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </Link>
        </div>

        <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <Heading level="h3">Failed to load categories</Heading>
            <Text className="text-warm-gray-500 text-center max-w-md">
              {error instanceof Error ? error.message : "An error occurred while fetching categories. Please try again."}
            </Text>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Categories</Heading>
          <Text className="text-warm-gray-500">
            Manage your product hierarchy with a smart tree view.
          </Text>
        </div>
        <Link href="/admin/categories/new">
          <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-warm-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-warm-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {categoriesResponse?.total ?? categories.length} {categoriesResponse?.total === 1 ? 'category' : 'categories'}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-warm-gray-400" />
                  <span className="text-sm font-medium text-warm-gray-700">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Sort Tree Nodes</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="name-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (A-Z)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc" className="rounded-lg cursor-pointer py-2.5">
                    <SortDesc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (Z-A)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="products-desc" className="rounded-lg cursor-pointer py-2.5">
                    <BarChart3 className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Most Products</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="products-asc" className="rounded-lg cursor-pointer py-2.5">
                    <BarChart3 className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Fewest Products</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="min-h-[400px]">
          <div className="bg-warm-gray-50/50 border-b border-warm-gray-100 py-2 px-4 flex items-center justify-between">
            <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Hierarchy & Details</Text>
            <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Stats & Actions</Text>
          </div>
          <div className="divide-y divide-warm-gray-100">
            {treeData.map(root => renderCategoryRow(root))}

            {treeData.length === 0 && (
              <div className="py-20 text-center">
                <Layers className="w-12 h-12 text-warm-gray-200 mx-auto mb-4" />
                <Text className="text-warm-gray-500 font-medium">No categories found</Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
