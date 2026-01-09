import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function CheckoutLoading() {
  return (
    <Container>
      <Section>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress steps skeleton */}
              <div className="flex justify-center space-x-8">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
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
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }, (_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                          <div className="h-10 bg-gray-200 rounded animate-pulse" />
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
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  ))}
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
        </div>
      </Section>
    </Container>
  );
}
