// Modern "You May Also Like" Recommendations - Professional & Trendy
"use client";

import { useMemo } from "react";
import { YouMayAlsoLikeTitle } from "@/components/ui/SectionTitle";
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
    <Stack spacing="lg" className="sm:space-y-8 mt-12 sm:mt-16">
      {/* Header with Hearts */}
      <YouMayAlsoLikeTitle />

      {/* Recommendations Grid using ProductCard components */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {recommendations.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard
              product={{
                ...product,
                originalPrice: product.originalPrice,
                discountPercent:
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )
                    : undefined,
              }}
            />
          </div>
        ))}
      </div>
    </Stack>
  );
}
