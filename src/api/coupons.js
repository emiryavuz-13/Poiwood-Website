import api from './axios';

export const validateCoupon = async (code, cartTotal, brandTotals = []) => {
  const response = await api.post('/coupons/validate', {
    code: code.trim().toUpperCase(),
    cart_total: cartTotal,
    brand_totals: brandTotals,
  });
  return response.data.data;
};
