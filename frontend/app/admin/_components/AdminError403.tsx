/**
 * @file AdminError403.tsx
 *
 * Purpose:
 * Displays a 403 Forbidden error for admin routes when user is authenticated
 * but doesn't have ADMIN role.
 *
 * Design:
 * - Consistent with app error state patterns
 * - Clear messaging about access denied
 * - Provides navigation options
 */
"use client";

import { useRouter } from "next/navigation";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";

export function AdminError403() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full p-8 border-warm-gray-200 shadow-lg">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <ShieldX className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-2">
            <Text className="text-sm font-mono font-semibold text-red-600">403</Text>
          </div>

          {/* Title */}
          <Heading level="h2" className="mb-3 text-warm-gray-900">
            Access Denied
          </Heading>

          {/* Description */}
          <Text className="mb-8 text-warm-gray-600">
            You don't have permission to access the admin area. Admin privileges are required
            to view this page.
          </Text>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
