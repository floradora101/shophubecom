// Modern "You May Also Like" Recommendations - Professional & Trendy
"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Stack } from "@/components/ui/stack";
import { mockProducts, mockProductToProduct } from "@/lib/mock-data/mock-data";
import type { Product } from "@/features/products/types";

interface YouMayAlsoLikeProps {
  currentProduct: Product;
}

export function YouMayAlsoLike({ currentProduct }: YouMayAlsoLikeProps) {
  const recommendations = useMemo(() => {
    // Get products from same category or similar price range
    const relatedProducts = mockProducts
      .filter((p) => p.id !== currentProduct.id)
      .map(mockProductToProduct)
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
        {/* Header with Hearts */}
        <div className="w-full text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary-100 via-primary-50 to-primary-100 shadow-sm border border-primary-200/50 mb-4">
            <Heart className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-600 font-inter tracking-wide">
              you may also like
            </span>
          </div>
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
