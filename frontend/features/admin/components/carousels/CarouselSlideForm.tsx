// Form for creating or editing a carousel slide.
"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import type { CarouselSlide } from "@/features/admin/types";

interface CarouselSlideFormProps {
  slide?: CarouselSlide;
  carouselTypeId?: string;
  onSave: (data: Partial<CarouselSlide>) => Promise<void>;
  onCancel: () => void;
}

export function CarouselSlideForm({
  slide,
  carouselTypeId,
  onSave,
  onCancel,
}: CarouselSlideFormProps) {
  const isOffersCarousel = carouselTypeId === "carousel-3"; // Offers carousel

  const [formData, setFormData] = useState({
    title: slide?.title || "",
    description: slide?.description || "",
    image: slide?.image || "",
    ctaText: slide?.ctaText || "",
    ctaLink: slide?.ctaLink || "",
    productSlug: slide?.productSlug || "",
    isActive: slide?.isActive !== undefined ? slide.isActive : true,
    // Offers carousel specific fields
    badgeText: slide?.badgeText || "",
    mainTitle: slide?.mainTitle || "",
    leftBackgroundColor: slide?.leftBackgroundColor || "#fef3c7",
    rightBackgroundColor: slide?.rightBackgroundColor || "#dc2626",
    decorativeIcon: slide?.decorativeIcon || "",
    brandName: slide?.brandName || "",
    bundledItems: slide?.bundledItems || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newBundledItem, setNewBundledItem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, "Failed to save slide. Please try again.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., New iPhone 15 Pro"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
          placeholder="Brief description..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL <span className="text-red-500">*</span>
        </label>
        <Input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          placeholder="https://example.com/image.jpg"
        />
        {formData.image && (
          <div className="mt-2 relative h-32 w-full rounded-lg border border-gray-200 overflow-hidden">
            <Image
              src={formData.image}
              alt="Preview"
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized={
                formData.image.startsWith("data:") ||
                !formData.image.startsWith("http")
              }
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CTA Button Text
          </label>
          <Input
            value={formData.ctaText}
            onChange={(e) =>
              setFormData({ ...formData, ctaText: e.target.value })
            }
            placeholder="e.g., Shop Now"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CTA Link
          </label>
          <Input
            type="url"
            value={formData.ctaLink}
            onChange={(e) =>
              setFormData({ ...formData, ctaLink: e.target.value })
            }
            placeholder="/products/example"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Slug (optional)
        </label>
        <Input
          value={formData.productSlug}
          onChange={(e) =>
            setFormData({ ...formData, productSlug: e.target.value })
          }
          placeholder="product-slug"
        />
        <p className="mt-1 text-xs text-gray-500">
          Link to a specific product page
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Active
        </label>
      </div>

      {/* Offers Carousel Specific Fields */}
      {isOffersCarousel && (
        <>
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Offers Carousel Settings
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Text (e.g., &quot;Xmas Gifts&quot;, &quot;Summer Sale&quot;)
            </label>
            <Input
              value={formData.badgeText}
              onChange={(e) =>
                setFormData({ ...formData, badgeText: e.target.value })
              }
              placeholder="Xmas Gifts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Title (e.g., &quot;Christmas Offer!&quot;)
            </label>
            <Input
              value={formData.mainTitle}
              onChange={(e) =>
                setFormData({ ...formData, mainTitle: e.target.value })
              }
              placeholder="Christmas Offer!"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Left Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.leftBackgroundColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leftBackgroundColor: e.target.value,
                    })
                  }
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.leftBackgroundColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leftBackgroundColor: e.target.value,
                    })
                  }
                  placeholder="#fef3c7"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Right Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.rightBackgroundColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rightBackgroundColor: e.target.value,
                    })
                  }
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.rightBackgroundColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rightBackgroundColor: e.target.value,
                    })
                  }
                  placeholder="#dc2626"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decorative Icon (Emoji)
              </label>
              <Input
                value={formData.decorativeIcon}
                onChange={(e) =>
                  setFormData({ ...formData, decorativeIcon: e.target.value })
                }
                placeholder="🎅 or 🎄"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name (optional)
              </label>
              <Input
                value={formData.brandName}
                onChange={(e) =>
                  setFormData({ ...formData, brandName: e.target.value })
                }
                placeholder="Apple, Samsung, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bundled Items (Free items included)
            </label>
            <div className="space-y-2">
              {formData.bundledItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = formData.bundledItems.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, bundledItems: newItems });
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newBundledItem}
                  onChange={(e) => setNewBundledItem(e.target.value)}
                  placeholder="e.g., Free Powerbank 10,000mAh"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newBundledItem.trim()) {
                        setFormData({
                          ...formData,
                          bundledItems: [
                            ...formData.bundledItems,
                            newBundledItem.trim(),
                          ],
                        });
                        setNewBundledItem("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newBundledItem.trim()) {
                      setFormData({
                        ...formData,
                        bundledItems: [
                          ...formData.bundledItems,
                          newBundledItem.trim(),
                        ],
                      });
                      setNewBundledItem("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isSaving} className="flex-1">
          {isSaving ? "Saving..." : slide ? "Update Slide" : "Create Slide"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
