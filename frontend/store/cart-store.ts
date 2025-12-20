// Zustand store for cart UI state only.
// Cart data is owned by React Query (single source of truth).
//
// IMPORTANT: Do not store cart data here. React Query is source of truth.
// This store only manages UI state: isOpen, open, close, toggle.
//
// Optional enhancement: close cart sidebar automatically on successful checkout / route change (hook layer, not store).
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
