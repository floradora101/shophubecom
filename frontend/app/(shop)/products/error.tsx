"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/error-state";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Products page error:", error);
  }, [error]);

  return (
    <Container>
      <Section>
        <ErrorState
          title="Unable to Load Products"
          description="We couldn't load the products at this time. This might be due to a temporary issue with our servers."
          onRetry={reset}
          retryText="Reload Products"
        />
      </Section>
    </Container>
  );
}
