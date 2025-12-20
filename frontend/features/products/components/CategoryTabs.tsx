// Homepage category tabs with featured items.
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";
import { orderByAvailability } from "@/features/products/utils/inventory";

interface Tab {
  id: string;
  label: string;
}

interface CategoryTabsProps {
  title: string;
  tabs: Tab[];
  products: Product[];
  className?: string;
}

export function CategoryTabs({
  title,
  tabs,
  products,
  className = "",
}: CategoryTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "all");

  // Filter products based on active tab by brand name
  // STRICT MODE: Only show products where category name EXACTLY matches the brand
  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => {
          const tabLower = activeTab.toLowerCase();

          // PRIMARY CHECK: Category name must exactly match brand (STRICT - this is the main check)
          // Based on seed data: category names are "Apple", "Samsung", "Honor", etc.
          const categoryName = p.category?.name?.toLowerCase() || "";
          if (categoryName === tabLower) {
            return true;
          }

          // SECONDARY CHECK: Category slug ends with brand (e.g., "phones-apple" ends with "-apple")
          // This handles cases where slug format is "phones-apple", "phones-samsung", etc.
          const categorySlug = p.category?.slug?.toLowerCase() || "";
          if (categorySlug && categorySlug.endsWith(`-${tabLower}`)) {
            return true;
          }

          // That's it - no product name fallback to ensure strict category-based filtering
          return false;
        });

  // Use filtered products directly - don't fallback to all products
  // If filter returns empty, show empty (don't show all products)
  const orderedProducts = orderByAvailability(filteredProducts);

  if (products.length === 0) {
    return null;
  }

  // If no products match the filter, show empty state
  if (filteredProducts.length === 0 && activeTab !== "all") {
    return (
      <section className={`py-10 ${className}`}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Header with Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {title}
            </h2>
            <div className="mt-2 mx-auto w-16 h-1 bg-primary-500 rounded-full"></div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap justify-center gap-2 md:gap-0 md:border md:border-gray-200 md:rounded-lg overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 md:px-6 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 md:border-0"
                  } rounded-lg md:rounded-none`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <p className="text-gray-600">
              No {tabs.find((t) => t.id === activeTab)?.label || "products"}{" "}
              found.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-10 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header with Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-wide">
            {title}
          </h2>
          <div className="mt-2 mx-auto w-16 h-1 bg-primary-500 rounded-full"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap justify-center gap-2 md:gap-0 md:border md:border-gray-200 md:rounded-lg overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 md:border-0"
                } rounded-lg md:rounded-none`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Title & Browse All */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 uppercase">
              {tabs.find((t) => t.id === activeTab)?.label || title}&apos;s
            </h3>
            <div className="mt-1 w-12 h-0.5 bg-primary-500"></div>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {orderedProducts.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
