// Modern "You May Also Like" Recommendations - Professional & Trendy
"use client";

import { useMemo } from "react";
import { Heart, Sparkles } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Stack } from "@/components/ui/stack";
import { getAllProductsSync } from "@/lib/data/products";
import type { Product } from "@/features/products/types";

interface YouMayAlsoLikeProps {
  currentProduct: Product;
}

export function YouMayAlsoLike({ currentProduct }: YouMayAlsoLikeProps) {
  const recommendations = useMemo(() => {
    // Get products from same category or similar price range
    const relatedProducts = getAllProductsSync()
      .filter((p) => p.id !== currentProduct.id)
      .filter((product) => {
        // Same category or similar price range (±20%)
        const sameCategory = product.categoryId === currentProduct.categoryId;
        const similarPrice =
          Math.abs(product.price - currentProduct.price) /
            currentProduct.price <=
          0.2;

        return sameCategory || similarPrice;
      })
      .slice(0, 4); // Show max 4 recommendations

    return relatedProducts;
  }, [currentProduct]);

  if (recommendations.length === 0) return null;

  return (
    <div className="pb-8 sm:pb-12 lg:pb-16">
      <Stack spacing="lg" className="sm:space-y-8 mt-12 sm:mt-16">
        {/* Header - 2026 Trendy Style */}
        <div className="w-full text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />
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

