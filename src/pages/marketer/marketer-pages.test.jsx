import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';

// API katmanı mock'lanır; bu testler sayfaların çalışma zamanı hatası vermeden
// render olduğunu ve kazanç/iskonto sayılarını doğru yerde gösterdiğini doğrular.
vi.mock('../../api/marketer', () => ({
  getMarketerDashboard: vi.fn(),
  getMarketerProfile: vi.fn(),
  getMarketerOrders: vi.fn(),
  getMarketerOrder: vi.fn(),
  createMarketerOrder: vi.fn(),
  getMarketerCustomers: vi.fn(),
  saveMarketerCustomer: vi.fn(),
  deleteMarketerCustomer: vi.fn(),
}));

vi.mock('../../api/products', () => ({
  getProducts: vi.fn(),
  calculateProductPrice: vi.fn(),
  getProductBySlug: vi.fn(),
}));

import * as marketerApi from '../../api/marketer';
import * as productsApi from '../../api/products';
import Dashboard from './Dashboard';
import Orders from './Orders';
import Customers from './Customers';
import NewOrder from './NewOrder';

const marketerState = {
  auth: {
    user: { id: 'u1', role: 'marketer', display_name: 'Test Pazarlamacı', email: 'p@test.com' },
    token: 't', isAuthenticated: true, emailVerified: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  marketerApi.getMarketerProfile.mockResolvedValue({ commission_rate: 10, max_discount_percent: 15 });
  marketerApi.getMarketerCustomers.mockResolvedValue([]);
  productsApi.getProducts.mockResolvedValue({ products: [] });
});

describe('Pazarlamacı panosu', () => {
  test('hak edilen ve yoldaki kazancı ayrı gösterir', async () => {
    marketerApi.getMarketerDashboard.mockResolvedValue({
      summary: {
        earned_commission: 1250.5, pending_commission: 430,
        total_sales: 18000, total_orders: 12, delivered: 8,
        in_progress: 2, shipped: 1, total_discount: 900, commission_rate: 10,
      },
      recent_orders: [],
      weekly_chart: [],
    });

    renderWithProviders(<Dashboard />, { preloadedState: marketerState });

    await waitFor(() => expect(screen.getByText('Hak edilen kazanç')).toBeTruthy());
    expect(screen.getByText('Yoldaki kazanç')).toBeTruthy();
    expect(screen.getByText(/1\.250,50/)).toBeTruthy();
    expect(screen.getByText(/430,00/)).toBeTruthy();
    expect(screen.getByText('Komisyon oranın %10')).toBeTruthy();
  });

  test('sipariş yokken yönlendirme gösterir', async () => {
    marketerApi.getMarketerDashboard.mockResolvedValue({
      summary: { earned_commission: 0, pending_commission: 0, commission_rate: 10 },
      recent_orders: [],
      weekly_chart: [],
    });

    renderWithProviders(<Dashboard />, { preloadedState: marketerState });

    await waitFor(() => expect(screen.getByText(/Henüz sipariş oluşturmadın/)).toBeTruthy());
  });
});

describe('Pazarlamacı sipariş listesi', () => {
  test('siparişleri listeler ve durum değiştirme düğmesi sunmaz', async () => {
    marketerApi.getMarketerOrders.mockResolvedValue({
      orders: [{
        id: 'o1', order_number: 'PNL-1', status: 'shipped', guest_name: 'Ali Veli',
        total_amount: 2400, marketer_commission_amount: 240, created_at: new Date().toISOString(),
      }],
      pagination: { page: 1, totalPages: 1 },
    });

    const { container } = renderWithProviders(<Orders />, { preloadedState: marketerState });

    await waitFor(() => expect(container.textContent).toContain('PNL-1'));
    expect(container.textContent).toContain('Ali Veli');
    expect(container.textContent).toContain('Kargoda');

    // Süreç yönetimi admin'e ait; panelde hiçbir aksiyon düğmesi olmamalı.
    expect(container.textContent).not.toContain('Teslim edildi işaretle');
    expect(container.textContent).not.toContain('Kargoya ver');
    expect(container.textContent).not.toContain('Durumu güncelle');
  });
});

