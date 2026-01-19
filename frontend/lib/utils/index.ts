/**
 * Utility Functions Barrel Export
 *
 * Centralized exports for all utility functions.
 * Import utilities from here for cleaner imports across the codebase.
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.2: Utility Consolidation
 */

// Core utilities
export * from "./cn";
export * from "./error-handler";

// Formatting utilities (price, date, currency)
export * from "./formatting";

// Product utilities
export * from "./products";

// Date utilities (also available via formatting)
export * from "./date";

