"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithOptions as Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonBlock } from "@/components/ui/skeleton";
import {
  getCategory,
  updateCategory,
  listCategories,
} from "../../../_lib/admin-data";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "",
    },
  });

  const { watch, setValue } = form;
  const watchedName = watch("name");

  // Load category data
  useEffect(() => {
    const loadCategory = () => {
      const categoryData = getCategory(categoryId);
      if (!categoryData) {
        router.push("/admin/categories");
        return;
      }

      setCategory(categoryData);
      form.reset({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || "",
        parentId: categoryData.parentId || "",
      });
      setIsLoading(false);
    };

    loadCategory();
  }, [categoryId, router, form]);

  // Auto-generate slug when name changes
  React.useEffect(() => {
    if (watchedName && category && watchedName !== category.name) {
      setValue("slug", generateSlug(watchedName));
    }
  }, [watchedName, category, setValue]);

  const parentCategories = listCategories().filter(
    (cat) => !cat.parentId && cat.id !== categoryId
  ); // Exclude self and children

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);

      const categoryData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
      };

      const updated = updateCategory(categoryId, categoryData);
      if (updated) {
        router.push("/admin/categories");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHierarchyPreview = () => {
    const parentId = form.watch("parentId");
    if (!parentId) return null;

    const parent = parentCategories.find((cat) => cat.id === parentId);
    if (!parent) return null;

    return (
      <div className="p-3 bg-warm-gray-50 rounded-lg">
        <p className="text-sm text-warm-gray-600 mb-1">Hierarchy Preview:</p>
        <p className="text-sm font-medium">
          {parent.name} › {form.watch("name") || "Category"}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-48" />
        <Card padding="lg">
          <div className="space-y-6">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-24 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-warm-gray-600">Category not found</p>
        <Link href="/admin/categories">
          <Button className="mt-4">Back to Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Category"
        description={`Editing "${category.name}"`}
        actions={
          <Link href="/admin/categories">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        }
      />

      <Card padding="lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Basic Information">
            <FormField
              label="Category Name"
              error={form.formState.errors.name?.message}
            >
              <Input
                {...form.register("name")}
                placeholder="Enter category name"
              />
            </FormField>

            <FormField label="Slug" error={form.formState.errors.slug?.message}>
              <Input
                {...form.register("slug")}
                placeholder="category-slug"
                onChange={(e) => {
                  const slug = generateSlug(e.target.value);
                  setValue("slug", slug);
                }}
              />
              <p className="text-xs text-warm-gray-500 mt-1">
                Auto-generated from name. Used in URLs.
              </p>
            </FormField>

            <FormField
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Textarea
                {...form.register("description")}
                placeholder="Describe this category..."
                rows={3}
              />
            </FormField>
          </FormSection>

          <FormSection title="Hierarchy">
            <FormField
              label="Parent Category"
              error={form.formState.errors.parentId?.message}
            >
              <Select
                value={form.watch("parentId") || ""}
                onValueChange={(value) => setValue("parentId", value)}
                options={[
                  { value: "", label: "No parent (Top-level category)" },
                  ...parentCategories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
              />
              <p className="text-xs text-warm-gray-500 mt-1">
                Optional. Choose a parent category to create a subcategory.
              </p>
            </FormField>

            {getHierarchyPreview()}
          </FormSection>

          <div className="flex justify-end gap-3 pt-6 border-t border-warm-gray-200">
            <Link href="/admin/categories">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <LoadingButton type="submit" loading={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </LoadingButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
