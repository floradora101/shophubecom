// Admin page for editing a specific category.
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import type { Category } from "@/lib/types/product.types";
import type { CategoryFormData } from "@/lib/validations/category.schemas";

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
          alert("Category not found");
          router.push("/admin/categories");
        }
      } catch (error) {
        console.error("Failed to load category:", error);
        alert("Failed to load category");
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
      console.error("Failed to update category:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
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

