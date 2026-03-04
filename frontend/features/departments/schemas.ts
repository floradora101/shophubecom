import * as yup from "yup";

export const departmentSchema = yup.object({
  name: yup.string().required("Department name is required").max(100),
  parentCategoryId: yup.string().required("Parent category is required"),
  highlightedSubCategoryIds: yup.array().of(yup.string().required()).default([]),
  isActive: yup.boolean().default(true),
});

export type DepartmentFormData = yup.InferType<typeof departmentSchema>;

