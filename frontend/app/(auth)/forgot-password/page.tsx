"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { authApi } from "@/features/auth/api";
import { forgotPasswordSchema } from "@/features/auth/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";
import { SectionTitle } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";

type ForgotPasswordFormData = { email: string };

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to send reset link. Please try again.",
    });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearError();
    try {
      await authApi.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      handleError(err);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
        <div className="w-full max-w-[440px] mx-auto text-center space-y-6">
          <Badge variant="primary" size="lg" className="mx-auto">
            <Sparkles className="w-3 h-3" />
            <span>Check your email</span>
          </Badge>
          <SectionTitle
            italic="Reset"
            bold="Link sent"
            className="text-2xl md:text-3xl"
          />
          <p className="text-warm-gray-600 text-sm">
            If an account exists for that email, we&apos;ve sent a password reset
            link. It expires in 15 minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
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
              <span>Password reset</span>
            </Badge>
            <SectionTitle
              italic="Forgot"
              bold="Password?"
              className="text-2xl md:text-3xl"
            />
            <p className="text-[13px] text-warm-gray-500 font-medium">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, handleValidationError)}
            className="space-y-5 w-full"
            noValidate
            aria-label="Forgot password form"
          >
            <FormErrorAlert
              error={formError}
              onDismiss={clearError}
              dismissible
            />
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
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg"
            >
              Send reset link
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
