import { createElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircleDollarSign, ClipboardList, MessageCircleQuestion, Package, Star, Truck } from 'lucide-react';
import { getBrandDashboard } from '../../api/brand';
import { useBrand } from '../../contexts/BrandContext';

const money = (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);
const statusLabels = { pending_payment: 'Ödeme bekliyor', paid: 'Ödendi', preparing: 'Hazırlanıyor', ready_to_ship: 'Gönderime hazır', shipped: 'Kargoda', delivered: 'Teslim edildi', cancelled: 'İptal', refunded: 'İade' };

export default function BrandDashboard() {
  const { brandId, brand } = useBrand();
  const { data, isLoading, isError } = useQuery({ queryKey: ['brandDashboard', brandId], queryFn: () => getBrandDashboard(brandId), enabled: Boolean(brandId) });
  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />)}</div>;
  if (isError) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Özet bilgileri alınamadı.</div>;
  const s = data?.summary || {};
  const cards = [
    ['Marka cirosu', money(s.total_revenue), CircleDollarSign], ['Toplam gönderi', s.total_orders || 0, ClipboardList],
    ['Aktif sipariş', s.active_orders || 0, Truck], ['Ürünler', s.total_products || 0, Package],
    ['Onay bekleyen ürün', s.pending_products || 0, Package], ['Bekleyen yorum', s.pending_reviews || 0, Star], ['Cevapsız soru', s.pending_questions || 0, MessageCircleQuestion],
  ];
  return <div><div className="mb-6"><p className="text-sm text-terracotta">{brand?.brand_name}</p><h1 className="font-heading text-2xl font-bold text-walnut">Genel bakış</h1><p className="mt-1 text-sm text-coffee">Yalnızca markanıza ait operasyon ve finans özeti.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card[0]} className="rounded-xl border border-light-wood/60 bg-white p-4"><div className="flex items-center justify-between"><p className="text-sm text-coffee">{card[0]}</p>{createElement(card[2], { className: 'h-4 w-4 text-terracotta' })}</div><p className="mt-3 text-2xl font-bold text-walnut">{card[1]}</p></div>)}</div><section className="mt-6 rounded-xl border border-light-wood/60 bg-white"><div className="border-b border-light-wood/60 px-5 py-4"><h2 className="font-semibold text-walnut">Son siparişler</h2></div>{!data?.recent_orders?.length ? <p className="p-8 text-center text-sm text-coffee">Henüz sipariş bulunmuyor.</p> : <div className="divide-y divide-light-wood/50">{data.recent_orders.map((order) => <div key={order.id} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-4 sm:items-center"><span className="font-medium text-walnut">#{order.order_number}</span><span className="text-coffee">{statusLabels[order.status] || order.status}</span><span className="text-coffee">{new Date(order.created_at).toLocaleDateString('tr-TR')}</span><span className="font-semibold text-walnut sm:text-right">{money(order.total_amount)}</span></div>)}</div>}</section></div>;
}
