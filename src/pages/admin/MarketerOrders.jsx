import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Truck, UserRound } from 'lucide-react';
import {
  addOrderTracking, getAdminMarketerOrders, getAdminOrderDetail, getMarketers, updateOrderStatus,
} from '../../api/admin';
import { triggerActionToast } from '../../utils/toast';

const money = (v) => `${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

const STATUS_MAP = {
  pending: { label: 'Ödeme bekliyor', color: 'bg-[#D4A574]/25 text-[#8B5A2B]' },
  paid: { label: 'Ödendi', color: 'bg-[#4A5D23]/10 text-[#4A5D23]' },
  processing: { label: 'Hazırlanıyor', color: 'bg-[#C67D4A]/15 text-[#C67D4A]' },
  shipped: { label: 'Kargoda', color: 'bg-[#C67D4A]/15 text-[#C67D4A]' },
  delivered: { label: 'Teslim edildi', color: 'bg-[#4A5D23]/15 text-[#4A5D23]' },
  cancelled: { label: 'İptal', color: 'bg-red-50 text-red-600' },
  refunded: { label: 'İade', color: 'bg-red-50 text-red-600' },
};

const CARGO_COMPANIES = ['Aras Kargo', 'Yurtiçi Kargo', 'MNG Kargo', 'PTT Kargo', 'Sürat Kargo', 'HepsiJet'];

export default function MarketerOrders() {
  const [status, setStatus] = useState('');
  const [marketerId, setMarketerId] = useState('');
  const [expanded, setExpanded] = useState('');
  const [page, setPage] = useState(1);

  const { data: marketers = [] } = useQuery({ queryKey: ['marketers'], queryFn: getMarketers });
  const { data, isLoading } = useQuery({
    queryKey: ['adminMarketerOrders', status, marketerId, page],
    queryFn: () => getAdminMarketerOrders({
      status: status || undefined,
      marketer_id: marketerId || undefined,
      page,
      limit: 15,
    }),
  });

  const orders = data?.orders || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-[#3D2914]">Pazarlamacı siparişleri</h1>
        <p className="mt-1 text-sm text-[#8B5A2B]">
          Saha satışlarının tamamı. Durum ve kargo süreçleri yalnızca buradan yönetilir.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={marketerId}
          onChange={(e) => { setMarketerId(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#E8D5C4] bg-white px-3 py-2 text-sm text-[#3D2914]"
        >
          <option value="">Tüm pazarlamacılar</option>
          {marketers.map((m) => (
            <option key={m.id} value={m.id}>{m.display_name || m.email}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#E8D5C4] bg-white px-3 py-2 text-sm text-[#3D2914]"
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(STATUS_MAP).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : !orders.length ? (
        <div className="rounded-xl border border-[#E8D5C4]/60 bg-white p-10 text-center text-sm text-[#8B5A2B]">
          Bu filtreye uyan sipariş yok.
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-xl border border-[#E8D5C4]/60 bg-white">
              <button
                onClick={() => setExpanded(expanded === order.id ? '' : order.id)}
                className="grid w-full grid-cols-2 items-center gap-2 px-5 py-4 text-left text-sm sm:grid-cols-6"
              >
                <span className="font-medium text-[#3D2914]">#{order.order_number}</span>
                <span className="flex items-center gap-1.5 text-xs text-[#8B5A2B]">
                  <UserRound className="h-3.5 w-3.5" /> {order.marketer_name}
                </span>
                <span className="text-[#8B5A2B]">{order.guest_name}</span>
                <span>
                  <span className={`rounded-full px-2 py-1 text-xs ${STATUS_MAP[order.status]?.color || ''}`}>
                    {STATUS_MAP[order.status]?.label || order.status}
                  </span>
                </span>
                <span className="font-semibold text-[#3D2914] sm:text-right">{money(order.total_amount)}</span>
                <span className="flex items-center justify-end gap-2 text-xs text-[#8B5A2B]">
                  {Number(order.marketer_discount_percent) > 0 && `%${Number(order.marketer_discount_percent)} isk.`}
                  <ChevronRight className={`h-4 w-4 transition-transform ${expanded === order.id ? 'rotate-90' : ''}`} />
                </span>
              </button>
              {expanded === order.id && <OrderDetail orderId={order.id} currentStatus={order.status} />}
            </div>
          ))}
        </div>
      )}

      {data?.pagination?.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[#E8D5C4] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="text-sm text-[#8B5A2B]">
            {page} / {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page >= data.pagination.totalPages}
            className="rounded-lg border border-[#E8D5C4] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

function OrderDetail({ orderId, currentStatus }) {
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState(currentStatus);
  const [adminNote, setAdminNote] = useState('');
  const [cargoCompany, setCargoCompany] = useState('');
  const [trackingNo, setTrackingNo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrderDetail', orderId],
    queryFn: () => getAdminOrderDetail(orderId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminMarketerOrders'] });
    queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderId] });
    queryClient.invalidateQueries({ queryKey: ['marketers'] });
  };

  const statusMutation = useMutation({
    mutationFn: () => updateOrderStatus(orderId, { status: nextStatus, admin_note: adminNote || undefined }),
    onSuccess: () => {
      refresh();
      triggerActionToast({
        type: 'success',
        title: 'Durum güncellendi',
        message: nextStatus === 'delivered'
          ? 'Teslim edildi. Pazarlamacının komisyonu hak edişe geçti.'
          : 'Sipariş durumu kaydedildi.',
      });
    },
  });

  const trackingMutation = useMutation({
    mutationFn: () => addOrderTracking(orderId, { cargo_company: cargoCompany, cargo_tracking_no: trackingNo }),
    onSuccess: refresh,
  });

  if (isLoading) {
    return <div className="border-t border-[#E8D5C4]/50 p-5 text-sm text-[#8B5A2B]">Yükleniyor...</div>;
  }
  if (!data) return null;

  return (
    <div className="border-t border-[#E8D5C4]/50 bg-[#FAF6F0]/50 p-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#3D2914]">Alıcı</h3>
          <p className="text-sm text-[#3D2914]">{data.shipping_name}</p>
          <p className="text-sm text-[#8B5A2B]">{data.shipping_phone} · {data.guest_email}</p>
          <p className="mt-1 text-sm text-[#8B5A2B]">
            {data.shipping_address} {data.shipping_apartment}
            <br />
            {data.shipping_district} / {data.shipping_city}
          </p>

          <h3 className="mb-2 mt-4 text-sm font-semibold text-[#3D2914]">Ürünler</h3>
          <div className="space-y-1.5">
            {data.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-[#8B5A2B]">
                  {item.product_name} × {item.quantity}
                  {Number(item.line_discount_percent) > 0 && (
                    <span className="text-[#C67D4A]"> (%{Number(item.line_discount_percent)})</span>
                  )}
                </span>
                <span className="text-[#3D2914]">{money(item.total_price)}</span>
              </div>
            ))}
          </div>

          <dl className="mt-3 space-y-1 border-t border-[#E8D5C4]/50 pt-2 text-sm">
            <div className="flex justify-between text-[#8B5A2B]">
              <dt>Liste tutarı</dt><dd>{money(data.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-[#C67D4A]">
              <dt>Pazarlamacı iskontosu (%{Number(data.marketer_discount_percent || 0)})</dt>
              <dd>− {money(data.discount_amount)}</dd>
            </div>
            <div className="flex justify-between text-[#8B5A2B]">
              <dt>{data.shipping_waived ? 'Kargo (bedelsiz)' : 'Kargo'}</dt>
              <dd>{money(data.shipping_fee)}</dd>
            </div>
            <div className="flex justify-between border-t border-[#E8D5C4]/50 pt-1 font-semibold text-[#3D2914]">
              <dt>Toplam</dt><dd>{money(data.total_amount)}</dd>
            </div>
            <div className="flex justify-between text-[#4A5D23]">
              <dt>Komisyon (%{Number(data.marketer_commission_rate || 0)})</dt>
              <dd>{money(data.marketer_commission_amount)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[#E8D5C4] bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#3D2914]">Sipariş durumu</h3>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="w-full rounded-lg border border-[#E8D5C4] px-3 py-2 text-sm"
            >
              {Object.entries(STATUS_MAP).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Yönetici notu (opsiyonel)"
              className="mt-2 w-full rounded-lg border border-[#E8D5C4] px-3 py-2 text-sm"
            />
            <button
              onClick={() => statusMutation.mutate()}
              disabled={statusMutation.isPending || nextStatus === currentStatus}
              className="mt-2 w-full rounded-lg bg-[#3D2914] py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Durumu güncelle
            </button>
            {nextStatus === 'delivered' && currentStatus !== 'delivered' && (
              <p className="mt-2 text-xs text-[#4A5D23]">
                Teslim edildi işaretlendiğinde pazarlamacının komisyonu hak edişe geçer.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-[#E8D5C4] bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#3D2914]">
              <Truck className="h-4 w-4" /> Kargo bilgisi
            </h3>
            {data.cargo_company && (
              <p className="mb-2 text-xs text-[#8B5A2B]">
                Mevcut: {data.cargo_company} · {data.cargo_tracking_no}
              </p>
            )}
            <select
              value={cargoCompany}
              onChange={(e) => setCargoCompany(e.target.value)}
              className="w-full rounded-lg border border-[#E8D5C4] px-3 py-2 text-sm"
            >
              <option value="">Kargo firması seçin</option>
              {CARGO_COMPANIES.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
            <input
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              placeholder="Takip numarası"
              className="mt-2 w-full rounded-lg border border-[#E8D5C4] px-3 py-2 text-sm"
            />
            <button
              onClick={() => trackingMutation.mutate()}
              disabled={!cargoCompany || !trackingNo || trackingMutation.isPending}
              className="mt-2 w-full rounded-lg border border-[#3D2914] py-2 text-sm font-semibold text-[#3D2914] disabled:opacity-40"
            >
              Kargoya ver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
