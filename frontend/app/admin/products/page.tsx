"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Package,
  CircleDollarSign,
  Layers,
  Eye,
  LayoutGrid,
  List as ListIcon,
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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { shouldUnoptimizeImage } from "@/lib/utils/image-helpers";
import { useProductsQuery, useDeleteProductMutation } from "@/features/products/queries";
import { useCategoriesQuery } from "@/features/categories/queries";
import { getProductImage } from "@/features/products/utils/product-images";
import type { Product } from "@/features/products/types";
import { productRoutes } from "@/lib/routes";
import { Pagination } from "@/components/ui/pagination";
import { useAdminPagination } from "../_hooks/useAdminPagination";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type SortOption = "name-asc" | "name-desc" | "price-desc" | "price-asc" | "stock-desc";
type ViewMode = "grid" | "list";

export default function ProductsAdminPage() {
  const router = useRouter();
  const { page, setPage } = useAdminPagination();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const limit = 50; // Fetch more products per page for admin view

  // Map frontend sort option to backend sortBy and sortOrder
  const backendSort = useMemo(() => {
    switch (sortBy) {
      case "name-asc":
        return { sortBy: "name" as const, sortOrder: "asc" as const };
      case "name-desc":
        return { sortBy: "name" as const, sortOrder: "desc" as const };
      case "price-asc":
        return { sortBy: "price" as const, sortOrder: "asc" as const };
      case "price-desc":
        return { sortBy: "price" as const, sortOrder: "desc" as const };
      case "stock-desc":
        // Stock sorting not directly supported by backend, will sort client-side
        return { sortBy: "createdAt" as const, sortOrder: "desc" as const };
      default:
        return { sortBy: "name" as const, sortOrder: "asc" as const };
    }
  }, [sortBy]);

  // Fetch categories for dropdown
  const { data: categoriesResponse } = useCategoriesQuery({
    limit: 1000,
    sortBy: "name",
    sortOrder: "asc",
  });
  const categories = categoriesResponse?.data || [];

  // Find selected category ID
  const selectedCategoryId = useMemo(() => {
    if (selectedCategory === "all") return undefined;
    const category = categories.find((c) => c.slug === selectedCategory);
    return category?.id;
  }, [selectedCategory, categories]);

  // Fetch products from backend
  const { data: productsResponse, isLoading, error, refetch } = useProductsQuery({
    page,
    limit,
    search: search || undefined,
    categoryId: selectedCategoryId,
    ...backendSort,
  });

  const deleteMutation = useDeleteProductMutation();

  // Extract products from response
  const products: Product[] = productsResponse?.data || [];

  // Clamp page when totalPages shrinks (e.g. after filter change) - same as frontstore
  useEffect(() => {
    if (productsResponse && productsResponse.totalPages > 0 && page > productsResponse.totalPages) {
      setPage(productsResponse.totalPages);
    }
  }, [productsResponse?.totalPages, page, setPage]);

  // Client-side sort for stock
  const sortedProducts = useMemo(() => {
    if (sortBy === "stock-desc") {
      return [...products].sort(
        (a, b) => (b.stock || b.effectiveStock || 0) - (a.stock || a.effectiveStock || 0)
      );
    }
    return products;
  }, [products, sortBy]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => setDeleteId(id);

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Products</Heading>
          <Text className="text-warm-gray-500">
            Manage your inventory, variants, and pricing.
          </Text>
        </div>
        <Button
          onClick={() => router.push("/admin/products/new")}
          className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="p-4 border-b border-warm-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-warm-gray-50/30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
              <Input
                placeholder="Search products by name or ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page when search changes
                }}
                className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4 min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-warm-gray-400" />
                    <span className="text-sm font-medium text-warm-gray-700">
                      {selectedCategory === "all" ? "All Categories" :
                        categories.find(c => c.slug === selectedCategory)?.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Filter Category</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  setPage(1); // Reset to first page when category changes
                }}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg cursor-pointer py-2.5">
                    All Categories
                  </DropdownMenuRadioItem>
                  {categories.map(cat => (
                    <DropdownMenuRadioItem key={cat.id} value={cat.slug} className="rounded-lg cursor-pointer py-2.5">
                      {cat.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {productsResponse?.total ?? sortedProducts.length} {productsResponse?.total === 1 ? 'product' : 'products'} found
            </div>

            <div className="flex items-center border border-warm-gray-200 rounded-lg bg-white p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0 rounded-lg", viewMode === "list" && "bg-warm-gray-100 text-primary-600")}
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0 rounded-lg", viewMode === "grid" && "bg-warm-gray-100 text-primary-600")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-warm-gray-400" />
                  <span className="text-sm font-medium text-warm-gray-700">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Sort Results</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => {
                  setSortBy(v as SortOption);
                  setPage(1); // Reset to first page when sort changes
                }}>
                  <DropdownMenuRadioItem value="name-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (A-Z)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc" className="rounded-lg cursor-pointer py-2.5">
                    <SortDesc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (Z-A)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-desc" className="rounded-lg cursor-pointer py-2.5">
                    <CircleDollarSign className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Highest Price</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-asc" className="rounded-lg cursor-pointer py-2.5">
                    <CircleDollarSign className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Lowest Price</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="stock-desc" className="rounded-lg cursor-pointer py-2.5">
                    <Package className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Highest Stock</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px] bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <Text className="text-warm-gray-500">Loading products...</Text>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <Heading level="h3">Failed to load products</Heading>
              <Text className="text-warm-gray-500 text-center max-w-md">
                {extractErrorMessage(error, "An error occurred while fetching products. Please try again.")}
              </Text>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="py-32 text-center">
              <Package className="w-16 h-16 text-warm-gray-100 mx-auto mb-4" />
              <Text className="text-warm-gray-500 font-medium text-lg">No products found</Text>
              <Text className="text-warm-gray-400 text-sm mt-1">Try adjusting your search or filters.</Text>
              <Button
                variant="outline"
                className="mt-6 rounded-lg border-warm-gray-200"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setPage(1);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-warm-gray-100">
              <div className="bg-warm-gray-50/50 border-b border-warm-gray-100 py-2.5 px-6 flex items-center justify-between">
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider flex-1">Product & Category</Text>
                <div className="flex items-center gap-12 w-1/3 justify-end pr-10">
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-20 text-right">Price</Text>
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-20 text-right">Stock</Text>
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-16 text-right">Action</Text>
                </div>
              </div>

              {sortedProducts.map((product) => (
                <div key={product.id} className="group flex items-center py-4 px-6 hover:bg-warm-gray-50 transition-all duration-200">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-warm-gray-100 flex-shrink-0 bg-warm-gray-50 group-hover:shadow-md transition-shadow">
                      {getProductImage(product) ? (
                        <Image
                          src={getProductImage(product)!}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized={shouldUnoptimizeImage(getProductImage(product)!)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-warm-gray-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      {product.isOnSale && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                          SALE
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <Text className="font-bold text-warm-gray-900 group-hover:text-primary-700 transition-colors text-sm truncate mb-0.5">
                        {product.name}
                      </Text>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] py-0 h-4 bg-warm-gray-50 text-warm-gray-500 border-warm-gray-100">
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                        <code className="text-[9px] text-warm-gray-300 font-mono">ID: {product.id}</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 w-1/3 justify-end">
                    <div className="w-20 text-right">
                      <Text className="font-bold text-warm-gray-900 text-sm">
                        ${product.price.toFixed(2)}
                      </Text>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <Text className="text-[10px] text-warm-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </Text>
                      )}
                    </div>

                    <div className="w-20 text-right">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-mono text-[10px] px-2 py-0.5 rounded-lg",
                          (product.stock || product.effectiveStock || 0) < 5 ? "bg-red-50 text-red-600" : "bg-warm-gray-50 text-warm-gray-600"
                        )}
                      >
                        {product.stock || product.effectiveStock || 0} in stock
                      </Badge>
                    </div>

                    <div className="w-16 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-warm-gray-100">
                            <MoreHorizontal className="h-4 w-4 text-warm-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                          <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Manage</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}/edit`} className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                              <Edit2 className="w-4 h-4 text-warm-gray-400" />
                              <span className="text-sm">Edit Product</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={productRoutes.detail(product.slug)} target="_blank" className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                              <Eye className="w-4 h-4 text-warm-gray-400" />
                              <span className="text-sm">View on Store</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-warm-gray-100" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id!)}
                            className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Delete Product</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-warm-gray-200 hover:shadow-xl transition-all duration-300 rounded-lg">
                  <div className="relative aspect-square bg-warm-gray-50">
                    {getProductImage(product) ? (
                      <Image
                        src={getProductImage(product)!}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized={shouldUnoptimizeImage(getProductImage(product)!)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warm-gray-200">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                       {product.isOnSale && (
                        <Badge className="bg-red-500 hover:bg-red-500 text-white border-none shadow-lg">SALE</Badge>
                      )}
                      <Badge className="bg-white/90 backdrop-blur-sm text-warm-gray-900 border-none shadow-sm">{product.category?.name || "Uncategorized"}</Badge>
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button size="sm" className="rounded-lg bg-white text-warm-gray-900 hover:bg-red-600 hover:text-white border-none">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="min-w-0">
                      <Text className="font-bold text-warm-gray-900 truncate block text-sm">
                        {product.name}
                      </Text>
                      <Text className="text-[10px] text-warm-gray-400 font-mono">ID: {product.id}</Text>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="font-bold text-primary-700 text-base">
                          ${product.price.toFixed(2)}
                        </Text>
                        {product.originalPrice && (
                          <Text className="text-[10px] text-warm-gray-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </Text>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[9px] h-5 bg-warm-gray-50">
                        {product.stock || product.effectiveStock || 0} in stock
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

        {/* Pagination - same component as frontstore, URL-based page */}
        {productsResponse && productsResponse.totalPages > 0 && (
          <div className="p-4 border-t border-warm-gray-100 bg-warm-gray-50/30">
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, productsResponse.totalPages)}
              onPageChange={setPage}
              isLoading={isLoading}
              totalItems={productsResponse.total}
              itemsPerPage={limit}
              itemName="products"
            />
          </div>
        )}
        </div>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete product"
        description="Are you sure you want to delete this product?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
