"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  LayoutGrid,
  Check,
  Info,
  Layers,
  CheckCircle2
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Heading, Text } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { Department } from "@/features/departments";
import { departmentSchema, type DepartmentFormData } from "@/features/departments/schemas";
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from "@/features/departments/queries";
import { useCategoriesQuery } from "@/features/categories/queries";
import type { Category } from "@/features/products/types";

interface DepartmentFormProps {
  initialData?: Department | null;
}

export function DepartmentForm({ initialData }: DepartmentFormProps) {
  const router = useRouter();
  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();

  const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategoriesQuery({
    limit: 1000,
    sortBy: "name",
    sortOrder: "asc",
  });

  const categories: Category[] = categoriesResponse?.data || [];
  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormData>({
    resolver: yupResolver(departmentSchema) as Resolver<DepartmentFormData>,
    defaultValues: {
      name: initialData?.name || "",
      parentCategoryId: initialData?.parentCategory?.id || "",
      highlightedSubCategoryIds:
        initialData?.highlightedSubcategories?.map((c) => c.id) || [],
      isActive: initialData?.isActive ?? true,
    },
  });

  const parentCategoryId = watch("parentCategoryId");
  const highlightedIds = watch("highlightedSubCategoryIds") || [];
  const isActive = watch("isActive");

  const subCategories = useMemo(() => {
    if (!parentCategoryId) return [];
    return categories.filter((c) => c.parentId === parentCategoryId);
  }, [categories, parentCategoryId]);

  const toggleSubCategory = (id: string) => {
    const current = highlightedIds || [];
    const exists = current.includes(id);
    const next = exists ? current.filter((x) => x !== id) : [...current, id];
    setValue("highlightedSubCategoryIds", next, { shouldDirty: true });
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            name: data.name,
            parentCategoryId: data.parentCategoryId,
            highlightedSubCategoryIds: data.highlightedSubCategoryIds || [],
            isActive: !!data.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          parentCategoryId: data.parentCategoryId,
          highlightedSubCategoryIds: data.highlightedSubCategoryIds || [],
          isActive: !!data.isActive,
        });
      }
    } catch {
      // Error handling is in mutation hooks
    }
  };

  const isLoading =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    isLoadingCategories;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-full hover:bg-warm-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <Heading level="h2">
              {initialData ? "Edit Department" : "New Department"}
            </Heading>
            <Text className="text-warm-gray-500">
              Configure how sub-categories are showcased on the home page.
            </Text>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{initialData ? "Update Department" : "Create Department"}</span>
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="p-6 border-warm-gray-200 shadow-sm space-y-6 bg-white">
            <div className="flex items-center gap-2 border-b border-warm-gray-100 pb-4 mb-4">
              <LayoutGrid className="w-5 h-5 text-primary-600" />
              <Heading level="h4">Basic Information</Heading>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  label="Department Name"
                  placeholder="e.g. Laptops Series, Mobile Hub"
                  {...register("name")}
                  error={!!errors.name?.message}
                  className="rounded-lg border-warm-gray-200 focus:ring-primary-500"
                  required
                  disabled={isLoading}
                />
                <Text className="text-[11px] text-warm-gray-400">
                  This name is used for internal reference and section headings.
                </Text>
              </div>

              <div className="space-y-2">
                <Text className="text-sm font-bold text-warm-gray-700 mb-1.5 block">Parent Category</Text>
                <Select
                  value={parentCategoryId}
                  onValueChange={(value) => {
                    setValue("parentCategoryId", value, { shouldDirty: true });
                    setValue("highlightedSubCategoryIds", [], { shouldDirty: true });
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="rounded-lg border-warm-gray-200">
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-warm-gray-100 shadow-2xl">
                    {parentCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentCategoryId && (
                  <Text className="text-xs text-red-500 mt-1">
                    {errors.parentCategoryId.message}
                  </Text>
                )}
                <Text className="text-[11px] text-warm-gray-400">
                  The primary category that this department focuses on.
                </Text>
              </div>
            </div>
          </Card>

          {/* Subcategory Selection */}
          <Card className="p-6 border-warm-gray-200 shadow-sm space-y-6 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-warm-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-600" />
                <Heading level="h4">Highlight Sub-categories</Heading>
              </div>
              <Badge variant="secondary" className="bg-primary-50 text-primary-700 font-bold">
                {highlightedIds.length} Selected
              </Badge>
            </div>

            {!parentCategoryId ? (
              <div className="py-12 text-center bg-warm-gray-50/50 rounded-xl border border-dashed border-warm-gray-200">
                <Info className="w-8 h-8 text-warm-gray-300 mx-auto mb-2" />
                <Text className="text-warm-gray-500 font-medium">Please select a parent category first</Text>
              </div>
            ) : subCategories.length === 0 ? (
              <div className="py-12 text-center bg-warm-gray-50/50 rounded-xl border border-dashed border-warm-gray-200">
                <Info className="w-8 h-8 text-warm-gray-300 mx-auto mb-2" />
                <Text className="text-warm-gray-500 font-medium">No sub-categories found for this category</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subCategories.map(sub => {
                  const isSelected = highlightedIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubCategory(sub.id)}
                      disabled={isLoading}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                        isSelected
                          ? "border-primary-600 bg-primary-50/50"
                          : "border-warm-gray-100 bg-white hover:border-warm-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                          isSelected ? "bg-primary-600 border-primary-600" : "border-warm-gray-300 group-hover:border-warm-gray-400"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <Text className={cn("text-sm font-bold", isSelected ? "text-primary-900" : "text-warm-gray-700")}>
                            {sub.name}
                          </Text>
                          <Text className="text-[10px] text-warm-gray-400">{sub.productCount} Products</Text>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="bg-primary-50/30 p-4 rounded-xl border border-primary-100">
               <div className="flex gap-3">
                  <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <Text className="text-xs text-primary-800 leading-relaxed">
                    Selected sub-categories will be displayed as tabs or grid sections on the home page department showcase.
                    They will appear in the order they are selected.
                  </Text>
               </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Status & Settings */}
          <Card className="p-6 border-warm-gray-200 shadow-sm space-y-6 bg-white">
            <Heading level="h4" className="border-b border-warm-gray-100 pb-4">Settings</Heading>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-warm-gray-50 rounded-xl border border-warm-gray-100">
                <div className="space-y-0.5">
                  <Text className="text-sm font-bold text-warm-gray-800 block">Active Status</Text>
                  <Text className="text-[10px] text-warm-gray-400">Enable/disable this department</Text>
                </div>
                <Switch
                  id="isActive"
                  checked={!!isActive}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked, { shouldDirty: true })
                  }
                  disabled={isLoading}
                  className="data-[state=checked]:bg-primary-600"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Text className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  Only active subcategories will be visible on the public store front.
                  Inactive subcategories are hidden but preserved in the dashboard.
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
