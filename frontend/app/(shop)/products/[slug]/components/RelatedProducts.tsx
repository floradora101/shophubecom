// Related Products Component
"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 bg-slate-50/50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            You may also like
          </h2>
          <p className="text-slate-600">
            Discover more products from our collection
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
          >
            View All Products
          </Link>
        </div>
      </Container>
    </section>
  );
}
