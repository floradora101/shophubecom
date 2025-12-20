/**
 * @file RegisterForm.tsx
 *
 * Purpose:
 * Form component for user registration. Handles form submission, validation, and
 * account creation flow for new users.
 *
 * Responsibilities:
 * - Renders registration form with email, password, and confirm password fields
 * - Validates form input using yup schema (registerSchema)
 * - Calls authStore.register() on form submission
 * - Handles form errors and displays error messages
 * - Redirects to dashboard or redirectUrl after successful registration
 * - Supports optional redirectUrl prop for post-registration navigation
 *
 * How it fits into auth flow:
 * - User enters email, password, and confirms password
 * - Form validates input client-side (email format, password strength, match)
 * - On submit: calls authStore.register() which calls authApi.register()
 * - Backend creates user, hashes password, generates tokens
 * - Backend sets tokens in httpOnly cookies
 * - authStore updates state: user = userData, status = 'authenticated'
 * - Component redirects to dashboard or specified redirectUrl
 *
 * Security:
 * - Form validation prevents invalid submissions
 * - Passwords never stored in component state (only in form state)
 * - Tokens handled by backend in httpOnly cookies (not accessible to JS)
 */
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth-store";
import { registerSchema } from "../schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import type { RegisterFormData } from "../types";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function RegisterForm({ onSuccess, redirectUrl }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuthStore(
    useShallow((state) => ({
      register: state.register,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to register. Please try again.",
    });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      // Registration succeeds - store will update user state
      await registerUser(data);
      // Cart invalidation handled by AuthProvider when user state changes
      if (onSuccess) {
        onSuccess();
      } else {
        // Use redirectUrl prop, or searchParams, or default to "/products" (shop)
        // Ensure redirect is a valid path (starts with /) to prevent open redirects
        const redirectParam = redirectUrl || searchParams.get("redirect");
        const redirect =
          redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/products";
        router.replace(redirect);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleValidationError)}
      className="space-y-5 w-full"
      noValidate
      aria-label="Registration form"
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <div className="space-y-4">
        <FormField
          label="Email address"
          required
          error={errors.email?.message}
          helpText="We'll use this to sign you in"
        >
          <Input
            type="email"
            placeholder="your@email.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
        </FormField>

        <FormField
          label="Password"
          required
          error={errors.password?.message}
          helpText="Must contain uppercase, lowercase, number, and special character"
        >
          <Input
            type="password"
            placeholder="Create a strong password"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
        </FormField>
      </div>

      <p className="text-xs text-gray-500" role="note">
        Your personal data will be used to support your experience throughout
        this website, to manage access to your account, and for other purposes
        described in our privacy policy.
      </p>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
        size="lg"
      >
        REGISTER
      </Button>
    </form>
  );
}
