// Modern Variant Selector - Clean & Intuitive
"use client";

import { Check, X } from "lucide-react";

interface VariantSelectorProps {
  optionKeys: string[];
  allOptionValues: Record<string, { value: string; totalStock: number }[]>;
  selectedOptions: Record<string, string>;
  isUserSelectionComplete: boolean;
  isInvalidSelection: boolean;
  onOptionSelect: (key: string, value: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
  purple: "#8B5CF6",
  pink: "#EC4899",
  gray: "#6B7280",
  orange: "#F97316",
  brown: "#92400E",
  navy: "#1E40AF",
  silver: "#9CA3AF",
  gold: "#D97706",
};

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().replace(/\s+/g, "");
  return COLOR_MAP[normalized] || "#6B7280";
}

export function VariantSelector({
  optionKeys,
  allOptionValues,
  selectedOptions,
  isUserSelectionComplete,
  isInvalidSelection,
  onOptionSelect,
}: VariantSelectorProps) {
  if (!optionKeys.length) return null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Error Message - More prominent */}
      {isInvalidSelection && (
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
          <span className="text-sm sm:text-base text-red-700 font-medium">
            This combination is not available
          </span>
        </div>
      )}

      {/* Variant Options */}
      {optionKeys.map((key) => {
        const values = allOptionValues[key] || [];
        const selectedValue = selectedOptions[key];
        const isColorOption = key === "color";

        return (
          <div key={key} className="space-y-2 sm:space-y-3">
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                {key}
              </label>
              {selectedValue && (
                <span className="text-xs text-gray-500 font-medium truncate max-w-24 sm:max-w-none">
                  Selected: {selectedValue}
                </span>
              )}
            </div>

            {/* Option Values */}
            <div
              className={`flex flex-wrap gap-2 sm:gap-3 ${
                isColorOption ? "justify-start" : ""
              }`}
            >
              {values.map(({ value, totalStock }) => {
                const isSelected = selectedValue === value;
                const isOutOfStock = totalStock === 0;
                const isDisabled = isOutOfStock;

                if (isColorOption) {
                  // Enhanced Color Swatches
                  return (
                    <button
                      key={value}
                      onClick={() => !isDisabled && onOptionSelect(key, value)}
                      disabled={isDisabled}
                      className={`
                        group relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-2 transition-all duration-200 ease-in-out
                        ${
                          isSelected
                            ? "border-gray-900 ring-2 ring-gray-900/20 scale-110"
                            : "border-gray-300 hover:border-slate-400 hover:scale-105 active:scale-95"
                        }
                        ${
                          isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer hover:shadow-sm"
                        }
                      `}
                      aria-label={`Select ${value} color`}
                    >
                      <div
                        className="w-full h-full rounded-full border border-white/20"
                        style={{ backgroundColor: getColorHex(value) }}
                      />

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gray-900 rounded-full flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}

                      {/* Out of stock indicator */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                          <X className="h-3 w-3 sm:h-4 sm:w-4 text-white font-bold" />
                        </div>
                      )}

                      {/* Tooltip on hover - hide on mobile */}
                      <div className="hidden sm:block absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {value}
                        </div>
                      </div>
                    </button>
                  );
                } else {
                  // Modern Rectangle Buttons
                  return (
                    <button
                      key={value}
                      onClick={() => !isDisabled && onOptionSelect(key, value)}
                      disabled={isDisabled}
                      className={`
                        group relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200 ease-in-out
                        ${
                          isSelected
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                            : "border-gray-300 text-gray-700 hover:border-slate-400 hover:bg-gray-50 active:bg-slate-100"
                        }
                        ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed bg-slate-100"
                            : "cursor-pointer hover:shadow-sm"
                        }
                      `}
                    >
                      <span className="relative z-10 truncate max-w-20 sm:max-w-none">
                        {value}
                      </span>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-medium">
                            Sold out
                          </span>
                        </div>
                      )}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
