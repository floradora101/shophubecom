import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  firstName: yup.string().max(64, "First name must not exceed 64 characters").optional(),
  lastName: yup.string().max(64, "Last name must not exceed 64 characters").optional(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
});

export const resetPasswordSchema = yup.object({
  token: yup.string().required("Reset token is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

