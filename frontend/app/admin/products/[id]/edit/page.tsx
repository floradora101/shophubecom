"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/app/admin/products/_components/ProductForm";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft, Loader2, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductByIdQuery } from "@/features/products/queries";
import type { Product } from "@/features/products/types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading, error } = useProductByIdQuery(id);

  // Transform product data to form data format
  const formData = useMemo(() => {
    if (!product) return null;

    // Transform variants to form data format
    // The form expects variants to have an 'options' array of objects
    const variants = product.variants?.map(v => ({
      ...v,
      options: Object.entries(v.options || {}).map(([name, value]) => ({
        name,
        value: String(value)
      }))
    })) || [];

    return {
      ...product,
      variants: variants.length > 0 ? variants : [{
        sku: product.id || "",
        price: product.price,
        stock: product.stock || product.effectiveStock || 0,
        options: []
      }]
    };
  }, [product]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <Text className="text-warm-gray-500">Loading product...</Text>
      </div>
    );
  }

  // Error state
  if (error || !product || !formData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <Heading level="h3">Product not found</Heading>
        <Text className="text-warm-gray-500">
          {error instanceof Error ? error.message : "The product you're looking for doesn't exist."}
        </Text>
        <Button variant="outline" onClick={() => router.push("/admin/products")} className="rounded-lg">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-10 w-10 p-0 hover:bg-warm-gray-100"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5 text-warm-gray-600" />
        </Button>
        <div>
          <Heading level="h2">Edit Product</Heading>
          <Text className="text-warm-gray-500">
            Updating: <span className="font-bold text-warm-gray-900">{product.name}</span>
          </Text>
        </div>
      </div>

      <ProductForm
        initialData={formData}
        onSuccess={() => router.push("/admin/products")}
        onCancel={() => router.back()}
      />
    </div>
  );
}
