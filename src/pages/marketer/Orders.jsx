import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Info, Package, Truck } from 'lucide-react';
import { getMarketerOrder, getMarketerOrders } from '../../api/marketer';

const money = (v) => `${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

const statusLabels = {
  pending: 'Ödeme bekliyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
  refunded: 'İade',
};

const statusStyles = {
  pending: 'bg-golden-oak/20 text-coffee',
  paid: 'bg-olive/10 text-olive',
  processing: 'bg-terracotta/15 text-terracotta',
  shipped: 'bg-terracotta/15 text-terracotta',
  delivered: 'bg-olive/15 text-olive',
  cancelled: 'bg-red-50 text-red-600',
  refunded: 'bg-red-50 text-red-600',
};

export default function MarketerOrders() {
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['marketerOrders', status],
    queryFn: () => getMarketerOrders({ status: status || undefined }),
  });

  const orders = data?.orders || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-walnut">Siparişlerim</h1>
        <p className="mt-1 text-sm text-coffee">
          Oluşturduğun siparişler ve süreçleri. Durum ve kargo bilgilerini yönetim ekibi günceller.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-coffee" htmlFor="status-filter">Durum</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-light-wood bg-white px-3 py-2 text-sm text-walnut"
        >
          <option value="">Tümü</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : !orders.length ? (
        <div className="rounded-xl border border-light-wood/60 bg-white p-10 text-center text-sm text-coffee">
          Bu filtreye uyan sipariş yok.
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-xl border border-light-wood/60 bg-white">
              <button
                onClick={() => setExpanded(expanded === order.id ? '' : order.id)}
                className="grid w-full grid-cols-2 items-center gap-2 px-5 py-4 text-left text-sm sm:grid-cols-6"
              >
                <span className="font-medium text-walnut">#{order.order_number}</span>
                <span className="text-coffee">{order.guest_name}</span>
                <span>
                  <span className={`rounded-full px-2 py-1 text-xs ${statusStyles[order.status] || 'bg-light-wood/40 text-coffee'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </span>
                <span className="text-xs text-coffee">
                  {new Date(order.created_at).toLocaleDateString('tr-TR')}
                </span>
                <span className="font-semibold text-walnut sm:text-right">{money(order.total_amount)}</span>
                <span className="flex items-center justify-end gap-2 text-xs text-olive">
                  +{money(order.marketer_commission_amount)}
                  <ChevronDown className={`h-4 w-4 text-coffee transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {expanded === order.id && <OrderDetail id={order.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetail({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['marketerOrder', id],
    queryFn: () => getMarketerOrder(id),
  });

  if (isLoading) {
    return <div className="border-t border-light-wood/50 p-5 text-sm text-coffee">Yükleniyor...</div>;
  }
  if (!data) return null;

  return (
    <div className="border-t border-light-wood/50 bg-cream/40 p-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-walnut">
            <Package className="h-4 w-4" /> Ürünler
          </h3>
          <div className="space-y-2">
            {data.items?.map((item, index) => (
              <div key={index} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="text-walnut">{item.product_name}</p>
                  <p className="text-xs text-coffee">
                    {item.quantity} adet × {money(item.unit_price)}
                    {item.selected_width_cm && ` · ${item.selected_width_cm}×${item.selected_height_cm} cm`}
                    {item.variant_size_name && ` · ${item.variant_size_name}`}
                    {item.variant_color_name && ` · ${item.variant_color_name}`}
                    {Number(item.line_discount_percent) > 0 && (
                      <span className="text-terracotta"> · %{Number(item.line_discount_percent)} iskonto</span>
                    )}
                  </p>
                </div>
                <span className="whitespace-nowrap font-medium text-walnut">
                  {money(Number(item.total_price) - Number(item.allocated_discount || 0))}
                </span>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-1 border-t border-light-wood/50 pt-3 text-sm">
            <Row label="Liste tutarı" value={money(data.subtotal)} />
            <Row label={`İskonto (%${Number(data.marketer_discount_percent || 0)})`} value={`− ${money(data.discount_amount)}`} />
            <Row label={data.shipping_waived ? 'Kargo (bedelsiz)' : 'Kargo'} value={money(data.shipping_fee)} />
            <div className="flex justify-between border-t border-light-wood/50 pt-2 font-semibold text-walnut">
              <dt>Toplam</dt>
              <dd>{money(data.total_amount)}</dd>
            </div>
            <div className="flex justify-between text-olive">
              <dt>Kazancın</dt>
              <dd>{money(data.marketer_commission_amount)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-walnut">
            <Truck className="h-4 w-4" /> Teslimat
          </h3>
          <p className="text-sm text-walnut">{data.shipping_name}</p>
          <p className="text-sm text-coffee">{data.shipping_phone}</p>
          <p className="mt-1 text-sm text-coffee">
            {data.shipping_address} {data.shipping_apartment}
            <br />
            {data.shipping_district} / {data.shipping_city}
          </p>

          {data.fulfillments?.map((f, index) => (
            <div key={index} className="mt-3 rounded-lg border border-light-wood/60 bg-white p-3 text-sm">
              <p className="font-medium text-walnut">{f.brand_name}</p>
              <p className="text-xs text-coffee">Durum: {f.status}</p>
              {f.cargo_company && (
                <p className="mt-1 text-xs text-coffee">
                  {f.cargo_company} · Takip: {f.tracking_number}
                </p>
              )}
            </div>
          ))}

          <p className="mt-4 flex items-start gap-2 rounded-lg bg-light-wood/30 p-3 text-xs text-coffee">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Sipariş süreci yönetim ekibi tarafından yürütülür. Bir değişiklik gerekiyorsa onlara iletmelisin.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-coffee">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
