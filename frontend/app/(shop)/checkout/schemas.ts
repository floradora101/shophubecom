/**
 * Checkout form validation schema.
 * Validates shipping address, contact info, and shipping method.
 */
import * as yup from "yup";

export const checkoutSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .min(6, "Phone number must be at least 6 characters")
    .max(32, "Phone number must be at most 32 characters"),
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters")
    .optional(),
  country: yup
    .string()
    .trim()
    .required("Country is required")
    .max(100, "Country must be at most 100 characters"),
  city: yup
    .string()
    .trim()
    .required("City is required")
    .min(1, "City is required")
    .max(100, "City must be at most 100 characters"),
  state: yup.string().trim().max(100, "State must be at most 100 characters").optional(),
  street1: yup
    .string()
    .trim()
    .required("Street address is required")
    .min(1, "Street address is required")
    .max(255, "Street address must be at most 255 characters"),
  postalCode: yup
    .string()
    .trim()
    .max(20, "Postal code must be at most 20 characters")
    .optional(),
  notes: yup.string().trim().max(500, "Notes must be at most 500 characters").optional(),
  shippingOption: yup
    .string()
    .oneOf(["pickup", "beirut", "outside"], "Please select a shipping method")
    .required("Shipping method is required"),
});

export type CheckoutSchemaType = yup.InferType<typeof checkoutSchema>;
