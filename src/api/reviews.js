import api from './axios';

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const response = await api.get(`/reviews/product/${productId}`, { params: { page, limit } });
  return response.data.data;
};

export const getMyReviews = async () => {
  const response = await api.get('/reviews/my');
  return response.data.data;
};

export const createReview = async ({ product_id, order_id, rating, comment }) => {
  const response = await api.post('/reviews', { product_id, order_id, rating, comment });
  return response.data.data;
};

export const updateReview = async (reviewId, { rating, comment }) => {
  const response = await api.patch(`/reviews/${reviewId}`, { rating, comment });
  return response.data.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const addReviewImage = async (reviewId, { firebase_url, storage_path, display_order }) => {
  const response = await api.post(`/reviews/${reviewId}/images`, { firebase_url, storage_path, display_order });
  return response.data.data;
};
