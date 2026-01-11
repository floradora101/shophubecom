"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus, Images } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductImageUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
  disabled?: boolean;
}

export function ProductImageUploader({
  value = [],
  onChange,
  maxFiles = 1,
  label,
  disabled = false,
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Cleanup blob URLs to prevent memory leaks
  React.useEffect(() => {
    return () => {
      value.forEach(url => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [value]);

  // Simulate upload like CategoryImageUploader
  const uploadFile = useCallback(async (file: File) => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a blob URL from the actual file
    const blobUrl = URL.createObjectURL(file);
    return blobUrl;
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (disabled || isUploading) return;

      const remainingSlots = maxFiles - value.length;
      if (remainingSlots <= 0) {
        toast.error(`Maximum of ${maxFiles} images allowed.`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      setIsUploading(true);
      try {
        const uploadedUrls: string[] = [];

        for (const file of filesToUpload) {
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} is not an image file.`);
            continue;
          }

          const maxSize = 8 * 1024 * 1024; // 8MB
          if (file.size > maxSize) {
            toast.error(`${file.name} is larger than 8MB.`);
            continue;
          }

          const url = await uploadFile(file);
          uploadedUrls.push(url);
        }

        if (uploadedUrls.length > 0) {
          onChange?.([...value, ...uploadedUrls]);
          toast.success(`${uploadedUrls.length} image(s) added!`);
        }
      } catch (error: any) {
        toast.error(`Upload failed: ${error.message || "Unknown error"}`);
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, isUploading, uploadFile, onChange, value, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect, disabled, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const removeImage = (indexToRemove: number) => {
    if (disabled) return;
    const urlToRemove = value[indexToRemove];
    if (urlToRemove && urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
    }
    const newImages = value.filter((_, index) => index !== indexToRemove);
    onChange?.(newImages);
  };

  const isDisabled = disabled || isUploading;

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-sm font-medium text-warm-gray-700 block">
          {label}
        </label>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={url + index} className="relative group aspect-square">
              <div className="relative w-full h-full border border-warm-gray-200 rounded-lg overflow-hidden bg-warm-gray-50">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  unoptimized={url.startsWith("blob:")}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-all flex flex-col items-center justify-center min-h-[160px]",
            isDisabled
              ? "border-warm-gray-200 bg-warm-gray-50 cursor-not-allowed"
              : "border-warm-gray-300 bg-warm-gray-50/50 hover:bg-warm-gray-50 hover:border-primary-300 cursor-pointer focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => {
            if (!isDisabled) {
              const input = document.getElementById(`file-upload-${label || 'product'}`) as HTMLInputElement;
              input?.click();
            }
          }}
        >
          <input
            id={`file-upload-${label || 'product'}`}
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            onChange={handleFileInputChange}
            className="sr-only"
            disabled={isDisabled}
          />

          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-10 w-10 text-primary-500 animate-spin mb-3" />
                <p className="text-sm text-warm-gray-600 font-medium">Adding image(s)...</p>
              </>
            ) : (
              <>
                {maxFiles > 1 ? (
                  <Images className="mx-auto h-10 w-10 text-warm-gray-400 mb-3" />
                ) : (
                  <Upload className="mx-auto h-10 w-10 text-warm-gray-400 mb-3" />
                )}
                <p className="text-sm text-warm-gray-600 font-medium mb-1">
                  {maxFiles > 1
                    ? `Click to add up to ${maxFiles - value.length} photos`
                    : "Click to add product photo"}
                </p>
                <p className="text-xs text-warm-gray-400">PNG, JPG up to 8MB</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
