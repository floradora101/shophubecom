/**
 * Product Reviews API
 *
 * Backend-backed only. No mock support — reviews require real backend.
 */

import { apiGet, apiGetWithParams, apiPost } from "@/lib/api/request";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string | null;
  content: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviews: number;
}

export interface ReviewsListParams {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
}

export interface ReviewsListResponse {
  data: Review[];
  stats: ReviewStats;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
}

export const reviewsApi = {
  /**
   * List reviews for a product (by slug or id)
   */
  async getReviews(
    productIdOrSlug: string,
    params: ReviewsListParams = {}
  ): Promise<ReviewsListResponse> {
    return apiGetWithParams<ReviewsListResponse>(
      `/products/${encodeURIComponent(productIdOrSlug)}/reviews`,
      params
    );
  },

  /**
   * Create a review (authenticated users only)
   */
  async createReview(
    productIdOrSlug: string,
    payload: CreateReviewPayload
  ): Promise<Review> {
    return apiPost<Review>(
      `/products/${encodeURIComponent(productIdOrSlug)}/reviews`,
      payload
    );
  },
};
