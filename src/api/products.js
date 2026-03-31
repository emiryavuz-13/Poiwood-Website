import api from './axios';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get('/products/featured');
  return response.data.data;
};

export const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/${slug}`);
  return response.data.data;
};

export const calculateProductPrice = async (productId, width, height) => {
  const response = await api.post(`/products/${productId}/calculate-price`, { width, height });
  return response.data.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};
