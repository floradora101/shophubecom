import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCart } from "../hooks";
import * as cartQueries from "../queries";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

// Mock dependencies
vi.mock("../queries", () => ({
  useCartQuery: vi.fn(),
  useAddCartItemMutation: vi.fn(),
  useUpdateCartItemMutation: vi.fn(),
  useRemoveCartItemMutation: vi.fn(),
  useClearCartMutation: vi.fn(),
}));

vi.mock("@/store/cart-store", () => ({
  useCartStore: vi.fn(),
}));

vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(),
  selectAuthUser: (state: any) => state.user,
}));

describe("useCart", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Mock Zustand stores
    vi.mocked(useCartStore).mockReturnValue({
      isOpen: false,
      shippingOption: "pickup" as const,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
      setShippingOption: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as any);

    // Mock React Query hooks
    vi.mocked(cartQueries.useCartQuery).mockReturnValue({
      data: {
        items: [],
        subtotal: 0,
        totalQuantity: 0,
      },
      isLoading: false,
    } as any);

    vi.mocked(cartQueries.useAddCartItemMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as any);

    vi.mocked(cartQueries.useUpdateCartItemMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as any);

    vi.mocked(cartQueries.useRemoveCartItemMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as any);

    vi.mocked(cartQueries.useClearCartMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return cart state from React Query", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return UI state from Zustand", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.shippingOption).toBe("pickup");
  });

  it("should provide cart actions", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.addItem).toBeDefined();
    expect(result.current.updateQuantity).toBeDefined();
    expect(result.current.removeItem).toBeDefined();
    expect(result.current.clearCart).toBeDefined();
    expect(result.current.openCart).toBeDefined();
    expect(result.current.closeCart).toBeDefined();
    expect(result.current.toggleCart).toBeDefined();
  });

  it("should call mutation when adding item to cart", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(cartQueries.useAddCartItemMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const mockOpen = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      isOpen: false,
      shippingOption: "pickup" as const,
      open: mockOpen,
      close: vi.fn(),
      toggle: vi.fn(),
      setShippingOption: vi.fn(),
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: "product-1",
      name: "Test Product",
      price: 100,
    } as any;

    await result.current.addItem(mockProduct, {
      variantId: "variant-1",
      quantity: 2,
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      variantId: "variant-1",
      quantity: 2,
    });
    expect(mockOpen).toHaveBeenCalled();
  });

  it("should throw error when adding item without variantId", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: "product-1",
      name: "Test Product",
    } as any;

    await expect(
      result.current.addItem(mockProduct, { quantity: 1 })
    ).rejects.toThrow("variantId is required");
  });
});
