/**
 * Favorites API - syncs with backend when user is authenticated
 */
import { apiGet, apiPost, apiDelete } from "@/lib/api/request";

export const favoritesApi = {
  async getAll(): Promise<string[]> {
    return apiGet<string[]>("/favorites");
  },

  async add(productId: string): Promise<void> {
    await apiPost<void>(`/favorites/${productId}`);
  },

  async remove(productId: string): Promise<void> {
    await apiDelete<void>(`/favorites/${productId}`);
  },

  /**
   * Sync favorites: replace backend favorites with given list.
   * Returns merged list from backend.
   */
  async sync(productIds: string[]): Promise<string[]> {
    return apiPost<string[]>("/favorites/sync", { productIds });
  },
};
