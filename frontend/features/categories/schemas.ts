import * as yup from "yup";

export const categorySchema = yup.object({
  name: yup.string().trim().required().min(2).max(80),
  slug: yup.string().trim()
    .required()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes"),
  parentId: yup.string().nullable().optional(),
  description: yup.string().trim().max(600).optional(),
  image: yup.string().trim().url().optional(),
  sortOrder: yup.number().integer().min(0).max(9999).optional(),
});

export type CategoryFormData = yup.InferType<typeof categorySchema>;
