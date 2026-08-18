import { describe, test, expect, beforeEach, vi } from 'vitest';

function makeProduct(overrides = {}) {
  return { id: 'p1', name: 'Test Ürün', slug: 'test-urun', base_price: 100, stock_quantity: 5, ...overrides };
}

describe('cartSlice', () => {
  let cartReducer, addGuestItem, updateGuestItem, removeGuestItem, clearGuestCart;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    const mod = await import('./cartSlice');
    cartReducer = mod.default;
    ({ addGuestItem, updateGuestItem, removeGuestItem, clearGuestCart } = mod);
  });

  test('boş sepetle başlar', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state.items).toEqual([]);
  });

  test('yeni ürün eklenince sepete satır olarak eklenir', () => {
    const state = cartReducer(undefined, addGuestItem({ product: makeProduct(), quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ product_id: 'p1', quantity: 2, unit_price: 100 });
  });

  test('aynı ürün + aynı ölçü tekrar eklenince miktar birleşir', () => {
    let state = cartReducer(undefined, addGuestItem({ product: makeProduct(), quantity: 2 }));
    state = cartReducer(state, addGuestItem({ product: makeProduct(), quantity: 1 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  test('aynı ürün farklı ölçüyle eklenince ayrı satır olur', () => {
    let state = cartReducer(undefined, addGuestItem({
      product: makeProduct(), quantity: 1, selected_width_cm: 20, selected_height_cm: 20,
    }));
    state = cartReducer(state, addGuestItem({
      product: makeProduct(), quantity: 1, selected_width_cm: 30, selected_height_cm: 30,
    }));
    expect(state.items).toHaveLength(2);
  });

  test('birleşen miktar stok ile sınırlıdır', () => {
    let state = cartReducer(undefined, addGuestItem({ product: makeProduct({ stock_quantity: 3 }), quantity: 2 }));
    state = cartReducer(state, addGuestItem({ product: makeProduct({ stock_quantity: 3 }), quantity: 5 }));
    expect(state.items[0].quantity).toBe(3);
  });

  test('updateGuestItem miktarı günceller', () => {
    let state = cartReducer(undefined, addGuestItem({ product: makeProduct(), quantity: 1 }));
    const itemId = state.items[0].id;
    state = cartReducer(state, updateGuestItem({ itemId, quantity: 4 }));
    expect(state.items[0].quantity).toBe(4);
  });

  test('removeGuestItem satırı kaldırır', () => {
    let state = cartReducer(undefined, addGuestItem({ product: makeProduct(), quantity: 1 }));
    const itemId = state.items[0].id;
    state = cartReducer(state, removeGuestItem(itemId));
    expect(state.items).toHaveLength(0);
  });

  test('clearGuestCart sepeti boşaltır', () => {
    let state = cartReducer(undefined, addGuestItem({ product: makeProduct(), quantity: 1 }));
    state = cartReducer(state, clearGuestCart());
    expect(state.items).toEqual([]);
  });

  test('her işlemden sonra localStorage güncellenir', () => {
    cartReducer(undefined, addGuestItem({ product: makeProduct(), quantity: 1 }));
    const stored = JSON.parse(localStorage.getItem('panelistan_guest_cart'));
    expect(stored).toHaveLength(1);
  });

  test('bozuk localStorage içeriğinde çökmeden boş sepetle başlar', async () => {
    localStorage.setItem('panelistan_guest_cart', 'not-json{{{');
    vi.resetModules();
    const mod = await import('./cartSlice');
    const state = mod.default(undefined, { type: '@@INIT' });
    expect(state.items).toEqual([]);
  });

  // Marka geçişi: eski anahtardaki sepet kaybolmamalı.
  test('eski poiwood anahtarındaki sepet yeni anahtara taşınır', async () => {
    const legacyCart = [{ id: 'g1', product_id: 1, quantity: 2, name: 'Eski ürün' }];
    localStorage.setItem('poiwood_guest_cart', JSON.stringify(legacyCart));

    vi.resetModules();
    const mod = await import('./cartSlice');
    const state = mod.default(undefined, { type: '@@INIT' });

    expect(state.items).toEqual(legacyCart);
    expect(JSON.parse(localStorage.getItem('panelistan_guest_cart'))).toEqual(legacyCart);
    expect(localStorage.getItem('poiwood_guest_cart')).toBeNull();
  });

  test('yeni anahtar doluyken eski anahtar yok sayılır', async () => {
    localStorage.setItem('poiwood_guest_cart', JSON.stringify([{ id: 'eski' }]));
    localStorage.setItem('panelistan_guest_cart', JSON.stringify([{ id: 'yeni' }]));

    vi.resetModules();
    const mod = await import('./cartSlice');
    const state = mod.default(undefined, { type: '@@INIT' });

    expect(state.items).toEqual([{ id: 'yeni' }]);
  });

  describe('varyantlı ürünler', () => {
    function makeVariantProduct(overrides = {}) {
      return makeProduct({
        variants: [
          { id: 'v-small', stock_quantity: 3 },
          { id: 'v-big', stock_quantity: 2 },
        ],
        ...overrides,
      });
    }

    test('aynı ürünün farklı varyantları sepette ayrı satır olur', () => {
      let state = cartReducer(undefined, addGuestItem({
        product: makeVariantProduct(), quantity: 1, variant_id: 'v-small', variant_size_name: 'Küçük',
      }));
      state = cartReducer(state, addGuestItem({
        product: makeVariantProduct(), quantity: 1, variant_id: 'v-big', variant_size_name: 'Büyük',
      }));
      expect(state.items).toHaveLength(2);
    });

    test('aynı varyant tekrar eklenince miktar birleşir', () => {
      let state = cartReducer(undefined, addGuestItem({ product: makeVariantProduct(), quantity: 1, variant_id: 'v-small' }));
      state = cartReducer(state, addGuestItem({ product: makeVariantProduct(), quantity: 1, variant_id: 'v-small' }));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    test('birleşen miktar varyantın kendi stoğuyla sınırlıdır (ürünün genel stoğu değil)', () => {
      // Ürünün genel stock_quantity=5 ama seçilen varyantın stoğu 2
      let state = cartReducer(undefined, addGuestItem({ product: makeVariantProduct(), quantity: 1, variant_id: 'v-big' }));
      state = cartReducer(state, addGuestItem({ product: makeVariantProduct(), quantity: 5, variant_id: 'v-big' }));
      expect(state.items[0].quantity).toBe(2);
    });

    test('beden ve renk adı satırda saklanır', () => {
      const state = cartReducer(undefined, addGuestItem({
        product: makeVariantProduct(), quantity: 1, variant_id: 'v-small',
        variant_size_name: 'Küçük', variant_color_name: 'Ceviz',
      }));
      expect(state.items[0].variant_size_name).toBe('Küçük');
      expect(state.items[0].variant_color_name).toBe('Ceviz');
    });
  });
});
