import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProductsGridSkeleton } from "@/lib/ui/loading";

export default function CategoryProductsLoading() {
  return (
    <Container>
      <Section>
        <div className="space-y-8">
          {/* Category header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse" />
          </div>

          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>

          {/* Products grid skeleton */}
          <ProductsGridSkeleton count={12} />
        </div>
      </Section>
    </Container>
  );
}



