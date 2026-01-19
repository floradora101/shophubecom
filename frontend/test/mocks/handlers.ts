/**
 * MSW (Mock Service Worker) request handlers for API mocking in tests
 *
 * Usage:
 * import { setupServer } from 'msw/node';
 * import { handlers } from '@/test/mocks/handlers';
 * const server = setupServer(...handlers);
 */

import { http, HttpResponse } from 'msw';
import type { BackendResponse } from '@/lib/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Mock data
const mockCart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [],
  subtotal: 0,
  totalQuantity: 0,
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'USER',
};

export const handlers = [
  // Cart endpoints
  http.get(`${API_URL}/cart`, () => {
    return HttpResponse.json<BackendResponse<typeof mockCart>>({
      success: true,
      data: mockCart,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/cart/items`, async ({ request }) => {
    const body = await request.json() as { variantId: string; quantity: number };
    return HttpResponse.json<BackendResponse<typeof mockCart>>({
      success: true,
      data: {
        ...mockCart,
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productId: 'product-1',
            variantId: body.variantId,
            quantity: body.quantity,
            unitPrice: 100,
          },
        ],
        subtotal: body.quantity * 100,
        totalQuantity: body.quantity,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // Auth endpoints
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json<BackendResponse<typeof mockUser>>({
      success: true,
      data: mockUser,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    return HttpResponse.json<BackendResponse<{ user: typeof mockUser }>>({
      success: true,
      data: { user: mockUser },
      timestamp: new Date().toISOString(),
    });
  }),
];
