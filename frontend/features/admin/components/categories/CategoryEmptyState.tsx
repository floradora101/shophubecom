"use client";

import Link from "next/link";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Heading } from "@/components/ui/typography";
import { Stack } from "@/components/ui/stack";

interface CategoryEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function CategoryEmptyState({
  hasFilters,
  onResetFilters,
}: CategoryEmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Stack spacing="md" align="center">
        <div className="mx-auto h-16 w-16 text-warm-gray-400">
          <Folder className="h-full w-full" />
        </div>

        <div className="max-w-md">
          <Heading level="h3" className="mb-2">
            {hasFilters ? "No categories found" : "No categories yet"}
          </Heading>
          <Text className="text-warm-gray-600">
            {hasFilters
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by creating your first product category to organize your store."}
          </Text>
        </div>

        <div className="flex items-center gap-3">
          {hasFilters && (
            <Button variant="outline" onClick={onResetFilters}>
              Reset filters
            </Button>
          )}
          <Link href="/admin/categories/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {hasFilters ? "Add Category" : "Create Category"}
            </Button>
          </Link>
        </div>
      </Stack>
    </Card>
  );
}
