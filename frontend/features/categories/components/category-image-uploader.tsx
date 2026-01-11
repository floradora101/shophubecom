"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CategoryImageUploaderProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function CategoryImageUploader({
  value,
  onChange,
  className,
  disabled = false,
}: CategoryImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  console.log("CategoryImageUploader rendered with value:", value);

  // Cleanup blob URLs to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (value && value.startsWith("blob:")) {
        URL.revokeObjectURL(value);
      }
    };
  }, [value]);

  // For debugging - create a blob URL to show the actual uploaded image
  const uploadFile = useCallback(async (file: File) => {
    console.log(
      "Starting upload for file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type
    );

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a blob URL from the actual file to show the real image
    const blobUrl = URL.createObjectURL(file);
    console.log("Upload successful, created blob URL:", blobUrl);

    return blobUrl;
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (disabled || isUploading) return;

      const file = files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      // Validate file size (8MB limit as per UploadThing config)
      const maxSize = 8 * 1024 * 1024; // 8MB
      if (file.size > maxSize) {
        toast.error("Please select an image smaller than 8MB.");
        return;
      }

      setIsUploading(true);
      console.log("Starting image upload process...");

      try {
        const uploadedUrl = await uploadFile(file);
        console.log("Upload completed, URL:", uploadedUrl);

        if (uploadedUrl) {
          console.log("Calling onChange with URL:", uploadedUrl);
          // Clean up previous blob URL if it exists
          if (value && value.startsWith("blob:")) {
            URL.revokeObjectURL(value);
          }
          onChange?.(uploadedUrl);
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error("No URL returned from upload");
        }
      } catch (error: any) {
        console.error("Upload failed with error:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

        toast.error(`Upload failed: ${error.message || "Unknown error"}`);
      } finally {
        setIsUploading(false);
        console.log("Upload process finished");
      }
    },
    [disabled, isUploading, uploadFile, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
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
      if (files && files[0]) {
        handleFileSelect(files);
      }
      // Reset input value to allow re-uploading the same file
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const removeImage = useCallback(() => {
    if (disabled) return;
    console.log("Removing image, calling onChange with undefined");
    // Clean up blob URL if it exists
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onChange?.(undefined);
  }, [disabled, onChange, value]);

  const isDisabled = disabled || isUploading;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Image Preview */}
      {value && (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Category image"
              fill
              className="w-full h-full object-cover"
              sizes="128px"
              unoptimized={value.startsWith("blob:")}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeImage}
            disabled={isDisabled}
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            isDisabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-primary-400 cursor-pointer focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          aria-label="Upload category image - drag and drop or click to select file"
          aria-describedby="upload-instructions"
          onKeyDown={(e) => {
            if (isDisabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const input = e.currentTarget.querySelector(
                'input[type="file"]'
              ) as HTMLInputElement;
              input?.click();
            }
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={isDisabled}
            aria-hidden="true"
          />
          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-primary-500 animate-spin mb-4" />
                <p className="text-sm text-gray-600 mb-2">Uploading...</p>
                <p className="text-xs text-gray-500">
                  Please wait while your image uploads
                </p>
              </>
            ) : (
              <>
                <Upload
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  aria-hidden="true"
                />
                <p
                  className="text-sm text-gray-600 mb-2"
                  id="upload-instructions"
                >
                  Drag and drop an image here, or click to select a file
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 8MB</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
