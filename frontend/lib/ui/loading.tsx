// Loading UI helpers and utilities
import { SkeletonBlock } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Route-level loading skeletons for common patterns

/**
 * Generic page loading skeleton with centered spinner
 */
export function PageLoadingSpinner({
  message = "Loading...",
  variant = "full",
}: {
  message?: string;
  variant?: "full" | "inline";
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <LoadingSpinner variant={variant} message={message} />
    </div>
  );
}

/**
 * Products grid loading skeleton
 */
export function ProductsGridSkeletonBlock({ count = 8 }: { count?: number } = {}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <SkeletonBlock className="aspect-square w-full" />
          <div className="p-4 space-y-3">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-6 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Category listing skeleton
 */
export function CategoryGridSkeletonBlock({ count = 6 }: { count?: number } = {}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="text-center space-y-2">
          <SkeletonBlock className="w-16 h-16 rounded-full mx-auto" />
          <SkeletonBlock className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/**
 * Search results loading skeleton
 */
export function SearchResultsSkeletonBlock() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <SkeletonBlock className="h-8 w-64 mx-auto" />
        <SkeletonBlock className="h-4 w-96 mx-auto" />
      </div>
      <ProductsGridSkeletonBlock count={12} />
    </div>
  );
}

/**
 * Cart items loading skeleton
 */
export function CartItemsSkeletonBlock({ count = 3 }: { count?: number } = {}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex space-x-4 p-4 border border-gray-200 rounded-lg"
        >
          <SkeletonBlock className="w-20 h-20 rounded" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Profile sections loading skeleton
 */
export function ProfileSkeletonBlock() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <SkeletonBlock className="w-24 h-24 rounded-full mx-auto" />
        <SkeletonBlock className="h-6 w-48 mx-auto" />
        <SkeletonBlock className="h-4 w-64 mx-auto" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="p-6 border border-gray-200 rounded-lg space-y-3"
          >
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form loading skeleton
 */
export function FormSkeletonBlock({ fields = 4 }: { fields?: number } = {}) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      ))}
      <SkeletonBlock className="h-10 w-full" />
    </div>
  );
}

// Inline loading states for actions

/**
 * Button loading state
 */
export function ButtonSpinner({
  size = "sm",
}: { size?: "sm" | "md" | "lg" } = {}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 ${sizeClasses[size]}`}
    />
  );
}

/**
 * Inline loading text
 */
export function InlineLoading({
  message = "Loading...",
}: { message?: string } = {}) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <LoadingSpinner size="sm" variant="inline" />
      <span>{message}</span>
    </div>
  );
}
