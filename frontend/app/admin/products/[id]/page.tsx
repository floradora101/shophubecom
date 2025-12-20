// Admin page for editing a product.
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/features/admin/components/products/ProductForm";
import {
  adminProductsApi,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/features/admin/api/products";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { AdminProduct } from "@/features/admin/types";

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
          toast.error("Product not found");
          router.push("/admin/products");
        }
      } catch (error) {
        toast.error(extractErrorMessage(error, "Failed to load product"));
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
      throw error; // Re-throw to let form handle it
    }
  };

  if (isLoading) {
    return <LoadingSpinner variant="full" />;
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
