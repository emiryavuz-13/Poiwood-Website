import api from './axios';

// ============ DA sSHBOARD ============
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data.data;
};

// ============ SİPARİŞLER ============
export const getAdminOrders = async ({ status, page = 1, limit = 20 } = {}) => {
  const response = await api.get('/orders/admin/all', { params: { status, page, limit } });
  return response.data.data;
};

export const getAdminOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);
  return response.data.data;
};

export const updateOrderStatus = async (orderId, { status, admin_note }) => {
  const response = await api.patch(`/orders/admin/${orderId}/status`, { status, admin_note });
  return response.data.data;
};

export const addOrderTracking = async (orderId, { cargo_company, cargo_tracking_no }) => {
  const response = await api.patch(`/orders/admin/${orderId}/tracking`, { cargo_company, cargo_tracking_no });
  return response.data.data;
};

export const updateFulfillmentStatus = async (fulfillmentId, status) => {
  const response = await api.patch(`/orders/admin/fulfillments/${fulfillmentId}/status`, { status });
  return response.data.data;
};

export const updateFulfillmentTracking = async (fulfillmentId, data) => {
  const response = await api.patch(`/orders/admin/fulfillments/${fulfillmentId}/tracking`, data);
  return response.data.data;
};

// ============ MARKALAR ============
export const getBrands = async () => (await api.get('/brands/admin/all')).data.data;
export const getBrand = async (id) => (await api.get(`/brands/admin/${id}`)).data.data;
export const createBrand = async (data) => (await api.post('/brands/admin', data)).data.data;
export const updateBrand = async (id, data) => (await api.patch(`/brands/admin/${id}`, data)).data.data;
export const getBrandMembers = async (id) => (await api.get(`/brands/admin/${id}/members`)).data.data;
export const createBrandMember = async (id, data) => (await api.post(`/brands/admin/${id}/members`, data)).data.data;
export const updateBrandMember = async (id, userId, data) => (await api.patch(`/brands/admin/${id}/members/${userId}`, data)).data.data;
export const removeBrandMember = async (id, userId) => (await api.delete(`/brands/admin/${id}/members/${userId}`)).data;
export const resetBrandMemberPassword = async (id, userId, password) => (await api.post(`/brands/admin/${id}/members/${userId}/reset-password`, { password })).data;

// ============ ÜRÜN ONAYLARI ============
export const getProductApprovals = async (params = {}) => (await api.get('/products/admin/approvals', { params })).data.data;
export const approveProductDraft = async (id) => (await api.post(`/products/admin/${id}/approve`)).data.data;
export const rejectProductDraft = async (id, reason) => (await api.post(`/products/admin/${id}/reject`, { reason })).data.data;

// ============ ÜRÜNLER ============
export const getAdminProducts = async (params = {}) => {
  const response = await api.get('/products/admin/all', { params });
  return response.data.data;
};

export const getAdminProductDetail = async (id) => {
  const response = await api.get(`/products/admin/${id}`);
  return response.data.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const addProductImage = async (productId, data) => {
  const response = await api.post(`/products/${productId}/images`, data);
  return response.data.data;
};

export const setProductPrimaryImage = async (productId, imageId, thumbnailUrl) => {
  const response = await api.patch(`/products/${productId}/images/${imageId}/primary`, {
    thumbnail_url: thumbnailUrl || undefined,
  });
  return response.data.data;
};

export const removeProductImage = async (productId, imageId) => {
  const response = await api.delete(`/products/${productId}/images/${imageId}`);
  return response.data;
};

export const saveProductVariants = async (productId, data) => {
  const response = await api.put(`/products/${productId}/variants`, data);
  return response.data.data;
};

// ============ KATEGORİLER ============
export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// ============ KUPONLAR ============
export const getAdminCoupons = async () => {
  const response = await api.get('/coupons/admin/all');
  return response.data.data;
};

export const createCoupon = async (data) => {
  const response = await api.post('/coupons/admin', data);
  return response.data.data;
};

export const updateCoupon = async (id, data) => {
  const response = await api.patch(`/coupons/admin/${id}`, data);
  return response.data.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/admin/${id}`);
  return response.data;
};

// ============ SORULAR ============
export const getAdminQuestions = async (params = {}) => {
  const response = await api.get('/questions/admin/all', { params });
  return response.data.data;
};

export const answerQuestion = async (id, answer_text) => {
  const response = await api.patch(`/questions/admin/${id}/answer`, { answer_text });
  return response.data.data;
};

export const toggleQuestionVisibility = async (id) => {
  const response = await api.patch(`/questions/admin/${id}/visibility`);
  return response.data.data;
};

// ============ YORUMLAR ============
export const getAdminReviews = async (params = {}) => {
  const response = await api.get('/reviews/admin/all', { params });
  return response.data.data;
};

export const approveReview = async (id) => {
  const response = await api.patch(`/reviews/admin/${id}/approve`);
  return response.data.data;
};

export const replyReview = async (id, reply) => {
  const response = await api.patch(`/reviews/admin/${id}/reply`, { reply });
  return response.data.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

// ============ STORY'LER ============
export const getAdminStories = async () => {
  const response = await api.get('/stories/admin/all');
  return response.data.data;
};

export const createStoryGroup = async (data) => {
  const response = await api.post('/stories/admin/groups', data);
  return response.data.data;
};

export const updateStoryGroup = async (id, data) => {
  const response = await api.patch(`/stories/admin/groups/${id}`, data);
  return response.data.data;
};

export const deleteStoryGroup = async (id) => {
  const response = await api.delete(`/stories/admin/groups/${id}`);
  return response.data;
};

export const createStory = async (groupId, data) => {
  const response = await api.post(`/stories/admin/groups/${groupId}/stories`, data);
  return response.data.data;
};

export const updateStory = async (id, data) => {
  const response = await api.patch(`/stories/admin/stories/${id}`, data);
  return response.data.data;
};

export const deleteStory = async (id) => {
  const response = await api.delete(`/stories/admin/stories/${id}`);
  return response.data;
};
