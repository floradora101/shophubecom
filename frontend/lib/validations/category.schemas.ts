import * as yup from "yup";

export const categorySchema = yup.object({
  name: yup
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .required("Category name is required"),
  slug: yup
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .required("Slug is required"),
  description: yup
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  parentId: yup.string().nullable().optional(),
  promotionIds: yup.array().of(yup.string()).optional(),
});

export type CategoryFormData = yup.InferType<typeof categorySchema>;
