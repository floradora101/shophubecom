/**
 * Filters Sidebar Component
 *
 * Desktop sticky sidebar with collapsible filter groups:
 * - Category
 * - Price Range
 * - Availability
 * - Seller Information
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ChevronDown,
  Truck,
  Phone,
  RefreshCw,
  Package,
} from "lucide-react";
import { Stack } from "@/components/ui/stack";
import { theme } from "../../../../lib/config/theme";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/features/products/types";

// Smart filter insights based on common user behavior
const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25, popular: true },
  { label: "$25 - $50", min: 25, max: 50, popular: false },
  { label: "$50 - $100", min: 50, max: 100, popular: true },
  { label: "$100 - $200", min: 100, max: 200, popular: false },
  { label: "Over $200", min: 200, max: 10000, popular: false },
];

interface FiltersSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
}

export function FiltersSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
}: FiltersSidebarProps) {
  // Initialize local state from props
  const [localMin, setLocalMin] = useState(() => priceRange.min.toString());
  const [localMax, setLocalMax] = useState(() => priceRange.max.toString());

  // Dropdown states - all closed by default
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isSellerInfoOpen, setIsSellerInfoOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Reset local state when priceRange prop changes externally

  useEffect(() => {
    setLocalMin(priceRange.min.toString());
    setLocalMax(priceRange.max.toString());
  }, [priceRange.min, priceRange.max]);

  // Build category tree
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
      min: isNaN(min) || min < 0 ? 0 : min,
      max: isNaN(max) || max < priceRange.min ? priceRange.max : max,
    });
  };

  const renderCategory = (
    cat: Category & { children?: Category[] },
    depth = 0
  ) => {
    const isActive = selectedCategory === cat.slug;
    return (
      <li key={cat.id} className="space-y-1">
        <button
          onClick={() => onCategoryChange(cat.slug)}
          className={cn(
            "block w-full text-left text-sm py-1.5 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded",
            isActive
              ? "text-primary-600 font-medium"
              : cn(theme.text.body, "hover:text-primary-600")
          )}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {cat.name}
        </button>
        {cat.children && cat.children.length > 0 && (
          <ul className="space-y-1">
            {cat.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) =>
                renderCategory(
                  child as Category & { children?: Category[] },
                  depth + 1
                )
              )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <Stack spacing="xl" className="sticky top-24 self-start">
      {/* Category Filter Dropdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left",
            "bg-slate-50 hover:bg-slate-100 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          )}
          aria-expanded={isCategoryOpen}
        >
          <span className="text-sm font-semibold text-warm-gray-900 uppercase tracking-wide">
            Categories
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-600 transition-transform duration-200",
              isCategoryOpen && "rotate-180"
            )}
          />
        </button>

        {isCategoryOpen && (
          <div className="px-4 pb-4 bg-white">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onCategoryChange(null)}
                  className={cn(
                    "block w-full text-left text-sm py-1.5 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded",
                    !selectedCategory
                      ? "text-primary-600 font-medium"
                      : cn(theme.text.body, "hover:text-primary-600")
                  )}
                >
                  All Products
                </button>
              </li>
              {categoryTree
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => renderCategory(category, 0))}
            </ul>
          </div>
        )}
      </div>

      {/* Price Range Filter Dropdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left",
            "bg-slate-50 hover:bg-slate-100 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          )}
          aria-expanded={isPriceOpen}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-warm-gray-900 uppercase tracking-wide">
              Price Range
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-600 transition-transform duration-200",
              isPriceOpen && "rotate-180"
            )}
          />
        </button>

        {isPriceOpen && (
          <div className="px-4 pb-4 bg-white space-y-4">
            {/* Quick Price Presets */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-warm-gray-600 uppercase tracking-wide">
                Quick Select
              </div>
              <div className="grid grid-cols-1 gap-1">
                {PRICE_RANGES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      onPriceRangeChange({ min: preset.min, max: preset.max })
                    }
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-200",
                      "hover:bg-primary-50 hover:border-primary-200 border border-transparent",
                      preset.popular && "relative"
                    )}
                  >
                    <span className="text-warm-gray-700 group-hover:text-primary-600">
                      {preset.label}
                    </span>
                    {preset.popular && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-600"
                      >
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-warm-gray-600 uppercase tracking-wide">
                Custom Range
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="min-price" className="sr-only">
                      Minimum price
                    </label>
                    <input
                      id="min-price"
                      type="number"
                      placeholder="Min"
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 text-sm",
                        theme.border.base,
                        theme.radius.card,
                        "bg-white",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        "placeholder:text-warm-gray-400"
                      )}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <span className={cn(theme.text.muted, "text-sm")}>—</span>
                  <div className="flex-1">
                    <label htmlFor="max-price" className="sr-only">
                      Maximum price
                    </label>
                    <input
                      id="max-price"
                      type="number"
                      placeholder="Max"
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 text-sm",
                        theme.border.base,
                        theme.radius.card,
                        "bg-white",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        "placeholder:text-warm-gray-400"
                      )}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePriceFilter}
                  size="sm"
                  className="w-full"
                  aria-label="Apply price filter"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Filter Dropdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left",
            "bg-slate-50 hover:bg-slate-100 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          )}
          aria-expanded={isAvailabilityOpen}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-warm-gray-900 uppercase tracking-wide">
              Availability
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-600 transition-transform duration-200",
              isAvailabilityOpen && "rotate-180"
            )}
          />
        </button>

        {isAvailabilityOpen && (
          <div className="px-4 pb-4 bg-white">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => onInStockChange(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded",
                    theme.border.base,
                    "text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  )}
                  aria-label="Show only in-stock products"
                />
                <span
                  className={cn(
                    theme.text.body,
                    "text-sm group-hover:text-warm-gray-900"
                  )}
                >
                  In Stock Only
                </span>
              </label>

              <div className="text-xs text-slate-600">
                <p>Products with immediate availability</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seller Information Dropdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden -mt-1">
        <button
          onClick={() => setIsSellerInfoOpen(!isSellerInfoOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left",
            "bg-slate-50 hover:bg-slate-100 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          )}
          aria-expanded={isSellerInfoOpen}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-warm-gray-900 uppercase tracking-wide">
              Store Policies
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-600 transition-transform duration-200",
              isSellerInfoOpen && "rotate-180"
            )}
          />
        </button>

        {isSellerInfoOpen && (
          <div className="px-4 pt-4 pb-4 bg-white space-y-2">
            {/* Free Shipping */}
            <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg border border-primary-200/50">
              <Truck className="w-5 h-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-700">
                  Free Shipping
                </p>
                <p className="text-xs text-primary-600">On orders over $50</p>
              </div>
            </div>

            {/* Same Day Delivery */}
            <div className="flex items-center gap-3 p-4 bg-primary-100 rounded-lg border border-primary-300/50">
              <Truck className="w-5 h-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-800">
                  Same Day Delivery
                </p>
                <p className="text-xs text-primary-700">Inside Beirut area</p>
              </div>
            </div>

            {/* Exchange Policy */}
            <div className="flex items-center gap-3 p-4 bg-primary-200 rounded-lg border border-primary-400/50">
              <RefreshCw className="w-5 h-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-900">
                  Easy Exchange
                </p>
                <p className="text-xs text-primary-800">30-day return policy</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Us Dropdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden -mt-1">
        <button
          onClick={() => setIsContactOpen(!isContactOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left",
            "bg-slate-50 hover:bg-slate-100 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          )}
          aria-expanded={isContactOpen}
        >
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-warm-gray-900 uppercase tracking-wide">
              Contact Us
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-600 transition-transform duration-200",
              isContactOpen && "rotate-180"
            )}
          />
        </button>

        {isContactOpen && (
          <div className="px-4 pt-4 pb-4 bg-white space-y-2">
            {/* Phone Contact */}
            <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg border border-primary-200/50">
              <Phone className="w-5 h-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-700">
                  Phone Support
                </p>
                <p className="text-xs text-primary-600 font-mono">
                  +961 3 123 456
                </p>
              </div>
            </div>

            {/* Email Contact */}
            <div className="flex items-center gap-3 p-4 bg-primary-100 rounded-lg border border-primary-300/50">
              <svg
                className="w-5 h-5 text-primary-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-primary-800">
                  Email Support
                </p>
                <p className="text-xs text-primary-700">support@shophub.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Stack>
  );
}
