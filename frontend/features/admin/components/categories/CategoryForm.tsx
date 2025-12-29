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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import { Stack } from "@/components/ui/stack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      className="space-y-5"
      noValidate
      aria-label={category ? "Edit category form" : "Create category form"}
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <Stack spacing="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            label="Category Name"
            required
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              placeholder="e.g., Electronics, Clothing"
              error={!!errors.name}
            />
          </FormField>

          <FormField
            label="Slug"
            required
            error={errors.slug?.message}
            helpText="URL identifier"
          >
            <Input
              {...register("slug")}
              placeholder="category-slug"
              className="font-mono text-sm"
              error={!!errors.slug}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            label="Description"
            error={errors.description?.message}
            helpText="Optional brief description"
          >
            <Textarea
              {...register("description")}
              rows={2}
              placeholder="Brief description..."
              className="resize-none"
              error={errors.description?.message}
            />
          </FormField>

          <FormField
            label="Parent Category"
            error={errors.parentId?.message}
            helpText="Optional hierarchy"
          >
            <Select
              value={watchedParentId ?? ""}
              onValueChange={(value) =>
                setValue("parentId", value ? value : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Top level category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Top level category</SelectItem>
                {categories
                  .filter((c) => !category || c.id !== category.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </Stack>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-warm-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="text-warm-gray-600 hover:text-warm-gray-800"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-6">
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
