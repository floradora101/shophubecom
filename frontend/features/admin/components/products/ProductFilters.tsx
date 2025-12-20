"use client";

import React, { useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategoriesQuery } from "@/features/categories/queries";

interface ProductFiltersProps {
  search: string;
  categoryId: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

export function ProductFilters({
  search,
  categoryId,
  onSearchChange,
  onCategoryChange,
  onReset,
}: ProductFiltersProps) {
  // Fetch categories from backend using same pattern as storefront
  const { data: categoriesData } = useCategoriesQuery();
  const categories = useMemo(
    () => (Array.isArray(categoriesData) ? categoriesData : []),
    [categoriesData]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or slug"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
