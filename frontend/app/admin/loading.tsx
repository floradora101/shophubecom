import { Loader2 } from "lucide-react";
import { Text } from "@/components/ui/typography";

/**
 * Admin route loading state - shown while page chunks load (code-split).
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <Text className="text-warm-gray-500 font-medium">Loading...</Text>
    </div>
  );
}
