import api from './axios';

export const getBrandDashboard = async (brandId) =>
  (await api.get('/brand-dashboard/summary', { params: { brand_id: brandId } })).data.data;

export const getBrandProducts = async (params = {}) =>
  (await api.get('/products/brand/all', { params })).data.data;
export const getBrandProduct = async (id) =>
  (await api.get(`/products/brand/${id}`)).data.data;
export const createBrandProduct = async (data) =>
  (await api.post('/products/brand', data)).data.data;
export const saveBrandProductDraft = async (id, data) =>
  (await api.patch(`/products/brand/${id}`, data)).data.data;
export const submitBrandProduct = async (id) =>
  (await api.post(`/products/brand/${id}/submit`)).data.data;
export const requestBrandProductDeletion = async (id) =>
  (await api.post(`/products/brand/${id}/request-deletion`)).data.data;
export const withdrawBrandProductApproval = async (id) =>
  (await api.post(`/products/brand/${id}/withdraw-approval`)).data.data;
export const getBrandApprovalHistory = async (brandId, params = {}) =>
  (await api.get('/products/brand/approval-history', { params: { brand_id: brandId, ...params } })).data.data;
export const saveBrandProductVariants = async (id, data) =>
  (await api.put(`/products/brand/${id}/variants`, data)).data.data;
export const addBrandProductImage = async (id, data) =>
  (await api.post(`/products/brand/${id}/images`, data)).data.data;
export const setBrandProductPrimaryImage = async (id, imageId, thumbnailUrl) =>
  (await api.patch(`/products/brand/${id}/images/${imageId}/primary`, { thumbnail_url: thumbnailUrl || undefined })).data.data;
export const removeBrandProductImage = async (id, imageId) =>
  (await api.delete(`/products/brand/${id}/images/${imageId}`)).data;

export const getBrandOrders = async (params = {}) =>
  (await api.get('/orders/brand/all', { params })).data.data;
export const getBrandOrder = async (id, brandId) =>
  (await api.get(`/orders/brand/${id}`, { params: { brand_id: brandId } })).data.data;
export const updateBrandOrderStatus = async (id, brandId, status) =>
  (await api.patch(`/orders/brand/${id}/status`, { brand_id: brandId, status })).data.data;
export const updateBrandOrderTracking = async (id, brandId, data) =>
  (await api.patch(`/orders/brand/${id}/tracking`, { brand_id: brandId, ...data })).data.data;

export const getBrandCoupons = async (brandId) =>
  (await api.get('/coupons/brand/all', { params: { brand_id: brandId } })).data.data;
export const createBrandCoupon = async (brandId, data) =>
  (await api.post('/coupons/brand', { ...data, brand_id: brandId })).data.data;
export const updateBrandCoupon = async (brandId, id, data) =>
  (await api.patch(`/coupons/brand/${id}`, { ...data, brand_id: brandId })).data.data;
export const deleteBrandCoupon = async (brandId, id) =>
  (await api.delete(`/coupons/brand/${id}`, { params: { brand_id: brandId } })).data;

export const getBrandReviews = async (brandId, params = {}) =>
  (await api.get('/reviews/brand/all', { params: { ...params, brand_id: brandId } })).data.data;
export const approveBrandReview = async (brandId, id) =>
  (await api.patch(`/reviews/brand/${id}/approve`, { brand_id: brandId })).data.data;
export const replyBrandReview = async (brandId, id, reply) =>
  (await api.patch(`/reviews/brand/${id}/reply`, { brand_id: brandId, reply })).data.data;

export const getBrandQuestions = async (brandId, params = {}) =>
  (await api.get('/questions/brand/all', { params: { ...params, brand_id: brandId } })).data.data;
export const answerBrandQuestion = async (brandId, id, answerText) =>
  (await api.patch(`/questions/brand/${id}/answer`, { brand_id: brandId, answer_text: answerText })).data.data;
export const toggleBrandQuestion = async (brandId, id) =>
  (await api.patch(`/questions/brand/${id}/visibility`, { brand_id: brandId })).data.data;
