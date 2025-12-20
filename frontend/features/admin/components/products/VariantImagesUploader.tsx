"use client";

import React from "react";
import { toast } from "sonner";
import { UploadDropzone } from "@/features/admin/uploadthing";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import type { ProductFormData } from "@/features/products/schemas";
import type { ClientUploadedFileData } from "uploadthing/types";

interface VariantImagesUploaderProps {
  variantIndex: number;
  mainImage: string | undefined;
  galleryImages: string[] | undefined;
  setValue: UseFormSetValue<ProductFormData>;
  trigger: UseFormTrigger<ProductFormData>;
}

function extractUrl(file: ClientUploadedFileData<{ url: string }>): string {
  return (file as { ufsUrl?: string }).ufsUrl ?? file.serverData?.url ?? "";
}

function triggerValidation(
  trigger: UseFormTrigger<ProductFormData>,
  variantIndex: number
) {
  setTimeout(() => {
    trigger(`variants.${variantIndex}` as const).catch(() => {
      // Validation errors are handled by form state
    });
  }, 100);
}

export function VariantImagesUploader({
  variantIndex,
  mainImage,
  galleryImages,
  setValue,
  trigger,
}: VariantImagesUploaderProps) {
  // Normalize gallery images array
  const normalizedGallery: string[] = React.useMemo(() => {
    if (!galleryImages) return [];
    if (Array.isArray(galleryImages)) {
      return galleryImages.filter(
        (img): img is string => typeof img === "string" && img.trim().length > 0
      );
    }
    return [];
  }, [galleryImages]);

  const handleMainImageUpload = (
    res: ClientUploadedFileData<{ url: string }>[]
  ) => {
    const url = res?.[0] ? extractUrl(res[0]) : "";
    if (!url) return;

    setValue(`variants.${variantIndex}.image`, url, {
      shouldDirty: true,
      shouldValidate: true,
    });
    triggerValidation(trigger, variantIndex);
  };

  const handleRemoveMainImage = () => {
    setValue(`variants.${variantIndex}.image`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    triggerValidation(trigger, variantIndex);
  };

  const handleGalleryUpload = (
    res: ClientUploadedFileData<{ url: string }>[]
  ) => {
    if (!res?.length) return;

    const newUrls = res
      .map(extractUrl)
      .filter((url): url is string => url.length > 0);

    if (!newUrls.length) return;

    const updated = [...normalizedGallery, ...newUrls];
    setValue(`variants.${variantIndex}.images`, updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
    triggerValidation(trigger, variantIndex);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const updated = normalizedGallery.filter((_, idx) => idx !== indexToRemove);
    setValue(`variants.${variantIndex}.images`, updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
    triggerValidation(trigger, variantIndex);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Image <span className="text-red-500">*</span>
        </label>
        {mainImage ? (
          <div className="relative inline-block">
            {/* Using <img> instead of Next/Image to avoid optimizer 500s during dev */}
            <div className="relative w-32 h-32 rounded-lg border border-gray-300 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage}
                alt="Variant main image"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 hover:bg-red-600"
              onClick={handleRemoveMainImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <UploadDropzone
              endpoint="variantMainImage"
              onClientUploadComplete={handleMainImageUpload}
              onUploadError={(error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
              className="ut-label:text-sm ut-allowed-content:text-xs"
            />
          </div>
        )}
      </div>

      {/* Gallery Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gallery Images (optional)
        </label>
        {normalizedGallery.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {normalizedGallery.map((url, idx) => (
              <div key={idx} className="relative">
                {/* Using <img> instead of Next/Image to avoid optimizer 500s during dev */}
                <div className="relative w-24 h-24 rounded-lg border border-gray-300 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-red-500 hover:bg-red-600"
                  onClick={() => handleRemoveGalleryImage(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <UploadDropzone
          endpoint="variantGallery"
          onClientUploadComplete={handleGalleryUpload}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
          className="ut-label:text-sm ut-allowed-content:text-xs"
        />
        <p className="mt-1 text-xs text-gray-500">
          You can upload up to 8 images. Each image can be up to 8MB.
        </p>
      </div>
    </div>
  );
}
