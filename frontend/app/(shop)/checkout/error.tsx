"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/error-state";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Checkout page error:", error);
  }, [error]);

  return (
    <Container>
      <Section>
        <ErrorState
          title="Checkout Unavailable"
          description="We're experiencing issues with the checkout process. Your cart items are safe and will be available when you return."
          onRetry={reset}
          retryText="Retry Checkout"
        />
      </Section>
    </Container>
  );
}
