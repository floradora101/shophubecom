/**
 * Admin Sidebar Store
 *
 * Zustand store for managing admin sidebar state with design system integration.
 * Provides collapsed/expanded state and mobile menu state for the admin panel.
 *
 * Features:
 * - Persistent collapsed state using localStorage
 * - Mobile menu overlay state
 * - Clean API for state management
 * - Design system compliant
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  // State
  isCollapsed: boolean;
  isMobileOpen: boolean;

  // Actions
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // Initial state
      isCollapsed: false,
      isMobileOpen: false,

      /**
       * Toggle collapsed state (desktop only)
       */
      toggleCollapsed: () => {
        set((state) => ({
          isCollapsed: !state.isCollapsed,
        }));
      },

      /**
       * Set collapsed state explicitly
       */
      setCollapsed: (collapsed: boolean) => {
        set({ isCollapsed: collapsed });
      },

      /**
       * Open mobile sidebar
       */
      openMobile: () => {
        set({ isMobileOpen: true });
      },

      /**
       * Close mobile sidebar
       */
      closeMobile: () => {
        set({ isMobileOpen: false });
      },

      /**
       * Toggle mobile sidebar
       */
      toggleMobile: () => {
        set((state) => ({
          isMobileOpen: !state.isMobileOpen,
        }));
      },
    }),
    {
      name: "admin-sidebar-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist collapsed state, not mobile state
      partialize: (state: SidebarState) => ({
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);

// Selector helpers to minimize subscriptions in components
export const selectSidebarState = (state: SidebarState) => ({
  isCollapsed: state.isCollapsed,
  isMobileOpen: state.isMobileOpen,
});

export const selectSidebarActions = (state: SidebarState) => ({
  toggleCollapsed: state.toggleCollapsed,
  setCollapsed: state.setCollapsed,
  openMobile: state.openMobile,
  closeMobile: state.closeMobile,
  toggleMobile: state.toggleMobile,
});
