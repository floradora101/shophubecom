import * as yup from "yup";

export const couponSchema = yup.object({
  code: yup
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code must be less than 50 characters")
    .required("Coupon code is required")
    .matches(/^[A-Z0-9_-]+$/, "Code must be uppercase alphanumeric, underscores, or hyphens"),
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
  minOrderTotal: yup
    .number()
    .transform((value, originalValue) => {
      if (isNaN(value) || originalValue === "" || originalValue == null) {
        return undefined;
      }
      return value;
    })
    .typeError("Minimum order total must be a number")
    .min(0, "Minimum order total cannot be negative")
    .nullable()
    .optional(),
  startsAt: yup.string().nullable().optional(),
  expiresAt: yup.string().nullable().optional(),
  usageLimit: yup
    .number()
    .transform((value, originalValue) => {
      if (isNaN(value) || originalValue === "" || originalValue == null) {
        return undefined;
      }
      return value;
    })
    .typeError("Usage limit must be a number")
    .integer("Usage limit must be a whole number")
    .min(1, "Usage limit must be at least 1")
    .nullable()
    .optional(),
  perUserLimit: yup
    .number()
    .transform((value, originalValue) => {
      if (isNaN(value) || originalValue === "" || originalValue == null) {
        return undefined;
      }
      return value;
    })
    .typeError("Per user limit must be a number")
    .integer("Per user limit must be a whole number")
    .min(1, "Per user limit must be at least 1")
    .nullable()
    .optional(),
  isActive: yup.boolean().default(true),
});

export type CouponFormData = yup.InferType<typeof couponSchema>;
