/**
 * Product Breadcrumb Component
 *
 * Displays breadcrumb: Home > Products > [Category ancestry] > Product.
 * Supports nested categories when categories list is provided.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { productRoutes } from "@/lib/routes";
import { getCategoryAncestry } from "@/lib/utils/breadcrumb";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/products/types";

interface ProductBreadcrumbProps {
  product: Product;
  category?: Category | null;
  /** Flat list of all categories for ancestry lookup (nested breadcrumbs) */
  categories?: Category[];
}

export function ProductBreadcrumb({
  product,
  category,
  categories = [],
}: ProductBreadcrumbProps) {
  const categoryAncestry = category
    ? getCategoryAncestry(category, categories)
    : [];

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
            href={productRoutes.list()}
            className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
          >
            Products
          </Link>
          {categoryAncestry.map((ancestor) => (
            <span key={ancestor.id} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg" />
              <Link
                href={productRoutes.category(ancestor.slug)}
                className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap"
              >
                {ancestor.name}
              </Link>
            </span>
          ))}
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
          <span className="text-fg font-medium truncate max-w-32 sm:max-w-xs">
            {product.name}
          </span>
        </nav>
      </Container>
    </div>
  );
}
