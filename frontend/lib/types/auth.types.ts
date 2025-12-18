export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

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
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}
