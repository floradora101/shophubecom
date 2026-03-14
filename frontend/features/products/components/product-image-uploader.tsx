"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Images } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logError, extractErrorMessage } from "@/lib/errors";
import { useUploadThing } from "@/lib/uploadthing";
import { shouldUnoptimizeImage } from "@/lib/utils/image-helpers";

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

  // Use UploadThing for actual file uploads
  // Use variantMainImage for single image, variantGallery for multiple
  const uploadEndpoint = maxFiles === 1 ? "variantMainImage" : "variantGallery";
  const uploadErrorRef = useRef<string | null>(null);
  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(uploadEndpoint, {
    onUploadError: (e) => {
      uploadErrorRef.current = e.message;
    },
  });

  // Cleanup blob URLs to prevent memory leaks (for any legacy blob URLs)
  React.useEffect(() => {
    return () => {
      value.forEach(url => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [value]);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (disabled || isUploading || isUploadThingUploading) return;

      const remainingSlots = maxFiles - value.length;
      if (remainingSlots <= 0) {
        toast.error(`Maximum of ${maxFiles} images allowed.`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      // Validate files before upload
      const validFiles: File[] = [];
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

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        return;
      }

      setIsUploading(true);
      try {
        // Upload files using UploadThing
        const uploadedFiles = await startUpload(validFiles);

        if (uploadedFiles && uploadedFiles.length > 0) {
          // Use ufsUrl instead of url (url is deprecated in uploadthing v9)
          const uploadedUrls = uploadedFiles.map((file) => file.ufsUrl ?? file.url).filter(Boolean);

          // Filter out any existing blob URLs from value before adding new URLs
          const existingValidUrls = value.filter(url => url && !url.startsWith("blob:"));

          if (uploadedUrls.length > 0) {
            onChange?.([...existingValidUrls, ...uploadedUrls]);
            toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
          } else {
            throw new Error("No valid URLs returned from upload");
          }
        } else {
          const errMsg = uploadErrorRef.current;
          uploadErrorRef.current = null;
          throw new Error(
            errMsg || "No files were uploaded. Ensure you're logged in as admin and the backend is running."
          );
        }
      } catch (error: unknown) {
        logError(error, {
          component: "ProductImageUploader",
          action: "upload_image",
          metadata: {
            fileCount: validFiles.length,
            maxFiles,
            currentValueLength: value.length,
          },
        });

        // Provide more helpful error messages
        const errorMessage = extractErrorMessage(error, "Upload failed. Please try again.");
        let userMessage = errorMessage;

        if (errorMessage.includes("Forbidden") || errorMessage.includes("Admin")) {
          userMessage = "Only admin users can upload images. Please log in as an admin.";
        } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("No authentication")) {
          userMessage = "Please log in as an admin to upload images. If you are logged in, ensure the backend is running.";
        } else if (errorMessage.includes("UPLOADTHING_TOKEN") || errorMessage.includes("missing from environment")) {
          userMessage = "UploadThing is not configured. Add UPLOADTHING_TOKEN to .env.local. See .env.example.";
        } else if (errorMessage.includes("No files were uploaded") || errorMessage.includes("Failed to run middleware")) {
          userMessage = "Upload failed. Ensure you're logged in as admin and both frontend and backend servers are running.";
        }

        toast.error(userMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, isUploading, isUploadThingUploading, startUpload, value, maxFiles]
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
    // Clean up blob URLs if any
    if (urlToRemove && urlToRemove.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(urlToRemove);
      } catch (e) {
        // Ignore errors when revoking blob URLs
      }
    }
    const newImages = value.filter((_, index) => index !== indexToRemove);
    onChange?.(newImages);
  };

  const isDisabled = disabled || isUploading || isUploadThingUploading;

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
          {value.map((url, index) => {
            // Filter out blob URLs - they're temporary and shouldn't be displayed
            if (url && url.startsWith("blob:")) {
              return null;
            }

            // Use a stable key based on URL or index
            const imageKey = url || `image-${index}`;

            return (
              <div key={imageKey} className="relative group aspect-square">
                <div className="relative w-full h-full border border-warm-gray-200 rounded-lg overflow-hidden bg-warm-gray-50">
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized={shouldUnoptimizeImage(url)}
                    onError={(e) => {
                      console.error("Failed to load image:", url);
                      // Hide broken images
                      e.currentTarget.style.display = "none";
                    }}
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
            );
          })}
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
            {(isUploading || isUploadThingUploading) ? (
              <>
                <div className="flex justify-center mb-3">
                  <LoadingSpinner size="lg" variant="inline" />
                </div>
                <p className="text-sm text-warm-gray-600 font-medium">Uploading image(s)...</p>
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
