import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <Container>
      <Section>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <SkeletonText className="mx-auto" lines={1} lineHeight="h-8" />
            <SkeletonText className="mx-auto" lines={1} lineHeight="h-4" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress steps skeleton */}
              <div className="flex justify-center space-x-8">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <SkeletonCircle className="w-8 h-8" />
                    <SkeletonBlock className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Form sections skeleton */}
              <div className="space-y-6">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-6 space-y-4"
                  >
                    <SkeletonBlock className="h-6 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }, (_, j) => (
                        <div key={j} className="space-y-2">
                          <SkeletonBlock className="h-4 w-24" />
                          <SkeletonBlock className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <SkeletonBlock className="h-6 w-24" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex justify-between">
                      <SkeletonBlock className="h-4 w-32" />
                      <SkeletonBlock className="h-4 w-16" />
                    </div>
                  ))}
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
        </div>
      </Section>
    </Container>
  );
}
