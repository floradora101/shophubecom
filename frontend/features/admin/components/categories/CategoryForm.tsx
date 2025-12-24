"use client";

import { useEffect } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  categorySchema,
  type CategoryFormData,
} from "@/features/admin/schemas/category";
import { useCategoriesQuery } from "@/features/categories/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import type { Category } from "@/features/products/types";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";

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

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to save category. Please try again.",
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
    clearError();
    try {
      await onSave(data);
      if (!category) {
        clearDraft();
        reset();
      }
      toast.success("Category saved");
    } catch (error) {
      handleError(error);
      toast.error(formError || "Failed to save category");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleValidationError)}
      className="space-y-6"
      noValidate
      aria-label={category ? "Edit category form" : "Create category form"}
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Category Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField
              label="Category Name"
              required
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="e.g., Electronics, Clothing"
                className={errors.name ? "border-red-500" : ""}
              />
            </FormField>
          </div>

          <div>
            <FormField
              label="Slug"
              required
              error={errors.slug?.message}
              helpText="URL-friendly identifier (auto-generated from name)"
            >
              <Input
                {...register("slug")}
                placeholder="category-slug"
                className={errors.slug ? "border-red-500" : ""}
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Description"
              error={errors.description?.message}
              helpText="Optional brief description of this category"
            >
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Brief description of this category..."
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  errors.description ? "border-red-500" : ""
                }`}
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description
                    ? "field-description-error"
                    : "field-description-help"
                }
              />
            </FormField>
          </div>

          <div>
            <FormField
              label="Parent category"
              error={errors.parentId?.message}
              helpText="Optional - select a parent category to create a hierarchy"
            >
              <select
                {...register("parentId")}
                value={watchedParentId ?? ""}
                onChange={(e) =>
                  setValue("parentId", e.target.value ? e.target.value : null)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-invalid={!!errors.parentId}
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
            </FormField>
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
