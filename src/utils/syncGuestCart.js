import { addToCart } from '../api/cart';

const STORAGE_KEY = 'poiwood_guest_cart';

export const syncGuestCartToServer = async () => {
  let guestItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    guestItems = raw ? JSON.parse(raw) : [];
  } catch {
    return;
  }

  if (guestItems.length === 0) return;

  const promises = guestItems.map((item) =>
    addToCart({
      product_id: item.product_id,
      quantity: item.quantity,
      selected_width_cm: item.selected_width_cm,
      selected_height_cm: item.selected_height_cm,
    }).catch(() => {
      // Stok yoksa veya ürün kaldırıldıysa sessizce atla
    })
  );

  await Promise.allSettled(promises);

  // Senkronize edildi — lokal sepeti temizle
  localStorage.removeItem(STORAGE_KEY);
};
