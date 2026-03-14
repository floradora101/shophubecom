import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ProductsGridSkeleton } from "@/lib/ui/loading";

export default function CategoryProductsLoading() {
  return (
    <Container>
      <Section>
        <div className="space-y-8">
          {/* Category header skeleton */}
          <div className="text-center space-y-4">
            <SkeletonBlock className="h-10 w-48 rounded mx-auto" />
            <SkeletonBlock className="h-4 w-80 rounded mx-auto" />
          </div>

          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-4 w-16 rounded" />
            <SkeletonBlock className="w-4 h-4 rounded shrink-0" />
            <SkeletonBlock className="h-4 w-24 rounded" />
          </div>

          {/* Products grid skeleton */}
          <ProductsGridSkeleton count={12} />
        </div>
      </Section>
    </Container>
  );
}



