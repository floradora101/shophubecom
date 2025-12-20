// Filter controls for storefront product grid.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Category } from "../types";

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
  useEffect(() => {
    setLocalMin(priceRange.min.toString());
    setLocalMax(priceRange.max.toString());
  }, [priceRange.min, priceRange.max]);

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
          href={`/products?category=${cat.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onCategoryChange(cat.slug);
          }}
          className={`block text-sm py-1 transition-colors ${
            isActive
              ? "text-primary-500 font-medium"
              : "text-gray-600 hover:text-gray-900"
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
                  { ...child, children: (child as any).children },
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
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
          Stock Status
        </h3>
        <div className="w-10 h-0.5 bg-gray-300 mb-4"></div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => onStockFilterChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            Show In-Stock Products Only
          </span>
        </label>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
          Filter by Price
        </h3>
        <div className="w-10 h-0.5 bg-gray-300 mb-4"></div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="sr-only">Min price</label>
              <input
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <span className="text-gray-400">—</span>
            <div className="flex-1">
              <label className="sr-only">Max price</label>
              <input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <button
            onClick={handlePriceFilter}
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded hover:bg-gray-800 transition-colors"
          >
            FILTER
          </button>
        </div>
      </div>

      {/* Product Categories */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
          Product Categories
        </h3>
        <div className="w-10 h-0.5 bg-gray-300 mb-4"></div>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={`block w-full text-left text-sm py-1 transition-colors ${
                !selectedCategory
                  ? "text-primary-500 font-medium"
                  : "text-gray-600 hover:text-gray-900"
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

