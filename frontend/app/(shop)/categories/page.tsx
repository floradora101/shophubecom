/**
 * Categories Listing Page
 *
 * Premium 2026 ecommerce style showing all main categories in a grid.
 */
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { SectionTitle } from "@/components/home/shared/section-header";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { getMainCategories } from "@/lib/data/categories";
import { LoadingSpinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Shop by Category",
  description: "Browse our products by category to find exactly what you're looking for.",
};

async function CategoriesContent() {
  const categories = await getMainCategories();

  return (
    <div className="min-h-screen py-10 md:py-16">
      <Container>
        <Stack spacing="xl">
          {/* Header */}
          <div className="space-y-4 text-center md:text-left animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-bold uppercase tracking-widest">
              <span>Our Collections</span>
            </div>
            <SectionTitle variant="large" italic="Shop by" bold="Category" />
            <p className="text-warm-gray-600 max-w-2xl text-lg font-light leading-relaxed">
              Explore our wide range of tech categories and find the perfect hardware for your needs.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
