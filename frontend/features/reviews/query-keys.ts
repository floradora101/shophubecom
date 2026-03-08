/**
 * Product Reviews Query Keys Factory
 */

import type { ReviewsListParams } from "./api";

export const reviewKeys = {
  all: ["reviews"] as const,

  list: (
    productIdOrSlug: string,
    params?: ReviewsListParams
  ): readonly [string, string, ...unknown[]] => [
    ...reviewKeys.all,
    "list",
    productIdOrSlug,
    ...(params ? [params] : []),
  ],
};
