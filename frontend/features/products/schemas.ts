import * as yup from "yup";

export const productVariantSchema = yup
  .object({
    id: yup.string().optional(),
    sku: yup
      .string()
      .trim()
      .max(100, "SKU must be less than 100 characters")
      .required("SKU is required"),
    price: yup
      .number()
      .transform((value, originalValue) => {
        // Transform NaN -> undefined, empty string -> undefined
        if (isNaN(value) || originalValue === "" || originalValue == null) {
          return undefined;
        }
        return value;
      })
      .typeError("Price is required")
      .required("Price is required")
      .moreThan(0, "Price must be positive"),
    stock: yup
      .number()
      .transform((value, originalValue) => {
        // Transform NaN -> undefined, empty string -> undefined
        if (isNaN(value) || originalValue === "" || originalValue == null) {
          return undefined;
        }
        return value;
      })
      .typeError("Stock is required")
      .required("Stock is required")
      .integer("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    image: yup
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : v))
      .test(
        "is-valid-url",
        "Image must be a valid permanent URL (http/https). Blob URLs are not allowed.",
        function (value) {
          if (!value) return true; // Optional field
          // Reject blob URLs - they're temporary and shouldn't be saved
          if (value.startsWith("blob:")) {
            return this.createError({
              message: "Image must be uploaded first. Blob URLs cannot be saved.",
            });
          }
          // Only allow permanent http/https URLs
          return value.startsWith("http://") || value.startsWith("https://");
        }
      )
      .optional(),
    images: yup
      .array()
      .of(
        yup.string().trim().test(
          "is-valid-url",
          "Each image must be a valid permanent URL (http/https). Blob URLs are not allowed.",
          function (value) {
            if (!value) return true;
            // Reject blob URLs - they're temporary and shouldn't be saved
            if (value.startsWith("blob:")) {
              return this.createError({
                message: "Images must be uploaded first. Blob URLs cannot be saved.",
              });
            }
            // Only allow permanent http/https URLs
            return value.startsWith("http://") || value.startsWith("https://");
          }
        )
      )
      .transform((v) => (Array.isArray(v) ? v.filter((img) => img !== "" && !img.startsWith("blob:")) : v))
      .optional(),
    options: yup
      .array()
      .of(
        yup.object({
          name: yup.string().trim().required("Option name is required"),
          value: yup.string().trim().required("Option value is required"),
        })
      )
      .optional(),
  })
  .test(
    "variantHasImage",
    "Variant must have at least one image (Image URL or Gallery URLs)",
    function (value) {
      if (!value) {
        return true; // Let required() handle missing values
      }

      const hasImage =
        value.image &&
        typeof value.image === "string" &&
        value.image.trim().length > 0;
      const hasImages =
        value.images &&
        Array.isArray(value.images) &&
        value.images.length > 0 &&
        value.images.some(
          (img) => typeof img === "string" && img.trim().length > 0
        );

      return hasImage || hasImages;
    }
  );

export const productSchema = yup.object({
  name: yup
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(255, "Product name must be less than 255 characters")
    .required("Product name is required"),
  description: yup
    .string()
    .min(5, "Description must be at least 5 characters")
    .required("Description is required"),
  currency: yup
    .string()
    .matches(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code")
    .default("USD")
    .required("Currency is required"),
  isOnSale: yup.boolean().default(false),
  discountType: yup
    .mixed<"PERCENTAGE" | "FIXED_AMOUNT">()
    .oneOf(["PERCENTAGE", "FIXED_AMOUNT"])
    .when("isOnSale", {
      is: true,
      then: (schema) => schema.required("Select discount type"),
      otherwise: (schema) => schema.optional(),
    }),
  discountValue: yup
    .number()
    .positive("Discount must be positive")
    .when("isOnSale", {
      is: true,
      then: (schema) => schema.required("Discount value required"),
      otherwise: (schema) => schema.optional(),
    }),
  saleStartsAt: yup.string().nullable().optional(),
  saleEndsAt: yup.string().nullable().optional(),
  categoryId: yup
    .string()
    .required("Category is required")
    .min(1, "Please select a category"),
  promotionIds: yup.array().of(yup.string()).optional(),
  defaultVariantId: yup.string().nullable().optional(),
  specs: yup
    .object()
    .test(
      "specs-key-value",
      "Specs must be key-value pairs (string keys and string values)",
      function (value) {
        if (!value) return true; // Optional field
        return Object.entries(value).every(
          ([key, val]) =>
            typeof key === "string" &&
            key.trim().length > 0 &&
            typeof val === "string" &&
            val.trim().length > 0
        );
      }
    )
    .optional(),
  variants: yup
    .array()
    .of(productVariantSchema)
    .min(1, "At least one variant is required")
    .required("At least one variant is required"),
});

export type ProductFormData = yup.InferType<typeof productSchema>;
export type ProductVariantFormData = yup.InferType<typeof productVariantSchema>;

