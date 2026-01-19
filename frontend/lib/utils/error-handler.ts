/**
 * @file error-handler.ts
 *
 * Error Handler Utilities (Legacy Support)
 *
 * Purpose:
 * Maintains backward compatibility with existing code while using new error infrastructure.
 * This file re-exports utilities from the centralized error handling system.
 *
 * Deprecation Note:
 * Consider using @/lib/errors directly for new code.
 * This file is kept for backward compatibility.
 */

// Re-export from centralized error system
// Note: Using re-export to maintain backward compatibility
export { extractErrorMessage } from "@/lib/errors/utils";
