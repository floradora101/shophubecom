/**
 * @file AdminErrorUnauthorized.tsx
 *
 * Purpose:
 * Displays a 401 Unauthorized error for admin routes when user is not authenticated
 * or authentication has expired.
 *
 * Design:
 * - Consistent with app error state patterns
 * - Clear messaging about authentication required
 * - Provides login redirect
 */
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { buildFullPath, buildLoginRedirect } from "@/features/auth/routes";

export function AdminErrorUnauthorized() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogin = () => {
    const search = searchParams.toString();
    const fullPath = buildFullPath(pathname, search);
    const loginPath = buildLoginRedirect("/login", fullPath);
    router.push(loginPath);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full p-8 border-warm-gray-200 shadow-lg">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-amber-100 p-4">
              <Lock className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-2">
            <Text className="text-sm font-mono font-semibold text-amber-600">401</Text>
          </div>

          {/* Title */}
          <Heading level="h2" className="mb-3 text-warm-gray-900">
            Authentication Required
          </Heading>

          {/* Description */}
          <Text className="mb-8 text-warm-gray-600">
            You need to be logged in to access the admin area. Please sign in with your
            admin account to continue.
          </Text>

          {/* Actions */}
          <div className="flex justify-center">
            <Button
              onClick={handleLogin}
              className="rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
