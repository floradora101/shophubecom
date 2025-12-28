/**
 * @file LoginForm.tsx
 *
 * Purpose:
 * Form component for user login. Handles form submission, validation, and
 * authentication flow for existing users.
 *
 * Responsibilities:
 * - Renders login form with email and password fields
 * - Validates form input using yup schema (loginSchema)
 * - Calls authStore.login() on form submission
 * - Handles form errors and displays error messages
 * - Redirects to dashboard or redirectUrl after successful login
 * - Supports optional redirectUrl prop for post-login navigation
 *
 * How it fits into auth flow:
 * - User enters email and password
 * - Form validates input client-side
 * - On submit: calls authStore.login() which calls authApi.login()
 * - Backend validates credentials and sets tokens in httpOnly cookies
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
import { loginSchema } from "../schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import type { LoginFormData } from "../types";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, redirectUrl }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore(
    useShallow((state) => ({
      login: state.login,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData & { rememberMe?: boolean }>({
    resolver: yupResolver(loginSchema),
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to log in. Please check your credentials.",
    });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      // Login succeeds - store will update user state
      await login(data);
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
      aria-label="Login form"
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <div className="space-y-4">
        <FormField
          label="Username or email address"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            error={!!errors.email}
          />
        </FormField>

        <FormField label="Password" required error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Enter your password"
            {...register("password")}
            error={!!errors.password}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-between">
        <Checkbox
          id="remember-me"
          label="Remember me"
          {...register("rememberMe")}
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
        size="lg"
      >
        LOG IN
      </Button>

      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-primary-500 hover:text-primary-600 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        >
          Lost your password?
        </a>
      </div>
    </form>
  );
}
