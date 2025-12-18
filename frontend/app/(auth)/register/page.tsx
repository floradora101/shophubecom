// Registration page route for creating new accounts.
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RegisterForm } from "../../../components/forms/RegisterForm";

function RegisterContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="text-gray-600">Join ShopHub and start shopping today!</p>
      </div>

      <RegisterForm redirectUrl={redirect || undefined} />

      <div className="pt-4 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href={
              redirect
                ? `/login?redirect=${encodeURIComponent(redirect)}`
                : "/login"
            }
            className="text-primary-500 hover:text-primary-600 font-semibold"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="space-y-8">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
