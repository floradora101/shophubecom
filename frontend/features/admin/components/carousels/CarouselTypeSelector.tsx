// Selector for choosing carousel type or layout.
"use client";

import type { CarouselType } from "@/features/admin/types";

interface CarouselTypeSelectorProps {
  types: CarouselType[];
  selectedTypeId: string | null;
  onSelect: (typeId: string) => void;
}

export function CarouselTypeSelector({
  types,
  selectedTypeId,
  onSelect,
}: CarouselTypeSelectorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Select Carousel Type
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              selectedTypeId === type.id
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-gray-900">{type.name}</div>
            {type.description && (
              <div className="text-xs text-gray-500 mt-1">
                {type.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
