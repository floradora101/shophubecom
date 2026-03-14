"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, Search, X, Layers, FolderTree } from "lucide-react";
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
import type { Category } from "@/features/products/types";
import { Text } from "@/components/ui/typography";
import { useCategoriesQuery } from "../queries";
import { LoadingSpinner } from "@/components/ui/spinner";

interface CategoryPickerProps {
  value?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
  valueField?: "id" | "slug";
  multiple?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludeId?: string; // Prevent picking itself or its descendants as parent
}

interface CategoryOption extends Category {
  depth: number;
  path: string;
}

export function CategoryPicker({
  value,
  onChange,
  valueField = "id",
  multiple = false,
  placeholder = "Select parent category...",
  className,
  disabled = false,
  excludeId,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories from backend API
  // Use a high limit to get all categories for the picker
  const { data: categoriesResponse, isLoading, error } = useCategoriesQuery({
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });

  // Helper to get descendant IDs
  const getDescendantIds = React.useCallback((allCats: Category[], categoryId: string): string[] => {
    const descendants: string[] = [];
    const stack = [categoryId];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = allCats.filter(cat => cat.parentId === currentId);
      children.forEach(child => {
        descendants.push(child.id);
        stack.push(child.id);
      });
    }
    return descendants;
  }, []);

  // Extract categories from response and filter out excluded category and its descendants
  const categories = React.useMemo(() => {
    if (!categoriesResponse?.data) return [];

    let filteredData = categoriesResponse.data;

    // Filter out the current category and its descendants to prevent cycles
    if (excludeId) {
      const descendants = getDescendantIds(categoriesResponse.data, excludeId);
      filteredData = categoriesResponse.data.filter(
        cat => cat.id !== excludeId && !descendants.includes(cat.id)
      );
    }

    return filteredData;
  }, [categoriesResponse?.data, excludeId, getDescendantIds]);

  // Build hierarchical options
  const categoryOptions = useMemo(() => {
    const buildOptions = (
      cats: Category[],
      parentId: string | null = null,
      depth = 0,
      path: string[] = []
    ): CategoryOption[] => {
      const result: CategoryOption[] = [];

      cats
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .forEach(cat => {
          const currentPath = [...path, cat.name];
          const option: CategoryOption = {
            ...cat,
            depth,
            path: currentPath.join(" › "),
          };

          result.push(option);
          result.push(...buildOptions(cats, cat.id, depth + 1, currentPath));
        });

      return result;
    };

    return buildOptions(categories);
  }, [categories]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return categoryOptions;

    return categoryOptions.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryOptions, searchTerm]);

  const selectedValues = useMemo((): string[] => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value ? (typeof value === 'string' ? [value] : []) : [];
  }, [value, multiple]);

  const selectedOptions = useMemo(() => {
    return categoryOptions.filter(option => selectedValues.includes(option[valueField]));
  }, [categoryOptions, selectedValues, valueField]);

  const handleSelect = useCallback((optionId: string | undefined) => {
    // If we're looking for slugs but were passed an ID by some CommandItem value,
    // we need to find the actual slug. But CommandItem onSelect passes the value prop of CommandItem.
    // In our case CommandItem value is option.path, but onSelect is called with no args?
    // Wait, onSelect in CommandItem is usually () => handleSelect(option.id).

    if (multiple) {
      if (!optionId) return;
      const newValues = selectedValues.includes(optionId)
        ? selectedValues.filter(id => id !== optionId)
        : [...selectedValues, optionId];

      onChange?.(newValues.length > 0 ? newValues : undefined);
    } else {
      onChange?.(optionId);
      setOpen(false);
    }
  }, [multiple, selectedValues, onChange]);

  const getDisplayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }

    if (multiple) {
      if (selectedOptions.length === 1) {
        return selectedOptions[0].name;
      }
      return `${selectedOptions.length} categories`;
    }

    return selectedOptions[0]?.path || placeholder;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <Button
          variant="outline"
          disabled
          className={cn(
            "w-full justify-between h-11 px-4 rounded-lg",
            "text-warm-gray-400 font-normal",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" variant="inline" />
            <span>Loading categories...</span>
          </div>
        </Button>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <Button
          variant="outline"
          disabled
          className={cn(
            "w-full justify-between h-11 px-4 rounded-lg",
            "text-red-400 font-normal",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 shrink-0" />
            <span>Failed to load categories</span>
          </div>
        </Button>
      </div>
    );
  }

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
              !selectedOptions.length && "text-warm-gray-400 font-normal",
              selectedOptions.length > 0 && "text-warm-gray-900 font-medium",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            disabled={disabled || isLoading}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedOptions.length > 0 ? (
                <FolderTree className="w-4 h-4 text-primary-500 shrink-0" />
              ) : (
                <Layers className="w-4 h-4 text-warm-gray-300 shrink-0" />
              )}
              <span className="truncate">{getDisplayText()}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg shadow-2xl border border-warm-gray-100 bg-white overflow-hidden" align="start">
          <Command className="border-none bg-white">
            <div className="flex items-center border-b border-warm-gray-100 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
              <CommandInput
                placeholder="Search categories..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-11 border-none focus:ring-0 placeholder:text-warm-gray-400"
              />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto p-1">
              <CommandEmpty className="py-6 text-center">
                <Text className="text-sm text-warm-gray-400 italic">
                  {categories.length === 0
                    ? "No categories available."
                    : "No categories found matching your search."}
                </Text>
              </CommandEmpty>
              <CommandGroup>
                {!multiple && (
                  <CommandItem
                    value="none-root"
                    onSelect={() => handleSelect(undefined)}
                    className="rounded-lg cursor-pointer px-3 py-2 text-sm text-warm-gray-500 hover:bg-warm-gray-50"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-4 h-4" /> {/* Spacer */}
                      <span className="italic">None (Set as Main)</span>
                      {!value && <Check className="ml-auto h-4 w-4 text-primary-600" />}
                    </div>
                  </CommandItem>
                )}

                {filteredOptions.map((option) => {
                  const val = option[valueField];
                  const isSelected = val ? selectedValues.includes(val) : false;
                  const indent = option.depth * 16;

                  return (
                    <CommandItem
                      key={option.id}
                      value={option.path}
                      onSelect={() => handleSelect(val)}
                      className={cn(
                        "rounded-lg cursor-pointer px-3 py-2.5 my-0.5 transition-colors",
                        isSelected ? "bg-primary-50" : "hover:bg-warm-gray-50"
                      )}
                    >
                      <div
                        className="flex items-center gap-2 w-full"
                        style={{ paddingLeft: `${indent}px` }}
                      >
                        {option.depth > 0 ? (
                           <div className="w-4 h-4 border-l-2 border-b-2 border-warm-gray-200 rounded-bl-md -mt-2 mr-1" />
                        ) : (
                          <Layers className={cn("w-4 h-4 shrink-0", isSelected ? "text-primary-500" : "text-warm-gray-300")} />
                        )}

                        <div className="flex-1 min-w-0">
                          <Text className={cn(
                            "text-sm truncate",
                            isSelected ? "font-bold text-primary-700" : "font-medium text-warm-gray-700"
                          )}>
                            {option.name}
                          </Text>
                          {searchTerm && option.depth > 0 && (
                            <Text className="text-[10px] text-warm-gray-400 truncate block">
                              in {option.path.split(' › ').slice(0, -1).join(' › ')}
                            </Text>
                          )}
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary-600 shrink-0" />}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Multiple Selection Badges */}
      {multiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="bg-primary-50 text-primary-700 border-primary-100 px-2 py-1 flex items-center gap-1 rounded-lg animate-in fade-in zoom-in duration-200"
            >
              <span className="text-[10px] font-bold">{option.name}</span>
              <button
                type="button"
                className="hover:text-primary-900 transition-colors"
                onClick={() => handleSelect(option.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
