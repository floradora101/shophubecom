"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "../_components/ProductForm";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewProductPage() {
  const router = useRouter();

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
          <Heading level="h2">Add New Product</Heading>
          <Text className="text-warm-gray-500">
            Create a new product with image, variants, and inventory. Start by adding a product image.
          </Text>
        </div>
      </div>

      <ProductForm
        onSuccess={() => router.push("/admin/products")}
        onCancel={() => router.back()}
      />
    </div>
  );
}
