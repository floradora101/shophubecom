"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils/error-handler";

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onRemove?: () => void;
  label?: string;
  required?: boolean;
  error?: string;
  maxSize?: number; // in MB
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Image",
  required = false,
  error,
  maxSize = 10,
  accept = "image/*",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.warning(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.warning("Please select an image file");
      return;
    }

    setUploading(true);

    try {
      // Create a preview URL immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        onChange(dataUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to upload image"));
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Update preview when value prop changes externally
  React.useEffect(() => {
    if (value !== previewUrl) {
      setPreviewUrl(value || null);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {previewUrl ? (
        <div className="relative inline-block">
          <div
            className={`relative w-32 h-32 rounded-lg border overflow-hidden ${
              error ? "border-red-500 border-2" : "border-gray-300"
            }`}
          >
            <Image
              src={previewUrl}
              alt="Upload preview"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            error
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          <p className="mt-2 text-xs text-gray-500">Max size: {maxSize}MB</p>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface MultipleImageUploadProps {
  values: string[];
  onChange: (imageUrls: string[]) => void;
  label?: string;
  maxSize?: number;
  maxFiles?: number;
  accept?: string;
}

export function MultipleImageUpload({
  values,
  onChange,
  label = "Images",
  maxSize = 10,
  maxFiles = 8,
  accept = "image/*",
}: MultipleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check max files limit
    if (values.length + files.length > maxFiles) {
      toast.warning(`You can only upload up to ${maxFiles} images total`);
      return;
    }

    setUploading(true);

    try {
      const newUrls: string[] = [];

      for (const file of files) {
        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          toast.warning(`File "${file.name}" exceeds ${maxSize}MB. Skipping.`);
          continue;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.warning(`File "${file.name}" is not an image. Skipping.`);
          continue;
        }

        // Create preview URL
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            newUrls.push(dataUrl);
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      onChange([...values, ...newUrls]);
      setUploading(false);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to upload images"));
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || values.length >= maxFiles}
      />

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {values.map((url, idx) => (
            <div key={idx} className="relative">
              <div className="relative w-24 h-24 rounded-lg border border-gray-300 overflow-hidden">
                <Image
                  src={url}
                  alt={`Gallery image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                onClick={() => handleRemove(idx)}
                disabled={uploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {values.length < maxFiles && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 bg-gray-50 transition-colors">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Add Images"}
          </Button>
          <p className="mt-2 text-xs text-gray-500">
            {values.length}/{maxFiles} images. Max {maxSize}MB each.
          </p>
        </div>
      )}
    </div>
  );
}
