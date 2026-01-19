/**
 * Auth Feature Types
 *
 * This file re-exports shared types from @/lib/types/shared for backward compatibility.
 * New code should import User directly from @/lib/types/shared.
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.1: Type Consolidation
 */

import type { User } from "@/lib/types/shared";

// Re-export shared types for backward compatibility
export type { User };

/**
 * Auth response from backend (cookie-based authentication)
 * Tokens are sent via httpOnly cookies, NOT in response body
 */
export interface AuthResponseData {
  user: User;
  message?: string;
  expiresIn?: number; // Token expiration time in seconds
}

/**
 * Wrapped API response format
 */
export interface AuthResponse {
  success: boolean;
  data: AuthResponseData;
  timestamp?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Re-export ApiError from lib for backward compatibility
export type { ApiError } from "@/lib/types/api";
