"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { CategoryForm } from "@/app/admin/categories/_components/CategoryForm";
import { ChevronLeft } from "lucide-react";
import { AdminLoadingState } from "@/app/admin/_components/AdminLoadingState";
import { Button } from "@/components/ui/button";
import { useCategoryQuery } from "@/features/categories/queries";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: category, isLoading, error } = useCategoryQuery(id);

  if (isLoading) {
    return <AdminLoadingState message="Loading category..." />;
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Heading level="h3">Category not found</Heading>
        <Text className="text-warm-gray-500">
          The category you're looking for doesn't exist or has been deleted.
        </Text>
        <Button onClick={() => router.push("/admin/categories")}>
          Return to Categories
        </Button>
      </div>
    );
  }

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
          <Heading level="h2">Edit Category: {category.name}</Heading>
          <Text className="text-warm-gray-500">
            Update category details or its position in the hierarchy.
          </Text>
        </div>
      </div>

      <Card className="p-8 border-warm-gray-200 shadow-xl bg-white rounded-lg">
        <CategoryForm
          category={category}
          onSuccess={() => router.push("/admin/categories")}
          onCancel={() => router.push("/admin/categories")}
        />
      </Card>
    </div>
  );
}
