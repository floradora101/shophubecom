// Login page route for signing users in.
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoginForm } from "@/features/auth";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your account to continue shopping
        </p>
      </div>

      <LoginForm redirectUrl={redirect || undefined} />

      <div className="pt-4 border-t border-gray-200">
        <div className="text-center space-y-3">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium block"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={
                redirect
                  ? `/register?redirect=${encodeURIComponent(redirect)}`
                  : "/register"
              }
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="md" variant="inline" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
