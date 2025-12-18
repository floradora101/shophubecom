// User registration form with validation.
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../store/auth-store";
import { registerSchema } from "../../lib/validations/auth.schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import type { RegisterFormData } from "../../lib/types/auth.types";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function RegisterForm({ onSuccess, redirectUrl }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register: registerUser,
    isSubmitting,
    error,
    clearError,
  } = useAuthStore(
    useShallow((state) => ({
      // subscribe only to fields used by the form
      register: state.register,
      isSubmitting: state.isSubmitting,
      error: state.error,
      clearError: state.clearError,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      // Backend will handle firstName/lastName defaults
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
    } catch {
      // Error handled by store
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
          label="Email address *"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password *"
          type="password"
          placeholder="Create a strong password"
          {...register("password")}
          error={errors.password?.message}
        />
      </div>

      <p className="text-xs text-gray-500">
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
