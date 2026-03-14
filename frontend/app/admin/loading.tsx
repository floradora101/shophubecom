import { AdminLoadingState } from "./_components/AdminLoadingState";

/**
 * Admin route loading state - shown while page chunks load (code-split).
 */
export default function AdminLoading() {
  return <AdminLoadingState className="py-32" />;
}
