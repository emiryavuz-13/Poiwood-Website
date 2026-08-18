// Marka geçişinde (Poiwood → Panelistan) tarayıcı depolama anahtarları yeniden adlandırıldı.
// Anahtarlar düz değiştirilseydi mevcut ziyaretçilerin misafir sepeti ve kuponları
// sessizce silinirdi; bu yüzden eski anahtardaki veri ilk okumada yeni anahtara taşınır.

export const GUEST_CART_KEY = 'panelistan_guest_cart';
export const CART_COUPONS_KEY = 'panelistan_cart_coupons';
export const SELECTED_BRAND_KEY = 'panelistan_selected_brand';

export const LEGACY_GUEST_CART_KEYS = ['poiwood_guest_cart'];
// Not: tekil `poiwood_cart_coupon` anahtarı farklı bir şekle (dizi değil, tek nesne)
// sahip olduğu için buraya değil, useCoupon içindeki kendi dönüşümüne bırakılmıştır.
export const LEGACY_CART_COUPONS_KEYS = ['poiwood_cart_coupons'];
export const LEGACY_SELECTED_BRAND_KEYS = ['poiwood_selected_brand'];

/**
 * `key` altındaki ham değeri okur. Değer yoksa `legacyKeys` sırayla denenir;
 * bulunan ilk değer yeni anahtara yazılır ve eski anahtar silinir.
 *
 * @returns {string|null} Ham (parse edilmemiş) değer, hiçbiri yoksa null.
 */
export function readMigrated(storage, key, legacyKeys = []) {
  try {
    const current = storage.getItem(key);
    if (current !== null) return current;

    for (const legacy of legacyKeys) {
      const value = storage.getItem(legacy);
      if (value === null) continue;
      // Önce yaz, sonra sil — araya bir hata girerse veri kaybolmasın.
      storage.setItem(key, value);
      storage.removeItem(legacy);
      return value;
    }
  } catch {
    // Depolama kapalı ya da kota dolu; çağıran taraf boş değeri kendi ele alır.
  }
  return null;
}
