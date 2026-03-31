import api from './axios';

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data.data;
};

export const addToCart = async ({ product_id, quantity = 1, selected_width_cm, selected_height_cm }) => {
  const response = await api.post('/cart', { product_id, quantity, selected_width_cm, selected_height_cm });
  return response.data.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(`/cart/${itemId}`, { quantity });
  return response.data.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};
