"use client";

import React, { useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function CategoryFilters({
  search,
  onSearchChange,
  onReset,
}: CategoryFiltersProps) {
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
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}

