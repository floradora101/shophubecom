// Admin page for editing a specific category.
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "@/features/admin/components/categories/CategoryForm";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { adminCategoriesApi } from "@/features/admin/api/categories";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { Heading, Text } from "@/components/ui/typography";
import type { Category } from "@/features/products/types";
import type { CategoryFormData } from "@/features/admin/schemas/category";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await adminCategoriesApi.getCategory(categoryId);
        if (data) {
          setCategory(data);
        } else {
          toast.error("Category not found");
          router.push("/admin/categories");
        }
      } catch (error) {
        toast.error(extractErrorMessage(error, "Failed to load category"));
        router.push("/admin/categories");
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId, router]);

  const handleSave = async (data: CategoryFormData) => {
    try {
      await adminCategoriesApi.updateCategory(categoryId, {
        name: data.name,
        description: data.description || null,
        parentId: data.parentId || null,
      });
      router.push("/admin/categories");
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell
        title="Edit Category"
        description="Loading category details..."
        backHref="/admin/categories"
      >
        <LoadingSpinner />
      </AdminPageShell>
    );
  }

  if (!category) {
    return (
      <AdminPageShell
        title="Category Not Found"
        description="The requested category could not be found."
        backHref="/admin/categories"
      >
        <Stack spacing="lg" align="center">
          <div className="text-center space-y-4">
            <Heading level="h3">Category Not Found</Heading>
            <Text className="text-warm-gray-600">
              The category you're looking for doesn't exist or may have been
              deleted.
            </Text>
            <Link href="/admin/categories">
              <Button>Return to Categories</Button>
            </Link>
          </div>
        </Stack>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Edit Category"
      description={category.name}
      backHref="/admin/categories"
    >
      <CategoryForm category={category} onSave={handleSave} />
    </AdminPageShell>
  );
}
