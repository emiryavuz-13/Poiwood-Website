import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'poiwood_guest_cart';

const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded, ignore */ }
};

const initialState = {
  items: loadGuestCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addGuestItem: (state, action) => {
      const { product, quantity, selected_width_cm, selected_height_cm } = action.payload;
      const matchKey = `${product.id}_${selected_width_cm || ''}_${selected_height_cm || ''}`;

      const existing = state.items.find(
        (i) => `${i.product_id}_${i.selected_width_cm || ''}_${i.selected_height_cm || ''}` === matchKey
      );

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock_quantity);
      } else {
        state.items.push({
          id: `guest_${Date.now()}`,
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          primary_image: product.primary_image || product.images?.[0]?.firebase_url || null,
          unit_price: action.payload.unit_price || Number(product.base_price),
          quantity,
          stock_quantity: product.stock_quantity,
          selected_width_cm: selected_width_cm || null,
          selected_height_cm: selected_height_cm || null,
        });
      }
      saveGuestCart(state.items);
    },

    updateGuestItem: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
      saveGuestCart(state.items);
    },

    removeGuestItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveGuestCart(state.items);
    },

    clearGuestCart: (state) => {
      state.items = [];
      saveGuestCart([]);
    },
  },
});

export const { addGuestItem, updateGuestItem, removeGuestItem, clearGuestCart } = cartSlice.actions;
export default cartSlice.reducer;
