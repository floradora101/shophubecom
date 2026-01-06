/**
 * Favorites/Wishlist Hook
 *
 * Simple client-side favorites management using Zustand store.
 * Stores favorite product IDs locally with persistence.
 */

import { useCallback } from "react";
import { useFavoritesStore } from "@/store/favorites-store";

/**
 * Main favorites hook
 */
export function useFavorites() {
  // State from Zustand
  const favoriteProductIds = useFavoritesStore((state) => state.favoriteProductIds);

  // Actions from Zustand
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);

  // Computed values
  const favoriteCount = favoriteProductIds.length;

  return {
    // State
    favoriteProductIds,
    favoriteCount,

    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}

