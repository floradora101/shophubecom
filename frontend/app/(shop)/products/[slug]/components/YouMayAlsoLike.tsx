// Modern "You May Also Like" Recommendations - Professional & Trendy
"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
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
        {/* Header */}
        <div className="w-full text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-warm-gray-900 mb-2">
            Discover More
          </h2>
          <p className="text-sm text-warm-gray-600 max-w-xs mx-auto">
            Curated recommendations based on your interests
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
