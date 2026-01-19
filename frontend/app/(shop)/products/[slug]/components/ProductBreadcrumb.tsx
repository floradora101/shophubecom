/**
 * Product Breadcrumb Component
 *
 * Server component - renders static navigation breadcrumb from props.
 * Next.js Link component works in server components.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/products/types";

interface ProductBreadcrumbProps {
  product: Product;
  category?: Category | null;
}

export function ProductBreadcrumb({ product, category }: ProductBreadcrumbProps) {
  return (
    <div className="border-b border-border/60">
      <Container className="py-3 sm:py-4">
        <nav
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
          <Link
            href="/products"
            className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
          >
            Products
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
              <Link
                href={`/products/category/${category.slug}`}
                className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
          <span className="text-fg font-medium truncate max-w-32 sm:max-w-xs">
            {product.name}
          </span>
        </nav>
      </Container>
    </div>
  );
}