describe('Müşteri rehberi', () => {
  test('boş durumu gösterir ve form geçersizken kaydetmeye izin vermez', async () => {
    renderWithProviders(<Customers />, { preloadedState: marketerState });

    await waitFor(() => expect(screen.getByText(/Henüz müşteri kaydın yok/)).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Kaydet' }).disabled).toBe(true);
  });
});

describe('Yeni sipariş sayfası', () => {
  // Bu metinler JSX'te değişken interpolasyonuyla üretildiği için ayrı metin
  // düğümlerine bölünüyor; getByText yerine textContent üzerinden bakılır.
  test('iskonto yetkisini ve kazancı gösterir', async () => {
    const { container } = renderWithProviders(<NewOrder />, { preloadedState: marketerState });

    // Tavan ve oran profil sorgusu çözülünce dolar; onu bekleriz.
    await waitFor(() => expect(container.textContent).toContain('%0 / %15'));
    expect(container.textContent).toContain('Toplam iskonto');
    expect(container.textContent).toContain('Bu siparişten kazancın (%10)');
  });

  // Backend beden secimini zorunlu kiliyor; panel de secim sunmali, aksi halde
  // pazarlamaci "beden secimi zorunludur" hatasina carpiyor.
  test('bedenli üründe beden ve renk seçimi sunar', async () => {
    productsApi.getProducts.mockResolvedValue({
      products: [{
        id: 'p1', slug: 'kolye', name: 'Kişiye Özel Kolye', pricing_type: 'fixed',
        base_price: 500, stock_quantity: 10, has_sizes: true, has_colors: true,
      }],
    });
    productsApi.getProductBySlug.mockResolvedValue({
      id: 'p1', base_price: 500,
      sizes: [{ id: 's1', name: 'Küçük', price: 500 }, { id: 's2', name: 'Büyük', price: 700 }],
      colors: [{ id: 'c1', name: 'Ceviz' }],
      variants: [
        { id: 'v1', size_id: 's1', color_id: 'c1', stock_quantity: 4 },
        { id: 'v2', size_id: 's2', color_id: 'c1', stock_quantity: 0 },
      ],
    });

    const { container } = renderWithProviders(<NewOrder />, { preloadedState: marketerState });

    await waitFor(() => expect(container.textContent).toContain('Kişiye Özel Kolye'));
    expect(container.textContent).toContain('Beden/renk seçimi gerekir');

    fireEvent.click(screen.getByRole('button', { name: 'Seç' }));

    await waitFor(() => expect(container.textContent).toContain('Beden *'));
    expect(container.textContent).toContain('Renk *');

    // Seçim yapılmadan sepete eklenemez.
    expect(screen.getByRole('button', { name: /Sepete ekle/ }).disabled).toBe(true);
  });

  test('stoksuz varyant sepete eklenemez', async () => {
    productsApi.getProducts.mockResolvedValue({
      products: [{
        id: 'p1', slug: 'kolye', name: 'Kişiye Özel Kolye', pricing_type: 'fixed',
        base_price: 500, stock_quantity: 4, has_sizes: true, has_colors: false,
      }],
    });
    productsApi.getProductBySlug.mockResolvedValue({
      id: 'p1', base_price: 500,
      sizes: [{ id: 's1', name: 'Büyük', price: 700 }],
      colors: [],
      variants: [{ id: 'v2', size_id: 's1', color_id: null, stock_quantity: 0 }],
    });

    const { container } = renderWithProviders(<NewOrder />, { preloadedState: marketerState });

    await waitFor(() => expect(container.textContent).toContain('Kişiye Özel Kolye'));
    fireEvent.click(screen.getByRole('button', { name: 'Seç' }));
    await waitFor(() => expect(container.textContent).toContain('Beden *'));

    // Alıcı formunda da select'ler var; beden alanını etiketiyle hedefleriz.
    fireEvent.change(screen.getByLabelText(/Beden/), { target: { value: 's1' } });

    await waitFor(() => expect(container.textContent).toContain('Bu seçenek stokta yok.'));
    expect(screen.getByRole('button', { name: /Sepete ekle/ }).disabled).toBe(true);
  });

  test('sepet boşken siparişi tamamlamaya izin vermez', async () => {
    renderWithProviders(<NewOrder />, { preloadedState: marketerState });

    await waitFor(() => expect(screen.getByText(/Sepete en az bir ürün ekle/)).toBeTruthy());
    expect(screen.getByRole('button', { name: /Siparişi tamamla/ }).disabled).toBe(true);
  });

  test('üç adımın tamamı ekranda', async () => {
    renderWithProviders(<NewOrder />, { preloadedState: marketerState });

    await waitFor(() => expect(screen.getByText('1 · Ürün seç')).toBeTruthy());
    expect(screen.getByText('2 · Sepet ve satır iskontoları')).toBeTruthy();
    expect(screen.getByText('3 · Alıcı bilgileri')).toBeTruthy();
  });
});
