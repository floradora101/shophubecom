/**
 * ProductsBreadcrumb Component
 *
 * Displays breadcrumb navigation for products and category pages.
 * Supports nested categories: Home > Products > Parent > Child
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { productRoutes } from "@/lib/routes";
import { getCategoryAncestry } from "@/lib/utils/breadcrumb";
import type { Category } from "@/features/products/types";

interface ProductsBreadcrumbProps {
  isSearchResultsPage: boolean;
  isDealsPage?: boolean;
  currentCategory?: Category;
  /** Flat list of all categories for ancestry lookup (nested breadcrumbs) */
  categories?: Category[];
}

export function ProductsBreadcrumb({
  isSearchResultsPage,
  isDealsPage,
  currentCategory,
  categories = [],
}: ProductsBreadcrumbProps) {
  const categoryAncestry = currentCategory
    ? getCategoryAncestry(currentCategory, categories)
    : [];

  return (
    <div className="border-b border-border/60 bg-gray-50/30">
      <Container className="py-3">
        <nav
          className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-fg shrink-0" />
          {isSearchResultsPage ? (
            <>
              <Link
                href="/search"
                className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
              >
                Search
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-fg shrink-0" />
              <span className="text-fg font-medium truncate max-w-xs">
                Results
              </span>
            </>
          ) : isDealsPage ? (
            <>
              <Link
                href={productRoutes.list()}
                className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
              >
                Products
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-fg shrink-0" />
              <span className="text-fg font-medium truncate max-w-xs">
                Deals
              </span>
            </>
          ) : categoryAncestry.length > 0 ? (
            <>
              <Link
                href={productRoutes.list()}
                className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
              >
                Products
              </Link>
              {categoryAncestry.map((ancestor, i) => {
                const isLast = i === categoryAncestry.length - 1;
                return (
                  <span key={ancestor.id} className="flex items-center gap-2 shrink-0">
                    <ChevronRight className="h-4 w-4 text-muted-fg" />
                    {isLast ? (
                      <span className="text-fg font-medium truncate max-w-xs">
                        {ancestor.name}
                      </span>
                    ) : (
                      <Link
                        href={productRoutes.category(ancestor.slug)}
                        className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap"
                      >
                        {ancestor.name}
                      </Link>
                    )}
                  </span>
                );
              })}
            </>
          ) : (
            <span className="text-fg font-medium truncate max-w-xs">
              Products
            </span>
          )}
        </nav>
      </Container>
    </div>
  );
}
