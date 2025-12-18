// Homepage category tabs with featured items.
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/lib/types/product.types";
import { orderByAvailability } from "@/lib/utils/inventory";

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

  // Filter products based on active tab (simulate filtering by name/brand)
  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(activeTab.toLowerCase()) ||
            p.description?.toLowerCase().includes(activeTab.toLowerCase())
        );

  // If no filtered results, show all products
  const displayProducts =
    filteredProducts.length > 0 ? filteredProducts : products;
  const orderedProducts = orderByAvailability(displayProducts);

  if (products.length === 0) {
    return null;
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
