// Zustand store for favorites/wishlist functionality.
// Manages favorite products state with persistence.

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  // Data
  favoriteProductIds: string[];

  // Actions
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial state
      favoriteProductIds: [],

      // Actions
      addFavorite: (productId) => {
        const currentFavorites = get().favoriteProductIds;
        if (!currentFavorites.includes(productId)) {
          set({
            favoriteProductIds: [...currentFavorites, productId],
          });
        }
      },

      removeFavorite: (productId) => {
        const currentFavorites = get().favoriteProductIds;
        set({
          favoriteProductIds: currentFavorites.filter((id) => id !== productId),
        });
      },

      toggleFavorite: (productId) => {
        const currentFavorites = get().favoriteProductIds;
        if (currentFavorites.includes(productId)) {
          set({
            favoriteProductIds: currentFavorites.filter((id) => id !== productId),
          });
        } else {
          set({
            favoriteProductIds: [...currentFavorites, productId],
          });
        }
      },

      isFavorite: (productId) => {
        return get().favoriteProductIds.includes(productId);
      },

      clearFavorites: () => {
        set({ favoriteProductIds: [] });
      },
    }),
    {
      name: "favorites-storage",
      partialize: (state) => ({ favoriteProductIds: state.favoriteProductIds }),
    }
  )
);

