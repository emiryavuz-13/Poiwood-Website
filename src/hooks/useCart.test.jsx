import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authReducer from '../store/slices/authSlice';
import cartReducer from '../store/slices/cartSlice';

vi.mock('../api/cart', () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

import { getCart, addToCart } from '../api/cart';
import { useCart } from './useCart';

function makeWrapper(preloadedState) {
  const store = configureStore({ reducer: { auth: authReducer, cart: cartReducer }, preloadedState });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}

describe('useCart — misafir modu', () => {
  test('addItem Redux a dispatch eder, API çağırmaz', async () => {
    const wrapper = makeWrapper({ auth: { isAuthenticated: false } });
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem({
        product: { id: 'p1', name: 'Ürün', base_price: 100, stock_quantity: 5 },
        quantity: 2,
      });
    });

    expect(addToCart).not.toHaveBeenCalled();
    expect(result.current.items).toHaveLength(1);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.subtotal).toBe(200);
  });
});

describe('useCart — üye modu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCart.mockResolvedValue({ items: [{ id: 'ci1', quantity: 3, unit_price: 50 }], subtotal: 150 });
    addToCart.mockResolvedValue({});
  });

  test('sunucudan sepet çekilir', async () => {
    const wrapper = makeWrapper({ auth: { isAuthenticated: true } });
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.subtotal).toBe(150);
    expect(result.current.itemCount).toBe(3);
  });

  test('addItem API üzerinden çağrılır, Redux a dokunmaz', async () => {
    const wrapper = makeWrapper({ auth: { isAuthenticated: true } });
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addItem({ product: { id: 'p2' }, quantity: 1 });
    });

    expect(addToCart.mock.calls[0][0]).toMatchObject({ product_id: 'p2', quantity: 1 });
  });
});
