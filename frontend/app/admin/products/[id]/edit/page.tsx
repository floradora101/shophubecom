"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/app/admin/products/_components/ProductForm";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/mock-data/mock-data";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const product = useMemo(() => {
    const p = getAllProducts().find((item) => item.id === id);
    if (!p) return null;

    // Transform mock data to form data if needed
    // The form expects variants to have an 'options' array of objects
    const variants = p.variants?.map(v => ({
      ...v,
      options: Object.entries(v.options || {}).map(([name, value]) => ({
        name,
        value: String(value)
      }))
    })) || [];

    return {
      ...p,
      variants: variants.length > 0 ? variants : [{
        sku: p.id || "",
        price: p.price,
        stock: p.stock || 0,
        options: []
      }]
    };
  }, [id]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Package className="w-16 h-16 text-warm-gray-100" />
        <Heading level="h3">Product not found</Heading>
        <Text className="text-warm-gray-500">The product you're looking for doesn't exist.</Text>
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
        initialData={product}
        onSuccess={() => router.push("/admin/products")}
        onCancel={() => router.back()}
      />
    </div>
  );
}
