import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { ProductsGridSkeleton } from "@/lib/ui/loading";

export default function ProductsLoading() {
  return (
    <Container>
      <Section>
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <SkeletonText className="mx-auto" lines={1} lineHeight="h-8" />
            <SkeletonText className="mx-auto" lines={1} lineHeight="h-4" />
          </div>

          {/* Filters skeleton */}
          <div className="flex flex-wrap gap-4 justify-center">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBlock
                key={i}
                className="h-10 rounded-full w-24"
              />
            ))}
          </div>

          {/* Sort skeleton */}
          <div className="flex justify-between items-center">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-8 w-32" />
          </div>

          {/* Products grid skeleton */}
          <ProductsGridSkeleton count={12} />
        </div>
      </Section>
    </Container>
  );
}
