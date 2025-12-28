// Admin page for creating a new category.
"use client";

import { useRouter } from "next/navigation";
import { CategoryForm } from "@/features/admin/components/categories/CategoryForm";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { adminCategoriesApi } from "@/features/admin/api/categories";
import type { CategoryFormData } from "@/features/admin/schemas/category";

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
      throw error;
    }
  };

  return (
    <AdminPageShell
      title="Create Category"
      description="Add a new category to organize your products."
      backHref="/admin/categories"
    >
      <CategoryForm onSave={handleSave} />
    </AdminPageShell>
  );
}
