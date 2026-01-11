"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { CategoryForm } from "../_components/CategoryForm";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/categories")}
          className="w-fit -ml-2 text-warm-gray-500 hover:text-warm-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Categories
        </Button>
        <div>
          <Heading level="h2">Create New Category</Heading>
          <Text className="text-warm-gray-500">
            Define a new product category and its position in your store's hierarchy.
          </Text>
        </div>
      </div>

      <Card className="p-8 border-warm-gray-200 shadow-xl bg-white rounded-lg">
        <CategoryForm
          onSuccess={() => router.push("/admin/categories")}
          onCancel={() => router.push("/admin/categories")}
        />
      </Card>
    </div>
  );
}
