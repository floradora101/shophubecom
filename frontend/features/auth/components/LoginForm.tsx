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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth-store";
import { loginSchema } from "../schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import type { LoginFormData } from "../types";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, redirectUrl }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore(
    useShallow((state) => ({
      login: state.login,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
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
          className="group"
        >
          <Input
            type="email"
            placeholder="name@company.com"
            {...register("email")}
            error={!!errors.email}
            className="h-12 px-4 rounded-lg border-warm-gray-200 group-hover:border-warm-gray-300 focus:border-primary-500 transition-all duration-200"
          />
        </FormField>

        <FormField
          label="Password"
          required
          error={errors.password?.message}
          className="group"
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              error={!!errors.password}
              className="h-12 px-4 pr-12 rounded-lg border-warm-gray-200 group-hover:border-warm-gray-300 focus:border-primary-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-warm-gray-400 hover:text-warm-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>
      </div>

      <div className="flex items-center justify-end py-2">
        <a
          href="/forgot-password"
          className="text-[10px] text-primary-600 hover:text-primary-700 font-black uppercase tracking-widest transition-all"
        >
          Forgot Password?
        </a>
      </div>

      <div className="space-y-4 pt-2">
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          Initialize Session
        </Button>
      </div>
    </form>
  );
}
