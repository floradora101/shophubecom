import * as yup from "yup";

export const categorySchema = yup.object({
  name: yup.string().trim().required("Category name is required").min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  description: yup.string().trim().max(500, "Description must be at most 500 characters").optional().nullable(),
  parentId: yup.string().nullable().optional(),
});

export type CategoryFormData = yup.InferType<typeof categorySchema>;
