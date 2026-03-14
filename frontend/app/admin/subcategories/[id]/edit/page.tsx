"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DepartmentForm } from "@/app/admin/subcategories/_components/DepartmentForm";
import { useDepartmentQuery } from "@/features/departments/queries";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLoadingState } from "@/app/admin/_components/AdminLoadingState";

export default function EditDepartmentPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: department, isLoading, error, refetch } = useDepartmentQuery(id);

  if (isLoading) {
    return <AdminLoadingState message="Loading subcategory..." />;
  }

  if (error) {
    return (
      <Card className="p-8 space-y-4">
        <Heading level="h3">Failed to load</Heading>
        <Text className="text-warm-gray-500">
          {extractErrorMessage(error, "An error occurred")}
        </Text>
        <Button onClick={() => refetch()} variant="outline">
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
