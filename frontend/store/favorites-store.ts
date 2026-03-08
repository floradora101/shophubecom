/**
 * Favorites store - syncs with backend when user is authenticated.
 * Guest users: localStorage only. Authenticated: backend + localStorage.
 */
import { create } from "zustand";
import { logWarning } from "@/lib/errors/logger";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { favoritesApi } from "@/features/favorites/api";
import { USE_MOCKS } from "@/lib/flags";

interface FavoritesState {
  favoriteProductIds: string[];
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  /** Merge local + backend favorites and sync. Call when user becomes authenticated. */
  mergeAndSync: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteProductIds: [],

      addFavorite: async (productId) => {
        const current = get().favoriteProductIds;
        if (current.includes(productId)) return;

        const isAuth =
          !USE_MOCKS && useAuthStore.getState().status === "authenticated";
        if (isAuth) {
          try {
            await favoritesApi.add(productId);
          } catch (err) {
            logWarning(err instanceof Error ? err.message : "Favorites add failed", {
              action: "favorites_add",
              metadata: { productId },
            });
            toast.error("Couldn't save favorite. Please try again.");
            return;
          }
        }
        set({ favoriteProductIds: [...current, productId] });
      },

      removeFavorite: async (productId) => {
        const current = get().favoriteProductIds;
        if (!current.includes(productId)) return;

        const isAuth =
          !USE_MOCKS && useAuthStore.getState().status === "authenticated";
        if (isAuth) {
          try {
            await favoritesApi.remove(productId);
          } catch (err) {
            logWarning(err instanceof Error ? err.message : "Favorites remove failed", {
              action: "favorites_remove",
              metadata: { productId },
            });
            toast.error("Couldn't remove favorite. Please try again.");
            return;
          }
        }
        set({
          favoriteProductIds: current.filter((id) => id !== productId),
        });
      },

      toggleFavorite: async (productId) => {
        const current = get().favoriteProductIds;
        if (current.includes(productId)) {
          await get().removeFavorite(productId);
        } else {
          await get().addFavorite(productId);
        }
      },

      isFavorite: (productId) => get().favoriteProductIds.includes(productId),

      clearFavorites: () => set({ favoriteProductIds: [] }),

      mergeAndSync: async () => {
        const isAuth =
          !USE_MOCKS && useAuthStore.getState().status === "authenticated";
        if (!isAuth) return;

        try {
          const localIds = get().favoriteProductIds;
          const backendIds = await favoritesApi.getAll();
          const merged = [...new Set([...localIds, ...backendIds])];
          const synced = await favoritesApi.sync(merged);
          set({ favoriteProductIds: synced });
        } catch (err) {
          logWarning(err instanceof Error ? err.message : "Favorites sync failed", {
            action: "favorites_mergeAndSync",
          });
          toast.error("Couldn't sync favorites. Please try again.");
        }
      },
    }),
    {
      name: "favorites-storage",
      partialize: (state) => ({ favoriteProductIds: state.favoriteProductIds }),
    }
  )
);
