import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { FormSkeleton } from "@/lib/ui/loading";

export default function LoginLoading() {
  return (
    <Container>
      <Section>
        <div className="max-w-md mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>

          {/* Form skeleton */}
          <FormSkeleton fields={2} />

          {/* Links skeleton */}
          <div className="text-center space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
          </div>
        </div>
      </Section>
    </Container>
  );
}
