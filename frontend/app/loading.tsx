// Root loading - minimal fallback for all routes (admin, auth, shop, etc.)
// Route-specific loading (e.g. admin, frontstore) is shown per segment.
// This prevents the frontstore skeleton from flashing when navigating to admin.
import { LoadingSpinner } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <LoadingSpinner size="lg" variant="card" />
    </div>
  );
}
