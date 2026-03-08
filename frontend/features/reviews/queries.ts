/**
 * Product Reviews React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, type CreateReviewPayload } from "./api";
import { reviewKeys } from "./query-keys";

export function useProductReviewsQuery(
  productIdOrSlug: string,
  params: { page?: number; limit?: number; sortBy?: "newest" | "oldest" | "highest" | "lowest" } = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.list(productIdOrSlug, params),
    queryFn: () => reviewsApi.getReviews(productIdOrSlug, params),
    enabled: options?.enabled !== false && !!productIdOrSlug,
  });
}

export function useCreateReviewMutation(productIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      reviewsApi.createReview(productIdOrSlug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.list(productIdOrSlug),
      });
    },
  });
}
