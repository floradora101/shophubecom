/**
 * Category-specific Product Catalog Listing Page
 *
 * Shows products filtered by category using route parameter instead of query parameter.
 * URL format: /products/category/[category-slug]
 */
"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductsContent } from "../../ProductsContent";

function CategoryProductsContent() {
  const params = useParams();
  const categoryParam = params?.["category"];

  const categorySlug = Array.isArray(categoryParam)
    ? categoryParam[0]
    : categoryParam || null;

  return <ProductsContent categorySlug={categorySlug} />;
}

export default function CategoryProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <CategoryProductsContent />
    </Suspense>
  );
}
