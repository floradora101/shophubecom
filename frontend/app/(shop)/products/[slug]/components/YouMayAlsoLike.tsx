// Modern "You May Also Like" Recommendations - Professional & Trendy
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouMayAlsoLikeTitle } from "@/components/ui/SectionTitle";
import { ProductCard } from "@/features/products/components/ProductCard";
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
    <div className="mt-16 space-y-8">
      {/* Header with Hearts */}
      <YouMayAlsoLikeTitle />

      {/* Recommendations Grid using ProductCard components */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
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
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center">
        <Link href="/products">
          <Button
            variant="outline"
            className="group border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-2">
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
