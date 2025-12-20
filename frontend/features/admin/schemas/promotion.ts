import * as yup from "yup";

export const promotionSchema = yup.object({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be less than 255 characters")
    .required("Name is required"),
  description: yup.string().notRequired(),
  type: yup
    .string()
    .oneOf(["PERCENTAGE", "FIXED_AMOUNT"], "Invalid discount type")
    .required("Discount type is required"),
  value: yup
    .number()
    .positive("Discount value must be positive")
    .required("Discount value is required"),
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
  isActive: yup.boolean().default(true),
  applicableProductIds: yup.array().of(yup.string()).notRequired(),
  applicableCategoryIds: yup.array().of(yup.string()).notRequired(),
  applyToSubcategories: yup.boolean().default(true),
});

export type PromotionFormData = {
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applyToSubcategories: boolean;
};

