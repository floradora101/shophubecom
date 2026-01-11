// Modern Purchase Panel - Clean 2026 Design
"use client";

import { Minus, Plus, Truck, RotateCcw, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { VariantSelector } from "./VariantSelector";
import type { Product, Category } from "@/features/products/types";
import { useState, useEffect } from "react";

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
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft({ hours, minutes });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, []);

  const safeQuantity = Math.min(
    quantity,
    effectiveStock > 0 ? effectiveStock : quantity
  );

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-[420px] sm:max-w-[520px] space-y-4 sm:space-y-6">
      {/* Price Block */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-fg">
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount && originalPrice && (
            <>
              <span className="relative text-base sm:text-lg text-muted-fg font-medium px-1.5 py-0.5 rounded-sm bg-linear-to-r from-surface-muted/50 to-transparent">
                {formatPrice(originalPrice)}
                {/* Modern diagonal strike-through */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-px bg-linear-to-r from-transparent via-slate-400 to-transparent transform rotate-12 origin-center opacity-80"></span>
                </span>
              </span>
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                -{discountPercent}%
              </Badge>
            </>
          )}
        </div>

        {/* Installments Badge */}
        <div className="flex items-center gap-2 mt-2">
          <div className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <span className="font-bold">Klarna.</span>
            <span>4 interest-free payments of {formatPrice(effectivePrice / 4)}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-fg leading-relaxed">
          VAT included. Shipping calculated at checkout.
        </p>
      </div>

      {/* Delivery Countdown */}
      {!isOutOfStock && !isUnavailable && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary-700">
            <Clock className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-semibold">
              Fast Delivery: Order within {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-primary-600/80 pl-6">
            Receive it by <span className="font-bold">{formattedDeliveryDate}</span>
          </p>
        </div>
      )}

      {/* Variant Selector */}
      <VariantSelector
        optionKeys={optionKeys}
        allOptionValues={allOptionValues}
        selectedOptions={selectedOptions}
        isUserSelectionComplete={isUserSelectionComplete}
        isInvalidSelection={isInvalidSelection}
        showSelectionError={showSelectionError}
        onOptionSelect={onOptionSelect}
      />

      {/* Quantity & Stock */}
      <div className="space-y-3 sm:space-y-4">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-fg min-w-fit">
            Quantity
          </span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-2 sm:px-2.5 py-2 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 sm:px-3 py-2 text-center min-w-8 sm:min-w-10 text-sm font-medium bg-surface-muted/50">
              {safeQuantity}
            </span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={effectiveStock > 0 && quantity >= effectiveStock}
              className="px-2 sm:px-2.5 py-2 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stock Status */}
        <div className="text-xs sm:text-sm leading-relaxed">
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
      <div className="space-y-4">
        <Button
          onClick={
            canAddToCart
              ? onAddToCart
              : optionKeys.length > 0 && !isUserSelectionComplete
              ? () => onAddToCart()
              : undefined
          }
          disabled={
            !canAddToCart && !(optionKeys.length > 0 && !isUserSelectionComplete)
          }
          variant={
            canAddToCart
              ? "destructive"
              : optionKeys.length > 0 && !isUserSelectionComplete
              ? "destructive"
              : "secondary"
          }
          className="w-full h-12 sm:h-14 text-base font-bold rounded-lg transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
          size="default"
        >
          {isOutOfStock
            ? "Notify me when available"
            : isUnavailable
            ? "Not Available"
            : optionKeys.length > 0 && !isUserSelectionComplete
            ? "Select Options"
            : "Add to Cart"}
        </Button>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Truck className="h-4 w-4 text-slate-600" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
              Free Shipping
            </span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <RotateCcw className="h-4 w-4 text-slate-600" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
              30-Day Returns
            </span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
              Secure Payment
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
