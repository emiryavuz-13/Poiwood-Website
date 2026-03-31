import api from './axios';

export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data.data;
};

export const addFavorite = async (productId) => {
  const response = await api.post(`/favorites/${productId}`);
  return response.data.data;
};

export const removeFavorite = async (productId) => {
  const response = await api.delete(`/favorites/${productId}`);
  return response.data;
};

export const checkFavorite = async (productId) => {
  const response = await api.get(`/favorites/${productId}/check`);
  return response.data.data;
};
