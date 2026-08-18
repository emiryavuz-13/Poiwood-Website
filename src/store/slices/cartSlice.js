import { createSlice } from '@reduxjs/toolkit';
import { GUEST_CART_KEY as STORAGE_KEY, LEGACY_GUEST_CART_KEYS, readMigrated } from '../../utils/storage';

const loadGuestCart = () => {
  try {
    const raw = readMigrated(localStorage, STORAGE_KEY, LEGACY_GUEST_CART_KEYS);
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
      const { product, quantity, selected_width_cm, selected_height_cm, variant_id, variant_size_name, variant_color_name } = action.payload;
      const matchKey = `${product.id}_${selected_width_cm || ''}_${selected_height_cm || ''}_${variant_id || ''}`;

      const existing = state.items.find(
        (i) => `${i.product_id}_${i.selected_width_cm || ''}_${i.selected_height_cm || ''}_${i.variant_id || ''}` === matchKey
      );

      // Varyant seçiliyse stok tavanı o varyantın stoğu olmalı, ürünün genel stok alanı değil.
      const variant = variant_id ? (product.variants || []).find((v) => v.id === variant_id) : null;
      const stockCeiling = variant ? variant.stock_quantity : product.stock_quantity;

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, stockCeiling);
      } else {
        state.items.push({
          id: `guest_${Date.now()}`,
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          primary_image: product.primary_image || product.images?.[0]?.firebase_url || null,
          unit_price: action.payload.unit_price || Number(product.base_price),
          quantity,
          stock_quantity: stockCeiling,
          selected_width_cm: selected_width_cm || null,
          selected_height_cm: selected_height_cm || null,
          variant_id: variant_id || null,
          variant_size_name: variant_size_name || null,
          variant_color_name: variant_color_name || null,
          brand_id: product.brand_id,
          brand_name: product.brand_name || 'Panelistan',
          brand_shipping_fee: Number(product.brand_shipping_fee || 0),
          free_shipping_threshold: product.free_shipping_threshold == null ? null : Number(product.free_shipping_threshold),
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
