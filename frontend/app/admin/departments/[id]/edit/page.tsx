"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { DepartmentForm } from "../../_components/DepartmentForm";
import { getAllDepartments } from "@/lib/mock-data/departments";

export default function EditDepartmentPage() {
  const params = useParams();
  const id = params?.id as string;

  const departments = getAllDepartments();
  const department = useMemo(() =>
    departments.find(d => d.id === id),
  [departments, id]);

  if (!department) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Department not found</h2>
      </div>
    );
  }

  return <DepartmentForm initialData={department} />;
}
