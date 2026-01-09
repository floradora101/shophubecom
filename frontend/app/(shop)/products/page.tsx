/**
 * Product Catalog Listing Page
 *
 * Premium 2026 ecommerce style with clean, modern, editorial design.
 * URL-based filtering where the URL is the single source of truth.
 *
 * Categories are now handled via routes: /products/category/[category-slug]
 * Other filters (search, price, sort, inStockOnly) remain as query parameters.
 */
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductsContent } from "./ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
