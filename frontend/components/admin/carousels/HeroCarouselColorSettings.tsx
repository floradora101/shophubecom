// Color configuration controls for hero carousel.
"use client";

import { useState } from "react";
import { Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CarouselType } from "@/lib/types/carousel.types";

interface HeroCarouselColorSettingsProps {
  type: CarouselType;
  onUpdate: (data: Partial<CarouselType>) => Promise<void>;
}

export function HeroCarouselColorSettings({
  type,
  onUpdate,
}: HeroCarouselColorSettingsProps) {
  const [backgroundColor, setBackgroundColor] = useState(
    type.backgroundColor || "#f3f4f6"
  );
  const [textColor, setTextColor] = useState(type.textColor || "#171717");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        backgroundColor,
        textColor,
      });
    } catch (error) {
      console.error("Failed to update carousel colors:", error);
      alert("Failed to update colors. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Hero Carousel Color Settings
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Customize the background and text colors for the hero carousel on the
        homepage.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#f3f4f6"
              className="flex-1"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This color will be used as the background for the hero carousel
            panels.
          </p>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              placeholder="#171717"
              className="flex-1"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This color will be used for text content in the hero carousel.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
        <div
          className="h-24 rounded-lg flex items-center justify-center transition-colors"
          style={{
            backgroundColor,
            color: textColor,
          }}
        >
          <span className="font-semibold">Hero Carousel Preview</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Colors
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
