// Reusable shell component for admin pages with consistent layout and styling.
// Matches the UI vibe of storefront/checkout pages using Section, Container, Stack, and theme tokens.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface AdminPageShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  backHref?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageShell({
  title,
  description,
  eyebrow,
  backHref,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="min-h-screen relative">
      {/* Background Gradients - Same as storefront */}
      <div className="fixed inset-0 bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10 pointer-events-none" />
      <div className="fixed inset-0 bg-hero -z-10 pointer-events-none" />
      <div className="relative z-10">
        <Section spacing="lg">
          <Container size="md">
            <Stack spacing="xl" align="stretch">
              {/* Header */}
              <div className="text-center space-y-2">
                {eyebrow && (
                  <Text className="text-warm-gray-600 uppercase text-sm font-medium tracking-wide">
                    {eyebrow}
                  </Text>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {backHref && (
                      <Link href={backHref}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <div className="text-left">
                      <Heading level="h2">{title}</Heading>
                      {description && (
                        <Text className="text-warm-gray-600 mt-1">
                          {description}
                        </Text>
                      )}
                    </div>
                  </div>
                  {actions && <div className="flex gap-3">{actions}</div>}
                </div>
              </div>

              {/* Content */}
              <Card className="p-6">{children}</Card>
            </Stack>
          </Container>
        </Section>
      </div>
    </div>
  );
}
