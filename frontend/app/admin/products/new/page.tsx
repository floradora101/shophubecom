// Admin page for creating a product.
"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import {
  adminProductsApi,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/lib/api/admin-products";

export default function NewProductPage() {
  const router = useRouter();

  const handleSave = async (
    data: CreateProductPayload | UpdateProductPayload
  ) => {
    try {
      await adminProductsApi.createProduct(data as CreateProductPayload);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error; // Re-throw to let form handle it
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Product
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        <ProductForm onSave={handleSave} />
      </div>
    </div>
  );
}
