// Admin page for creating a new category.
"use client";

import { useRouter } from "next/navigation";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import type { CategoryFormData } from "@/lib/validations/category.schemas";

export default function NewCategoryPage() {
  const router = useRouter();

  const handleSave = async (data: CategoryFormData) => {
    try {
      await adminCategoriesApi.createCategory({
        name: data.name,
        description: data.description || undefined,
        parentId: data.parentId || null,
      });
      router.push("/admin/categories");
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Category
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new category to organize your products
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <CategoryForm onSave={handleSave} />
      </div>
    </div>
  );
}

