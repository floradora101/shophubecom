// Filter controls for storefront product grid.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productRoutes } from "@/lib/routes";
import type { Category } from "../types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showInStockOnly: boolean;
  onStockFilterChange: (value: boolean) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  showInStockOnly,
  onStockFilterChange,
  priceRange,
  onPriceRangeChange,
}: ProductFiltersProps) {
  const [localMin, setLocalMin] = useState(priceRange.min.toString());
  const [localMax, setLocalMax] = useState(priceRange.max.toString());

  // Sync local state when priceRange prop changes
  // Note: Using useEffect here is intentional to sync local state with props
  useEffect(() => {
    setLocalMin(priceRange.min.toString());
    setLocalMax(priceRange.max.toString());
  }, [priceRange.min, priceRange.max]); // eslint-disable-line react-hooks/set-state-in-effect

  const categoryTree = (() => {
    const nodeMap = new Map<string, Category & { children: Category[] }>();
    categories.forEach((cat) => nodeMap.set(cat.id, { ...cat, children: [] }));
    const roots: (Category & { children: Category[] })[] = [];
    nodeMap.forEach((cat) => {
      if (cat.parentId && nodeMap.has(cat.parentId)) {
        nodeMap.get(cat.parentId)!.children.push(cat);
      } else {
        roots.push(cat);
      }
    });
    return roots;
  })();

  const handlePriceFilter = () => {
    const min = parseFloat(localMin);
    const max = parseFloat(localMax);
    onPriceRangeChange({
      min: isNaN(min) ? 0 : min,
      max: isNaN(max) ? priceRange.max : max,
    });
  };

  const renderCategory = (
    cat: Category & { children?: Category[] },
    depth = 0
  ) => {
    const isActive = selectedCategory === cat.slug;
    return (
      <li key={cat.id} className="space-y-1">
        <Link
          href={productRoutes.category(cat.slug)}
          onClick={(e) => {
            e.preventDefault();
            onCategoryChange(cat.slug);
          }}
          className={`block text-sm py-1 transition-colors ${
            isActive
              ? "text-primary-500 font-medium"
              : "text-warm-gray-600 hover:text-primary-600"
          }`}
          style={{ paddingLeft: `${depth * 12}px` }}
        >
          {cat.name}
        </Link>
        {cat.children && cat.children.length > 0 ? (
          <ul className="space-y-1">
            {cat.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) =>
                renderCategory(
                  { ...child, children: child.children },
                  depth + 1
                )
              )}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <div className="space-y-8">
      {/* Stock Status */}
      <div>
        <h3 className="text-sm font-bold text-warm-gray-900 uppercase tracking-wide mb-3">
          Stock Status
        </h3>
        <div className="w-10 h-0.5 bg-warm-gray-300 mb-4"></div>
        <Checkbox
          checked={showInStockOnly}
          onChange={(e) => onStockFilterChange(e.target.checked)}
          label="Show In-Stock Products Only"
          className="text-sm text-warm-gray-700"
        />
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-bold text-warm-gray-900 uppercase tracking-wide mb-3">
          Filter by Price
        </h3>
        <div className="w-10 h-0.5 bg-warm-gray-300 mb-4"></div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
              />
            </div>
            <span className="text-warm-gray-400">—</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handlePriceFilter}
            className="w-full bg-warm-gray-900 text-white text-sm font-medium py-2.5 rounded hover:bg-warm-gray-800 transition-colors"
          >
            FILTER
          </button>
        </div>
      </div>

      {/* Product Categories */}
      <div>
        <h3 className="text-sm font-bold text-warm-gray-900 uppercase tracking-wide mb-3">
          Product Categories
        </h3>
        <div className="w-10 h-0.5 bg-warm-gray-300 mb-4"></div>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={`block w-full text-left text-sm py-1 transition-colors ${
                !selectedCategory
                  ? "text-primary-500 font-medium"
                  : "text-warm-gray-600 hover:text-primary-600"
              }`}
            >
              All Products
            </button>
          </li>
          {categoryTree
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => renderCategory(category, 0))}
        </ul>
      </div>
    </div>
  );
}
