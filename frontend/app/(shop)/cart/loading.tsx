import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { CartItemsSkeleton } from "@/lib/ui/loading";

export default function CartLoading() {
  return (
    <Container>
      <Section>
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <SkeletonText className="mx-auto" lines={1} lineHeight="h-8" />
            <SkeletonText className="mx-auto" lines={1} lineHeight="h-4" />
          </div>

          {/* Cart items skeleton */}
          <div className="max-w-2xl mx-auto">
            <CartItemsSkeleton count={4} />
          </div>

          {/* Summary skeleton */}
          <div className="max-w-md mx-auto space-y-4">
            <div className="border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <SkeletonBlock className="h-5 w-16" />
                  <SkeletonBlock className="h-5 w-20" />
                </div>
              </div>
            </div>
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      </Section>
    </Container>
  );
}
