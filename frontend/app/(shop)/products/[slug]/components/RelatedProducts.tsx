// Related Products Component
"use client";

import { Section } from "@/components/ui/section";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <Section spacing="lg" className="bg-surface-muted/50">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-fg mb-3">
          You May Also Like
        </h2>
        <p className="text-muted-fg">
          Discover more products from our collection
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} layout="vertical" />
        ))}
      </div>
    </Section>
  );
}
