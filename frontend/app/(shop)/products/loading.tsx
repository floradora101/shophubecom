import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProductsGridSkeleton } from "@/lib/ui/loading";

export default function ProductsLoading() {
  return (
    <Container>
      <Section>
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>

          {/* Filters skeleton */}
          <div className="flex flex-wrap gap-4 justify-center">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"
              />
            ))}
          </div>

          {/* Sort skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          </div>

          {/* Products grid skeleton */}
          <ProductsGridSkeleton count={12} />
        </div>
      </Section>
    </Container>
  );
}
