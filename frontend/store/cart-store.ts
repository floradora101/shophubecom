// Zustand store for cart UI state only.
// Cart data is owned by React Query (single source of truth).
import { create } from "zustand";

interface CartUIState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
}

export const useCartStore = create<CartUIState>((set, get) => ({
  isOpen: false,

  open: () => set({ isOpen: true }),

  close: () => set({ isOpen: false }),

  toggle: (open) => {
    const target = open ?? !get().isOpen;
    set({ isOpen: target });
  },
}));
