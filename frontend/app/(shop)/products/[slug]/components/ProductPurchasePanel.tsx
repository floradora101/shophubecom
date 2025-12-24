// Modern Purchase Panel - Clean 2026 Design
"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { VariantSelector } from "./VariantSelector";
import type { Product, Category } from "@/features/products/types";

interface ProductPurchasePanelProps {
  product: Product;
  category: Category | null;
  selectedVariant: {
    id?: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    options?: Record<string, string>;
  } | null;
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  originalPrice?: number;
  isOutOfStock: boolean;
  isUnavailable: boolean;
  effectiveStock: number;
  canAddToCart: boolean;
  quantity: number;
  optionKeys: string[];
  allOptionValues: Record<string, { value: string; totalStock: number }[]>;
  selectedOptions: Record<string, string>;
  isUserSelectionComplete: boolean;
  isInvalidSelection: boolean;
  showSelectionError: boolean;
  onOptionSelect: (key: string, value: string) => void;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
}

export function ProductPurchasePanel({
  product,
  category,
  selectedVariant,
  effectivePrice,
  hasDiscount,
  discountPercent,
  originalPrice,
  isOutOfStock,
  isUnavailable,
  effectiveStock,
  canAddToCart,
  quantity,
  optionKeys,
  allOptionValues,
  selectedOptions,
  isUserSelectionComplete,
  isInvalidSelection,
  showSelectionError,
  onOptionSelect,
  onQuantityChange,
  onAddToCart,
}: ProductPurchasePanelProps) {
  const safeQuantity = Math.min(
    quantity,
    effectiveStock > 0 ? effectiveStock : quantity
  );

  return (
    <div className="space-y-6">
      {/* Brand Line */}
      <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">
        ShopHub
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Price Block */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-slate-900">
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount && originalPrice && (
            <>
              <span className="text-lg text-slate-500 line-through">
                {formatPrice(originalPrice)}
              </span>
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            </>
          )}
        </div>
        <p className="text-sm text-slate-500">
          VAT included. Shipping calculated at checkout.
        </p>
      </div>

      {/* Variant Selector */}
      <VariantSelector
        optionKeys={optionKeys}
        allOptionValues={allOptionValues}
        selectedOptions={selectedOptions}
        isUserSelectionComplete={isUserSelectionComplete}
        isInvalidSelection={isInvalidSelection}
        onOptionSelect={onOptionSelect}
      />

      {/* Quantity & Stock */}
      <div className="space-y-4">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-900">Quantity</span>
          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
            <button
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-2.5 py-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 py-2 text-center min-w-10 text-sm font-medium bg-slate-50/50">
              {safeQuantity}
            </span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={effectiveStock > 0 && quantity >= effectiveStock}
              className="px-2.5 py-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stock Status */}
        <div className="text-sm">
          {isOutOfStock ? (
            <span className="text-red-600 font-medium">Out of stock</span>
          ) : isUnavailable ? (
            <span className="text-red-600 font-medium">Not available</span>
          ) : effectiveStock <= 5 ? (
            <span className="text-orange-600 font-medium">
              Only {effectiveStock} left in stock
            </span>
          ) : (
            <span className="text-green-600 font-medium">In stock</span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={canAddToCart ? onAddToCart : undefined}
        disabled={!canAddToCart}
        className="px-6 py-2 h-10 text-sm font-medium rounded-lg"
        size="default"
      >
        {isOutOfStock
          ? "Notify me"
          : isUnavailable
          ? "Not Available"
          : "Add to Cart"}
      </Button>
    </div>
  );
}
