// MAKE SHOPHUB YOURS - Cross-sell Section
"use client";

import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";

interface MakeShopHubYoursProps {
  products: Product[];
}

export function MakeShopHubYours({ products }: MakeShopHubYoursProps) {
  if (!products.length) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            MAKE SHOPHUB YOURS
          </h2>
          <p className="text-slate-600">
            Complete your collection with these matching pieces
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
