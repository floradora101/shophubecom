// Admin page for editing a product.
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import {
  adminProductsApi,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/lib/api/admin-products";
import type { AdminProduct } from "@/lib/types/admin.types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await adminProductsApi.getProduct(productId);
        if (data) {
          setProduct(data);
        } else {
          alert("Product not found");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        alert("Failed to load product");
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  const handleSave = async (
    data: CreateProductPayload | UpdateProductPayload
  ) => {
    try {
      await adminProductsApi.updateProduct(
        productId,
        data as UpdateProductPayload
      );
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error; // Re-throw to let form handle it
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-500">{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        <ProductForm product={product} onSave={handleSave} />
      </div>
    </div>
  );
}
