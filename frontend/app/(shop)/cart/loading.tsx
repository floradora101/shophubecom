import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CartItemsSkeleton } from "@/lib/ui/loading";

export default function CartLoading() {
  return (
    <Container>
      <Section>
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>

          {/* Cart items skeleton */}
          <div className="max-w-2xl mx-auto">
            <CartItemsSkeleton count={4} />
          </div>

          {/* Summary skeleton */}
          <div className="max-w-md mx-auto space-y-4">
            <div className="border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Section>
    </Container>
  );
}
