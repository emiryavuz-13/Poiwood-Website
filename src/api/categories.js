import api from './axios';

export const getAllCategories = async () => {
  const response = await api.get('/categories');
  // API Contract states the response structure is { success: true, data: [...] }
  return response.data.data;
};
