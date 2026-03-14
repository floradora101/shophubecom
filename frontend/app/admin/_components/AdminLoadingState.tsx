import { LoadingSpinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils/cn";

interface AdminLoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Canonical loading spinner for all admin pages.
 * Uses shared LoadingSpinner for consistency across the app.
 */
export function AdminLoadingState({
  message = "Loading…",
  className,
}: AdminLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 gap-4",
        className,
      )}
      role="status"
      aria-label={message}
    >
      <LoadingSpinner size="md" variant="inline" />
      <Text className="text-warm-gray-500 font-medium">{message}</Text>
    </div>
  );
}
