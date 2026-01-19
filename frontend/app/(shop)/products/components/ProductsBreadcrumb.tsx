/**
 * ProductsBreadcrumb Component
 *
 * Displays breadcrumb navigation for products and category pages.
 * Server component - renders static navigation breadcrumb from props.
 * Next.js Link component works in server components.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { Category } from "@/features/products/types";

interface ProductsBreadcrumbProps {
  isSearchResultsPage: boolean;
  currentCategory?: Category;
}

export function ProductsBreadcrumb({
  isSearchResultsPage,
  currentCategory,
}: ProductsBreadcrumbProps) {
  return (
    <div className="border-b border-border/60 bg-gray-50/30">
      <Container className="py-3">
        <nav
          className="flex items-center gap-2 text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-muted-fg hover:text-fg transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-fg" />
          {isSearchResultsPage ? (
            <>
              <Link
                href="/search"
                className="text-muted-fg hover:text-fg transition-colors"
              >
                Search
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-fg" />
              <span className="text-fg font-medium truncate max-w-xs">
                Results
              </span>
            </>
          ) : currentCategory ? (
            <>
              <Link
                href="/products"
                className="text-muted-fg hover:text-fg transition-colors"
              >
                Products
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-fg" />
              <span className="text-fg font-medium truncate max-w-xs">
                {currentCategory.name}
              </span>
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
