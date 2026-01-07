/**
 * Search Results Page
 *
 * Shows filtered search results from the search page.
 * Uses the same ProductsContent component as the main products page
 * but with search query applied.
 */
"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductsContent } from "../../products/ProductsContent";

export default function SearchResultsPage() {
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
