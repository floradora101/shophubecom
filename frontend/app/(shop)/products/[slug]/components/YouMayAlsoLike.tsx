// Modern "You May Also Like" Recommendations - Professional & Trendy
"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Stack } from "@/components/ui/stack";
import { useProductsQuery } from "@/features/products/queries";
import type { Product } from "@/features/products/types";

interface YouMayAlsoLikeProps {
  currentProduct: Product;
}

export function YouMayAlsoLike({ currentProduct }: YouMayAlsoLikeProps) {
  // Fetch products from same category only (limit 12) - avoids over-fetching 100 products
  const { data: productsData } = useProductsQuery({
    categoryId: currentProduct.categoryId || undefined,
    limit: 12,
    page: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const recommendations = useMemo(() => {
    const allProducts = productsData?.data ?? [];
    return allProducts
      .filter((p) => p.id !== currentProduct.id)
      .slice(0, 4);
  }, [currentProduct.id, productsData?.data]);

  if (recommendations.length === 0) return null;

  return (
    <div className="pb-8 sm:pb-12 lg:pb-16">
      <Stack spacing="lg" className="sm:space-y-8 mt-12 sm:mt-16">
        {/* Header - 2026 Trendy Style */}
        <div className="w-full text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 border border-white/20 shadow-lg text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles className="h-3 w-3 text-white" />
            <span>Curated For You</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-warm-gray-900 tracking-tight">
            You May <span className="italic font-normal text-primary-600">Also Like</span>
          </h2>
          <p className="text-sm text-warm-gray-600 max-w-xs mx-auto mt-3 font-light leading-relaxed">
            Personalized tech recommendations for your ecosystem
          </p>
        </div>

        {/* Recommendations Grid using ProductCard components */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard product={product} layout="vertical" />
            </div>
          ))}
        </div>
      </Stack>
    </div>
  );
}

