import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import ProductCard from './ProductCard';

vi.mock('../api/favorites', () => ({
  getFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

const baseProduct = {
  id: 'p1', name: 'Ahşap Tablo', slug: 'ahsap-tablo',
  base_price: 200, sale_price: null, discount_type: null, discount_value: null,
  is_weekly_pick: false, primary_image: null, primary_thumbnail: null,
  avg_rating: '4.5', review_count: '3', category_name: 'Tablolar', stock_quantity: 5,
};

describe('ProductCard', () => {
  test('indirimsiz ürün: base_price gösterilir', () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/200,00₺/)).toBeInTheDocument();
  });

  test('indirimli ürün: sale_price gösterilir, base_price üstü çizili görünür', () => {
    const product = { ...baseProduct, sale_price: 150, discount_type: 'percentage', discount_value: 25 };
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText(/150,00₺/)).toBeInTheDocument();
    expect(screen.getByText(/200,00₺/)).toBeInTheDocument();
    expect(screen.getByText('%25 İndirim')).toBeInTheDocument();
  });

  test('stok yokken "Tükendi" rozeti gösterilir', () => {
    const product = { ...baseProduct, stock_quantity: 0 };
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText('Tükendi')).toBeInTheDocument();
  });

  test('ürün linki slug a gider', () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/ahsap-tablo');
  });

  test('sepete ekle butonuna tıklanınca misafir sepetine eklenir', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ProductCard product={baseProduct} />);
    const buttons = screen.getAllByRole('button');
    // sırayla: favori butonu, sepete ekle butonu (stokta olduğu için ikisi de render edilir)
    await user.click(buttons[buttons.length - 1]);
    expect(store.getState().cart.items).toHaveLength(1);
  });

  test('bedenli üründe hızlı "sepete ekle" butonu gösterilmez (beden seçimi zorunlu)', () => {
    const product = { ...baseProduct, has_sizes: true, min_size_price: 150 };
    renderWithProviders(<ProductCard product={product} />);
    // Sadece favori butonu kalmalı — sepete ekle butonu yok
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  test('bedenli üründe fiyat "...₺\'den başlayan" olarak gösterilir', () => {
    const product = { ...baseProduct, has_sizes: true, min_size_price: 150 };
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText(/150,00₺'den başlayan/)).toBeInTheDocument();
  });

  test('sadece renk tanımlı üründe (beden yok) hızlı ekle butonu da kapanır', () => {
    const product = { ...baseProduct, has_sizes: false, has_colors: true };
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
