/**
 * CheckoutCardSection Component
 *
 * Wrapper component that reduces repetition of Card + FormSection pattern.
 */

"use client";

import { Card } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { cn } from "@/lib/utils/cn";

interface CheckoutCardSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "subtle";
  icon?: React.ComponentType<{ className?: string }>;
}

export function CheckoutCardSection({
  title,
  description,
  children,
  tone,
  icon: Icon,
}: CheckoutCardSectionProps) {
  return (
    <Card
      variant={tone === "subtle" ? "default" : "bordered"}
      className={cn(
        "transition-all duration-300",
        tone === "subtle"
          ? "border-warm-gray-200 bg-warm-gray-50/30"
          : "hover:border-primary-200 hover:shadow-md"
      )}
    >
      <FormSection
        title={title}
        description={description}
        className="p-6 sm:p-8"
        headerClassName="mb-2"
        actions={
          Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )
        }
      >
        {children}
      </FormSection>
    </Card>
  );
}
