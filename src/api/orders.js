import api from './axios';

// Üye siparişi (sepet DB'den alınır)
export const createOrder = async (data) => {
  const response = await api.post('/orders', data);
  return response.data.data;
};

// Misafir siparişi (sepet body'den gönderilir)
export const createGuestOrder = async (data) => {
  const response = await api.post('/orders/guest', data);
  return response.data.data;
};

// Misafir sipariş takibi
export const trackOrder = async (orderNumber) => {
  const response = await api.get('/orders/guest/track', {
    params: { order_number: orderNumber },
  });
  return response.data.data;
};

// Üye sipariş listesi
export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data.data;
};

// Üye sipariş detayı
export const getOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};
