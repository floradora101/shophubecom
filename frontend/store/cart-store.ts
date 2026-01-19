// Zustand store for cart UI state ONLY.
// Cart data is owned by React Query (single source of truth for server data).
//
// IMPORTANT: This store manages ONLY UI state (isOpen, shippingOption).
// Cart data comes from React Query via useCartQuery().

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  // UI state only
  isOpen: boolean;

  // Shipping option (UI preference)
  shippingOption: "pickup" | "beirut" | "outside";

  // UI actions
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;

  // Shipping actions
  setShippingOption: (option: "pickup" | "beirut" | "outside") => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // UI state only
      isOpen: false,

      // Shipping option (UI preference)
      shippingOption: "pickup",

      // UI actions
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: (open) => {
        const target = open ?? !get().isOpen;
        set({ isOpen: target });
      },

      // Shipping actions
      setShippingOption: (option) => set({ shippingOption: option }),
    }),
    {
      name: "cart-ui-storage",
      partialize: (state) => ({
        shippingOption: state.shippingOption,
      }),
    }
  )
);
