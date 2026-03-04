"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { categorySchema, type CategoryFormData } from "@/features/categories/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Stack } from "@/components/ui/stack";
import { CategoryPicker } from "@/features/categories/components/category-picker";
import { Text } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/features/categories/queries";
import type { Category } from "@/features/products/types";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema) as any,
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      parentId: category?.parentId || null,
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        // Update existing category
        await updateMutation.mutateAsync({
          id: category.id,
          data: {
            name: data.name,
            description: data.description || null,
            parentId: data.parentId || null,
          },
        });
      } else {
        // Create new category
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description || null,
          parentId: data.parentId || null,
        });
      }
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing="xl">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Category Name *"
              placeholder="e.g. Smartphones"
              {...register("name")}
              error={!!errors.name?.message}
              disabled={isLoading}
            />
            {errors.name && (
              <Text className="text-xs text-red-500 mt-1">{errors.name.message}</Text>
            )}
          </div>

          <div className="space-y-2">
            <Text className="text-sm font-medium text-warm-gray-700 mb-1.5 block">
              Parent Category
            </Text>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <CategoryPicker
                  value={field.value || undefined}
                  onChange={field.onChange}
                  placeholder="Select a parent category (optional)"
                  disabled={isLoading}
                  excludeId={category?.id}
                />
              )}
            />
            {errors.parentId && (
              <Text className="text-xs text-red-500 mt-1">{errors.parentId.message}</Text>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              label="Description"
              placeholder="Describe this category..."
              rows={4}
              {...register("description")}
              error={errors.description?.message}
              disabled={isLoading}
            />
            {errors.description && (
              <Text className="text-xs text-red-500 mt-1">{errors.description.message}</Text>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-warm-gray-100 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-lg px-8 min-w-[120px] shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              category ? "Update Category" : "Create Category"
            )}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
