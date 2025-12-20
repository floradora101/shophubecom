import * as yup from "yup";

export const couponSchema = yup.object({
  code: yup
    .string()
    .max(50, "Code must be less than 50 characters")
    .matches(
      /^[A-Z0-9_-]+$/,
      "Code must contain only uppercase letters, numbers, hyphens, and underscores"
    )
    .required("Code is required"),
  description: yup.string().notRequired(),
  type: yup
    .string()
    .oneOf(["PERCENTAGE", "FIXED_AMOUNT"], "Invalid discount type")
    .required("Discount type is required"),
  value: yup
    .number()
    .positive("Discount value must be positive")
    .required("Discount value is required"),
  minOrderTotal: yup
    .number()
    .min(0, "Minimum order total must be positive")
    .notRequired(),
  startsAt: yup.string().notRequired(),
  expiresAt: yup
    .string()
    .notRequired()
    .test(
      "end-after-start",
      "Expiry must be after start date",
      function (value) {
        const { startsAt } = this.parent;
        if (!startsAt || !value) return true;
        return new Date(value) > new Date(startsAt);
      }
    ),
  usageLimit: yup
    .number()
    .integer("Usage limit must be a whole number")
    .min(1, "Usage limit must be at least 1")
    .notRequired(),
  perUserLimit: yup
    .number()
    .integer("Per-user limit must be a whole number")
    .min(1, "Per-user limit must be at least 1")
    .notRequired(),
  isActive: yup.boolean().default(true),
});

export type CouponFormData = {
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderTotal?: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive: boolean;
};

