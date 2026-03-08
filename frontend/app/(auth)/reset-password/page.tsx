"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { authApi } from "@/features/auth/api";
import { resetPasswordSchema } from "@/features/auth/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";
import { SectionTitle } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";

type ResetPasswordFormData = {
  token: string;
  password: string;
  confirmPassword: string;
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTokenReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema) as Resolver<ResetPasswordFormData>,
    defaultValues: { token: tokenFromUrl },
  });

  useEffect(() => {
    if (tokenFromUrl) setValue("token", tokenFromUrl);
  }, [tokenFromUrl, setValue]);

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to reset password. The link may have expired.",
    });

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    try {
      await authApi.resetPassword(data.token, data.password);
      router.replace("/login?message=Password reset successful. Sign in with your new password.");
    } catch (err) {
      handleError(err);
    }
  };

  if (!tokenReady) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="md" variant="inline" />
      </div>
    );
  }

  if (!tokenFromUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
        <div className="w-full max-w-[440px] mx-auto text-center space-y-6">
          <SectionTitle
            italic="Invalid"
            bold="link"
            className="text-2xl md:text-3xl"
          />
          <p className="text-warm-gray-600 text-sm">
            This reset link is invalid or missing. Request a new one from the
            forgot password page.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Forgot password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
      <div className="w-full max-w-[440px] mx-auto">
        <div className="flex flex-col gap-10">
          <div className="space-y-3 text-center">
            <Badge variant="primary" size="lg" className="mx-auto">
              <Sparkles className="w-3 h-3" />
              <span>New password</span>
            </Badge>
            <SectionTitle
              italic="Reset"
              bold="Password"
              className="text-2xl md:text-3xl"
            />
            <p className="text-[13px] text-warm-gray-500 font-medium">
              Choose a new password. This link expires in 15 minutes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, handleValidationError)}
            className="space-y-5 w-full"
            noValidate
            aria-label="Reset password form"
          >
            <input type="hidden" {...register("token")} />
            <FormErrorAlert
              error={formError}
              onDismiss={clearError}
              dismissible
            />
            <FormField
              label="New password"
              required
              error={errors.password?.message}
              className="group"
            >
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={!!errors.password}
                className="h-12 px-4 rounded-lg border-warm-gray-200 group-hover:border-warm-gray-300 focus:border-primary-500 transition-all duration-200"
              />
            </FormField>
            <FormField
              label="Confirm password"
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
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg"
            >
              Reset password
            </Button>
          </form>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="md" variant="inline" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
