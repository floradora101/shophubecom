"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/error-state";
import { logError } from "@/lib/errors/logger";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, {
      component: "CartPage",
      action: "page_error",
      route: "/cart",
    });
  }, [error]);

  return (
    <Container>
      <Section>
        <ErrorState
          title="Unable to Load Cart"
          description="We couldn't load your cart at this time. This might be due to a temporary issue."
          onRetry={reset}
          retryText="Try Again"
        />
      </Section>
    </Container>
  );
}
