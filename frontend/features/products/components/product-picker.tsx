"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, Search, Package, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useProductsQuery } from "../queries";
import type { Product } from "../api";
import { Text } from "@/components/ui/typography";
import Image from "next/image";

interface ProductPickerProps {
  value?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ProductPicker({
  value,
  onChange,
  multiple = false,
  placeholder = "Select product...",
  className,
  disabled = false,
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useProductsQuery({
    search: searchTerm,
    limit: 10,
  });

  const products = data?.data || [];

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value ? [value as string] : [];
  }, [value, multiple]);

  const selectedProducts = useMemo(() => {
    // If we have selected items but they aren't in the current 'products' (from search),
    // we might need a way to fetch them. For a picker, usually we just show what's available.
    // In a real app, you'd fetch the specific products by their slugs.
    return products.filter((p) => selectedValues.includes(p.slug));
  }, [products, selectedValues]);

  const handleSelect = useCallback((productSlug: string | undefined) => {
    if (!productSlug) return;

    if (multiple) {
      const newValues = selectedValues.includes(productSlug)
        ? selectedValues.filter((s) => s !== productSlug)
        : [...selectedValues, productSlug];
      onChange?.(newValues.length > 0 ? newValues : undefined);
    } else {
      onChange?.(productSlug);
      setOpen(false);
    }
  }, [multiple, selectedValues, onChange]);

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple) {
      return `${selectedValues.length} products selected`;
    }
    const selected = products.find(p => p.slug === selectedValues[0]);
    return selected ? selected.name : placeholder;
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-11 px-4 rounded-lg",
              !value && "text-warm-gray-400 font-normal",
              value && "text-warm-gray-900 font-medium",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedValues.length === 1 && products.find(p => p.slug === selectedValues[0]) ? (
                <div className="relative w-5 h-5 rounded overflow-hidden">
                  <Image
                    src={products.find(p => p.slug === selectedValues[0])?.variants?.[0]?.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=50&h=50&fit=crop"}
                    alt="Product"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <Package className="w-4 h-4 text-warm-gray-300 shrink-0" />
              )}
              <span className="truncate">
                {getDisplayText()}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg shadow-2xl border border-warm-gray-100 bg-white overflow-hidden" align="start">
          <Command className="border-none bg-white" shouldFilter={false}>
            <div className="flex items-center border-b border-warm-gray-100 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
              <CommandInput
                placeholder="Search products..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-11 border-none focus:ring-0 placeholder:text-warm-gray-400"
              />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto p-1">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-warm-gray-400">Loading products...</div>
              ) : products.length === 0 ? (
                <CommandEmpty className="py-6 text-center">
                  <Text className="text-sm text-warm-gray-400 italic">No products found.</Text>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {products.map((product) => {
                    const isSelected = selectedValues.includes(product.slug);

                    return (
                      <CommandItem
                        key={product.id}
                        value={product.slug}
                        onSelect={() => handleSelect(product.slug)}
                        className={cn(
                          "rounded-lg cursor-pointer px-3 py-2.5 my-0.5 transition-colors",
                          isSelected ? "bg-primary-50" : "hover:bg-warm-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative w-10 h-10 rounded overflow-hidden border border-warm-gray-100 shrink-0">
                            <Image
                              src={product.variants?.[0]?.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className={cn(
                              "text-sm truncate",
                              isSelected ? "font-bold text-primary-700" : "font-medium text-warm-gray-700"
                            )}>
                              {product.name}
                            </Text>
                            <Text className="text-[10px] text-warm-gray-400 truncate block">
                              {product.currency} {product.variants?.[0]?.price}
                            </Text>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary-600 shrink-0" />}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Multiple Selection Badges */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedValues.map((slug) => {
            const product = products.find(p => p.slug === slug);
            return (
              <Badge
                key={slug}
                variant="secondary"
                className="bg-primary-50 text-primary-700 border-primary-100 px-2 py-1 flex items-center gap-1 rounded-lg animate-in fade-in zoom-in duration-200"
              >
                <span className="text-[10px] font-bold">{product?.name || slug}</span>
                <button
                  type="button"
                  className="hover:text-primary-900 transition-colors"
                  onClick={() => handleSelect(slug)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
