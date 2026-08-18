/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { SELECTED_BRAND_KEY as STORAGE_KEY, LEGACY_SELECTED_BRAND_KEYS, readMigrated } from '../utils/storage';

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
  const memberships = useSelector((state) => state.auth.user?.brand_memberships || []);
  const [storedBrandId, setStoredBrandId] = useState(
    () => readMigrated(localStorage, STORAGE_KEY, LEGACY_SELECTED_BRAND_KEYS) || ''
  );
  const brandId = memberships.some((item) => item.brand_id === storedBrandId)
    ? storedBrandId
    : memberships[0]?.brand_id || '';

  useEffect(() => {
    if (brandId) localStorage.setItem(STORAGE_KEY, brandId);
  }, [brandId]);

  const value = useMemo(() => ({
    memberships,
    brandId,
    setBrandId: setStoredBrandId,
    brand: memberships.find((item) => item.brand_id === brandId) || null,
  }), [memberships, brandId]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const value = useContext(BrandContext);
  if (!value) throw new Error('useBrand, BrandProvider içinde kullanılmalıdır');
  return value;
}
