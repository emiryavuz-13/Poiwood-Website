import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCoupon } from './useCoupon';
import { validateCoupon } from '../api/coupons';

vi.mock('../api/coupons', () => ({ validateCoupon: vi.fn() }));

const groups = [
  { brand_id: 'marka-a', items_subtotal: 200 },
  { brand_id: 'marka-b', items_subtotal: 300 },
];

describe('useCoupon', () => {
  beforeEach(() => {
    sessionStorage.clear();
    validateCoupon.mockReset();
    validateCoupon.mockImplementation(async (code) => code === 'A10'
      ? { code, brand_id: 'marka-a', brand_name: 'Marka A', applicable_total: '200', calculated_discount: '20' }
      : { code, brand_id: 'marka-b', brand_name: 'Marka B', applicable_total: '300', calculated_discount: '50' });
  });

  it('tek giriş alanından farklı mağazaların kuponlarını birlikte tutar', async () => {
    const { result } = renderHook(() => useCoupon(500, groups));

    await act(async () => { await result.current.applyCoupon('A10'); });
    await act(async () => { await result.current.applyCoupon('B50'); });

    expect(result.current.appliedCoupons).toHaveLength(2);
    expect(result.current.discountAmount).toBe(70);
  });

  it('aynı mağazaya girilen yeni kupon eski kuponun yerini alır', async () => {
    validateCoupon.mockResolvedValueOnce({ code: 'A10', brand_id: 'marka-a', brand_name: 'Marka A', applicable_total: '200', calculated_discount: '20' });
    validateCoupon.mockResolvedValueOnce({ code: 'A20', brand_id: 'marka-a', brand_name: 'Marka A', applicable_total: '200', calculated_discount: '40' });
    const { result } = renderHook(() => useCoupon(500, groups));

    await act(async () => { await result.current.applyCoupon('A10'); });
    await act(async () => { await result.current.applyCoupon('A20'); });

    expect(result.current.appliedCoupons).toHaveLength(1);
    expect(result.current.appliedCoupons[0].code).toBe('A20');
    expect(result.current.discountAmount).toBe(40);
  });
});
