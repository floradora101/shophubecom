"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logError, extractErrorMessage } from "@/lib/errors";
import { useUploadThing } from "@/lib/uploadthing";
import { shouldUnoptimizeImage } from "@/lib/utils/image-helpers";

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

  // Use UploadThing for actual file uploads
  const uploadErrorRef = useRef<string | null>(null);
  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("variantMainImage", {
    onUploadError: (e) => {
      uploadErrorRef.current = e.message;
    },
  });

  // Cleanup blob URLs to prevent memory leaks (for any legacy blob URLs)
  React.useEffect(() => {
    return () => {
      if (value && value.startsWith("blob:")) {
        URL.revokeObjectURL(value);
      }
    };
  }, [value]);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (disabled || isUploading || isUploadThingUploading) return;

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

      try {
        // Upload file using UploadThing
        const uploadedFiles = await startUpload([file]);

        if (uploadedFiles && uploadedFiles.length > 0) {
          // Use ufsUrl instead of url (url is deprecated in uploadthing v9)
          const uploadedUrl = uploadedFiles[0].ufsUrl ?? uploadedFiles[0].url;

          if (uploadedUrl) {
            // Clean up previous blob URL if it exists
            if (value && value.startsWith("blob:")) {
              URL.revokeObjectURL(value);
            }
            onChange?.(uploadedUrl);
            toast.success("Image uploaded successfully!");
          } else {
            throw new Error("No valid URL returned from upload");
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
          component: "CategoryImageUploader",
          action: "upload_image",
          metadata: {
            fileType: file.type,
            fileSize: file.size,
            fileName: file.name,
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
    [disabled, isUploading, isUploadThingUploading, startUpload, onChange, value]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isUploading || isUploadThingUploading) return;

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
    // Clean up blob URL if it exists
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onChange?.(undefined);
  }, [disabled, onChange, value]);

  const isDisabled = disabled || isUploading || isUploadThingUploading;

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
              unoptimized={shouldUnoptimizeImage(value)}
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
            {(isUploading || isUploadThingUploading) ? (
              <>
                <div className="flex justify-center mb-4">
                  <LoadingSpinner size="lg" variant="inline" />
                </div>
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
