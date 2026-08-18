import api from './axios';

/* ---------- Pano ---------- */
export const getMarketerDashboard = async () =>
  (await api.get('/marketer-dashboard/summary')).data.data;

export const getMarketerProfile = async () =>
  (await api.get('/marketers/me')).data.data;

/* ---------- Siparişler (salt okunur) ---------- */
export const getMarketerOrders = async (params = {}) =>
  (await api.get('/orders/marketer/all', { params })).data.data;

export const getMarketerOrder = async (id) =>
  (await api.get(`/orders/marketer/${id}`)).data.data;

export const createMarketerOrder = async (data) =>
  (await api.post('/orders/marketer', data)).data.data;

/* ---------- Müşteri rehberi ---------- */
export const getMarketerCustomers = async (search) =>
  (await api.get('/marketers/me/customers', { params: search ? { search } : {} })).data.data;

export const saveMarketerCustomer = async (data) =>
  (await api.post('/marketers/me/customers', data)).data.data;

export const deleteMarketerCustomer = async (id) =>
  (await api.delete(`/marketers/me/customers/${id}`)).data;
