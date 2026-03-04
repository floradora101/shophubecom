"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DepartmentForm } from "@/app/admin/subcategories/_components/DepartmentForm";
import { useDepartmentQuery } from "@/features/departments/queries";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EditDepartmentPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: department, isLoading, error } = useDepartmentQuery(id);

  if (isLoading) {
    return (
      <Card className="p-8">
        <Text className="text-warm-gray-500">Loading...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 space-y-4">
        <Heading level="h3">Failed to load</Heading>
        <Text className="text-warm-gray-500">
          {error instanceof Error ? error.message : "An error occurred"}
        </Text>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </Card>
    );
  }

  if (!department) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Department not found</h2>
      </div>
    );
  }

  return <DepartmentForm initialData={department} />;
}
