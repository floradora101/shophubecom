// User login form with validation.
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../store/auth-store";
import { loginSchema } from "../../lib/validations/auth.schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import type { LoginFormData } from "../../lib/types/auth.types";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, redirectUrl }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isSubmitting, error, clearError } = useAuthStore(
    useShallow((state) => ({
      // subscribe only to fields used by the form
      login: state.login,
      isSubmitting: state.isSubmitting,
      error: state.error,
      clearError: state.clearError,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData & { rememberMe?: boolean }>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
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
    } catch {
      // Error handled by store - wrong password shows form error, NO refresh attempt
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Input
          label="Username or email address *"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password *"
          type="password"
          placeholder="Enter your password"
          {...register("password")}
          error={errors.password?.message}
        />
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
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          Lost your password?
        </a>
      </div>
    </form>
  );
}
