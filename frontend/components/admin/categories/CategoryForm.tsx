"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category.schemas";
import { useCategoriesQuery } from "@/lib/queries/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Category } from "@/lib/types/product.types";
import { useFormDraft } from "@/lib/forms/useFormDraft";

interface CategoryFormProps {
  category?: Category;
  onSave: (data: CategoryFormData) => Promise<void>;
}

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export function CategoryForm({ category, onSave }: CategoryFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CategoryFormData>({
    resolver: yupResolver(
      categorySchema
    ) as unknown as Resolver<CategoryFormData>,
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          parentId: category.parentId || null,
          promotionIds: category.promotionIds || [],
        }
      : {
          name: "",
          slug: "",
          description: "",
          parentId: null,
          promotionIds: [],
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = form;

  // Enable draft persistence only for create mode
  const { clearDraft } = useFormDraft(form, {
    key: "draft:add-category",
    storage: "local",
    enabled: !category,
  });

  const watchedName = watch("name");
  const watchedParentId = watch("parentId");

  // Fetch categories for parent select
  const { data: categoriesData } = useCategoriesQuery();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && watchedName) {
      const newSlug = generateSlug(watchedName);
      setValue("slug", newSlug);
    }
  }, [watchedName, category, setValue]);

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      await onSave(data);
      if (!category) {
        clearDraft();
        reset();
      }
      setFormError(null);
      toast.success("Category saved");
    } catch (error) {
      console.error("Failed to save category:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onError = (validationErrors: Record<string, { message?: string }>) => {
    const firstError = Object.keys(validationErrors)[0];
    if (firstError) {
      const errorMessage =
        validationErrors[firstError]?.message || "Please fix form errors";
      setFormError(errorMessage);
      toast.error("Fix highlighted fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Category Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g., Electronics, Clothing"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("slug")}
              placeholder="category-slug"
              className={errors.slug ? "border-red-500" : ""}
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Brief description of this category..."
              className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent category (optional)
            </label>
            <select
              {...register("parentId")}
              value={watchedParentId ?? ""}
              onChange={(e) =>
                setValue("parentId", e.target.value ? e.target.value : null)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">No parent (root)</option>
              {categories
                .filter((c) => !category || c.id !== category.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            {errors.parentId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.parentId.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : category
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
