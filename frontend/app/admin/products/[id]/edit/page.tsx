"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm, type ProductFormInitialData } from "@/app/admin/products/_components/ProductForm";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft, Package, AlertCircle } from "lucide-react";
import { AdminLoadingState } from "@/app/admin/_components/AdminLoadingState";
import { Button } from "@/components/ui/button";
import { useProductByIdQuery } from "@/features/products/queries";
import { extractErrorMessage } from "@/lib/api/error-handler";
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
    const variants = product.variants?.map(v => ({
      ...v,
      options: Object.entries(v.options || {}).map(([name, value]) => ({
        name,
        value: String(value)
      }))
    })) || [];

    // Normalize null → undefined for form compatibility (ProductFormInitialData expects undefined, not null)
    const nullToUndef = <T,>(v: T | null | undefined): T | undefined =>
      v === null ? undefined : v;

    return {
      ...product,
      description: nullToUndef(product.description),
      discountValue: nullToUndef(product.discountValue),
      saleStartsAt: nullToUndef(product.saleStartsAt),
      saleEndsAt: nullToUndef(product.saleEndsAt),
      defaultVariantId: nullToUndef(product.defaultVariantId),
      brand: nullToUndef(product.brand),
      variants: variants.length > 0 ? variants : [{
        sku: product.id || "",
        price: product.price,
        stock: product.stock || product.effectiveStock || 0,
        options: []
      }]
    } as ProductFormInitialData;
  }, [product]);

  // Loading state
  if (isLoading) {
    return <AdminLoadingState message="Loading product..." />;
  }

  // Error state
  if (error || !product || !formData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <Heading level="h3">Product not found</Heading>
        <Text className="text-warm-gray-500">
          {extractErrorMessage(error, "The product you're looking for doesn't exist.")}
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
