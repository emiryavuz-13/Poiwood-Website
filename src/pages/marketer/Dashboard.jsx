import { createElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Clock, PlusCircle, ShoppingCart, TrendingUp, Truck } from 'lucide-react';
import { getMarketerDashboard } from '../../api/marketer';

const money = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

const statusLabels = {
  pending: 'Ödeme bekliyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
  refunded: 'İade',
};

export default function MarketerDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['marketerDashboard'],
    queryFn: getMarketerDashboard,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Özet bilgileri alınamadı.
      </div>
    );
  }

  const s = data?.summary || {};
  const maxDailySales = Math.max(...(data?.weekly_chart || []).map((d) => d.daily_sales), 1);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-terracotta">Komisyon oranın %{s.commission_rate}</p>
          <h1 className="font-heading text-2xl font-bold text-walnut">Genel bakış</h1>
          <p className="mt-1 text-sm text-coffee">
            Kazanç, sipariş teslim edildiğinde hak edilmiş sayılır.
          </p>
        </div>
        <Link
          to="/marketer-panel/new-order"
          className="flex items-center gap-2 rounded-lg bg-walnut px-4 py-2.5 text-sm font-semibold text-white hover:bg-walnut/90"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni sipariş
        </Link>
      </div>

      {/* Kazanç iki kovada: hak edilen ve yolda olan. */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-olive/30 bg-olive/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-olive">Hak edilen kazanç</p>
            <CircleDollarSign className="h-4 w-4 text-olive" />
          </div>
          <p className="mt-2 text-3xl font-bold text-walnut">{money(s.earned_commission)}</p>
          <p className="mt-1 text-xs text-coffee">{s.delivered || 0} teslim edilen siparişten</p>
        </div>
        <div className="rounded-xl border border-golden-oak/40 bg-golden-oak/10 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-coffee">Yoldaki kazanç</p>
            <Clock className="h-4 w-4 text-coffee" />
          </div>
          <p className="mt-2 text-3xl font-bold text-walnut">{money(s.pending_commission)}</p>
          <p className="mt-1 text-xs text-coffee">Teslimat sonrası hak edişe geçer</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Toplam satış', money(s.total_sales), TrendingUp],
          ['Toplam sipariş', s.total_orders || 0, ShoppingCart],
          ['Yolda / hazırlanıyor', (s.in_progress || 0) + (s.shipped || 0), Truck],
          ['Verilen iskonto', money(s.total_discount), CircleDollarSign],
        ].map((card) => (
          <div key={card[0]} className="rounded-xl border border-light-wood/60 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-coffee">{card[0]}</p>
              {createElement(card[2], { className: 'h-4 w-4 text-terracotta' })}
            </div>
            <p className="mt-3 text-2xl font-bold text-walnut">{card[1]}</p>
          </div>
        ))}
      </div>

      {data?.weekly_chart?.length > 0 && (
        <section className="mt-6 rounded-xl border border-light-wood/60 bg-white p-5">
          <h2 className="mb-4 font-semibold text-walnut">Son 7 gün</h2>
          <div className="flex h-32 items-end gap-2">
            {data.weekly_chart.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-terracotta/70"
                  style={{ height: `${Math.max(4, (day.daily_sales / maxDailySales) * 100)}%` }}
                  title={money(day.daily_sales)}
                />
                <span className="text-[10px] text-coffee">
                  {new Date(day.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-light-wood/60 bg-white">
        <div className="border-b border-light-wood/60 px-5 py-4">
          <h2 className="font-semibold text-walnut">Son siparişler</h2>
        </div>
        {!data?.recent_orders?.length ? (
          <p className="p-8 text-center text-sm text-coffee">
            Henüz sipariş oluşturmadın.{' '}
            <Link to="/marketer-panel/new-order" className="font-medium text-terracotta hover:underline">
              İlk siparişini oluştur
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-light-wood/50">
            {data.recent_orders.map((order) => (
              <div key={order.id} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-5 sm:items-center">
                <span className="font-medium text-walnut">#{order.order_number}</span>
                <span className="text-coffee">{order.guest_name}</span>
                <span className="text-coffee">{statusLabels[order.status] || order.status}</span>
                <span className="font-semibold text-walnut sm:text-right">{money(order.total_amount)}</span>
                <span className="text-xs text-olive sm:text-right">
                  +{money(order.marketer_commission_amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
