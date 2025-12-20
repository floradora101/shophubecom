// Admin page for editing a specific category.
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "@/features/admin/components/categories/CategoryForm";
import { adminCategoriesApi } from "@/features/admin/api/categories";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
    return <LoadingSpinner variant="full" />;
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <p className="mt-1 text-sm text-gray-500">{category.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <CategoryForm category={category} onSave={handleSave} />
      </div>
    </div>
  );
}
