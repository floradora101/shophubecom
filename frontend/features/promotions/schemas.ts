import * as yup from "yup";

export const promotionSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "Promotion name must be at least 3 characters")
    .max(100, "Promotion name must be less than 100 characters")
    .required("Promotion name is required"),
  description: yup
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .required("Description is required"),
  type: yup
    .mixed<"PERCENTAGE" | "FIXED_AMOUNT">()
    .oneOf(["PERCENTAGE", "FIXED_AMOUNT"])
    .required("Discount type is required"),
  value: yup
    .number()
    .transform((value, originalValue) => {
      if (isNaN(value) || originalValue === "" || originalValue == null) {
        return undefined;
      }
      return value;
    })
    .typeError("Value must be a number")
    .required("Discount value is required")
    .positive("Value must be positive")
    .when("type", {
      is: "PERCENTAGE",
      then: (schema) => schema.max(100, "Percentage cannot exceed 100%"),
    }),
  startsAt: yup.string().nullable(),
  expiresAt: yup.string().nullable(),
  isActive: yup.boolean().default(true),
  productIds: yup.array().of(yup.string().required()).default([]),
  categoryIds: yup.array().of(yup.string().required()).default([]),
});

export type PromotionFormData = yup.InferType<typeof promotionSchema>;
