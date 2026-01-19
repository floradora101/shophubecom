"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ProductsContent } from "@/app/(shop)/products/ProductsContent";

interface CategoryProductsClientProps {
  categorySlug: string;
}

export function CategoryProductsClient({
  categorySlug,
}: CategoryProductsClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <ProductsContent categorySlug={categorySlug} />
    </Suspense>
  );
}

