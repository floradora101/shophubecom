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

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
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
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function RegisterForm({ onSuccess, redirectUrl }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
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
    resolver: yupResolver(registerSchema) as Resolver<RegisterFormData>,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="First name"
            error={errors.firstName?.message}
            className="group"
          >
            <Input
              type="text"
              placeholder="John"
              {...register("firstName")}
              error={!!errors.firstName}
              className="h-12 px-4 rounded-lg border-warm-gray-200 group-hover:border-warm-gray-300 focus:border-primary-500 transition-all duration-200"
            />
          </FormField>
          <FormField
            label="Last name"
            error={errors.lastName?.message}
            className="group"
          >
            <Input
              type="text"
              placeholder="Doe"
              {...register("lastName")}
              error={!!errors.lastName}
              className="h-12 px-4 rounded-lg border-warm-gray-200 group-hover:border-warm-gray-300 focus:border-primary-500 transition-all duration-200"
            />
          </FormField>
        </div>

        <FormField
          label="Email address"
          required
          error={errors.email?.message}
          className="group"
        >
          <Input
            type="email"
            placeholder="you@example.com"
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

        <FormField
          label="Confirm Password"
          required
          error={errors.confirmPassword?.message}
          className="group"
        >
          <Input
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            className="h-12 px-4 rounded-lg border-warm-gray-200 group-hover:border-warm-gray-300 focus:border-primary-500 transition-all duration-200"
          />
        </FormField>
      </div>

      <div className="py-2">
        <p
          className="text-[10px] text-warm-gray-500 leading-relaxed italic border-l-2 border-primary-100 pl-4 py-1"
          role="note"
        >
          By creating an account, you agree to our next-gen data processing
          protocols and privacy ecosystem.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          Initialize Account
        </Button>
      </div>
    </form>
  );
}
