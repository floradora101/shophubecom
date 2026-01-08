/**
 * Category-specific Product Catalog Listing Page
 *
 * Shows products filtered by category using route parameter instead of query parameter.
 * URL format: /products/category/[category-slug]
 */
import type { Metadata } from "next";
import { CategoryProductsClient } from "./CategoryProductsClient";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;

  // Convert slug to readable title (e.g., "electronics" -> "Electronics")
  const categoryTitle = categorySlug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${categoryTitle} Products`,
    description: `Browse our collection of ${categoryTitle.toLowerCase()} products. Find quality items at competitive prices.`,
  };
}

export default async function CategoryProductsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categorySlug = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;

  return <CategoryProductsClient categorySlug={categorySlug} />;
}
