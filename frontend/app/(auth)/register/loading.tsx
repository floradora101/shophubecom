import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { FormSkeleton } from "@/lib/ui/loading";

export default function RegisterLoading() {
  return (
    <Container>
      <Section>
        <div className="max-w-md mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <SkeletonBlock className="h-8 w-40 rounded mx-auto" />
            <SkeletonBlock className="h-4 w-64 rounded mx-auto" />
          </div>

          {/* Form skeleton */}
          <FormSkeleton fields={4} />

          {/* Links skeleton */}
          <div className="text-center space-y-2">
            <SkeletonBlock className="h-4 w-48 rounded mx-auto" />
            <SkeletonBlock className="h-4 w-40 rounded mx-auto" />
          </div>
        </div>
      </Section>
    </Container>
  );
}



