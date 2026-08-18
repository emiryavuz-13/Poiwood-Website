import { useCallback, useEffect, useMemo, useState } from 'react';
import { validateCoupon } from '../api/coupons';
import { CART_COUPONS_KEY as STORAGE_KEY, LEGACY_CART_COUPONS_KEYS, readMigrated } from '../utils/storage';

// Tekil kupon dönemi: dizi değil tek nesne tutuluyordu, aşağıda ayrıca dönüştürülür.
const OLD_STORAGE_KEY = 'poiwood_cart_coupon';

function readStoredCoupons() {
  try {
    const stored = JSON.parse(readMigrated(sessionStorage, STORAGE_KEY, LEGACY_CART_COUPONS_KEYS));
    if (Array.isArray(stored)) return stored;

    const oldCoupon = JSON.parse(sessionStorage.getItem(OLD_STORAGE_KEY));
    if (oldCoupon?.code) {
      sessionStorage.removeItem(OLD_STORAGE_KEY);
      return [{ ...oldCoupon, brandId: null, brandName: 'Genel kupon' }];
    }
  } catch {
    // Bozuk oturum verisi kupon akışını engellemesin.
  }
  return [];
}

export function useCoupon(subtotal, brandGroups = []) {
  const [appliedCoupons, setAppliedCoupons] = useState(readStoredCoupons);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const brandTotals = useMemo(() => brandGroups.map((group) => ({
    brand_id: group.brand_id,
    subtotal: Number(group.items_subtotal),
  })), [brandGroups]);
  const cartSignature = JSON.stringify(brandTotals
    .map((entry) => [entry.brand_id, entry.subtotal])
    .sort(([left], [right]) => String(left).localeCompare(String(right))));

  const persistCoupons = useCallback((coupons) => {
    setAppliedCoupons(coupons);
    if (coupons.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const applyCoupon = useCallback(async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      setError('Kupon kodunu girin');
      return false;
    }

    setIsValidating(true);
    setError('');
    try {
      const result = await validateCoupon(code, subtotal, brandTotals);
      const brandId = result.brand_id || null;
      const hasGlobalCoupon = appliedCoupons.some((coupon) => coupon.brandId === null);
      const hasBrandCoupon = appliedCoupons.some((coupon) => coupon.brandId !== null);
      if ((brandId === null && hasBrandCoupon) || (brandId !== null && hasGlobalCoupon)) {
        setError('Genel kupon ile mağaza kuponları aynı siparişte birlikte kullanılamaz');
        return false;
      }

      const nextCoupon = {
        code: result.code,
        brandId,
        brandName: result.brand_name || 'Genel kupon',
        discountAmount: Number(result.calculated_discount),
        applicableTotal: Number(result.applicable_total),
        cartSignature,
      };
      const nextCoupons = appliedCoupons
        .filter((coupon) => coupon.brandId !== brandId)
        .concat(nextCoupon);
      persistCoupons(nextCoupons);
      return true;
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Kupon doğrulanamadı');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [appliedCoupons, brandTotals, cartSignature, persistCoupons, subtotal]);

  const removeCoupon = useCallback((brandId) => {
    persistCoupons(appliedCoupons.filter((coupon) => coupon.brandId !== brandId));
    setError('');
  }, [appliedCoupons, persistCoupons]);

  const clearCoupons = useCallback(() => {
    persistCoupons([]);
    sessionStorage.removeItem(OLD_STORAGE_KEY);
    setError('');
  }, [persistCoupons]);

  useEffect(() => {
    if (!appliedCoupons.length || appliedCoupons.every((coupon) => coupon.cartSignature === cartSignature)) return;

    let active = true;
    Promise.allSettled(appliedCoupons.map((coupon) => validateCoupon(coupon.code, subtotal, brandTotals)))
      .then((results) => {
        if (!active) return;
        const validCoupons = results.flatMap((result) => {
          if (result.status !== 'fulfilled') return [];
          const data = result.value;
          return [{
            code: data.code,
            brandId: data.brand_id || null,
            brandName: data.brand_name || 'Genel kupon',
            discountAmount: Number(data.calculated_discount),
            applicableTotal: Number(data.applicable_total),
            cartSignature,
          }];
        });
        persistCoupons(validCoupons);
        if (validCoupons.length !== appliedCoupons.length) {
          setError('Sepet değiştiği için şartları karşılamayan kupon kaldırıldı');
        } else {
          setError('');
        }
      })
      .finally(() => {
        if (active) setIsValidating(false);
      });

    return () => { active = false; };
  }, [appliedCoupons, brandTotals, cartSignature, persistCoupons, subtotal]);

  return {
    appliedCoupons,
    discountAmount: appliedCoupons.reduce((sum, coupon) => sum + Number(coupon.discountAmount || 0), 0),
    applyCoupon,
    removeCoupon,
    clearCoupons,
    isValidating,
    error,
  };
}
