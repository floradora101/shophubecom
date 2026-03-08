"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URL-based pagination for admin list pages.
 * Keeps page in the URL (like frontstore) for shareability and refresh consistency.
 */
export function useAdminPagination() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const page = useMemo(() => {
    const raw = searchParams.get("page");
    const n = parseInt(raw || "1", 10);
    return isNaN(n) || n < 1 ? 1 : n;
  }, [searchParams]);

  const setPage = useCallback(
    (newPage: number) => {
      const p = new URLSearchParams(searchParams.toString());
      const safe = Math.max(1, newPage);
      if (safe === 1) {
        p.delete("page");
      } else {
        p.set("page", String(safe));
      }
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return { page, setPage };
}
