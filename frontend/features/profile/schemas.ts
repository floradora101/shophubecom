import * as yup from "yup";

export const updateProfileSchema = yup.object({
  firstName: yup
    .string()
    .max(100, "First name must be less than 100 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .max(100, "Last name must be less than 100 characters")
    .required("Last name is required"),
});

export const addressSchema = yup.object({
  name: yup
    .string()
    .max(100, "Name must be less than 100 characters")
    .required("Name is required"),
  street: yup
    .string()
    .max(255, "Street/Area must be less than 255 characters")
    .required("Street/Area is required"),
  city: yup
    .string()
    .max(100, "City must be less than 100 characters")
    .required("City is required"),
  state: yup
    .string()
    .max(100, "District must be less than 100 characters")
    .required("District is required"),
  zipCode: yup
    .string()
    .max(20, "Postal code must be less than 20 characters")
    .optional(),
  phone: yup
    .string()
    .max(20, "Phone must be less than 20 characters")
    .required("Phone is required"),
  isDefault: yup.boolean().optional(),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

