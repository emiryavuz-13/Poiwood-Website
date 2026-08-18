import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ClipboardCheck, Clock3, RotateCcw, XCircle } from 'lucide-react';
import { getBrandApprovalHistory } from '../../api/brand';
import { useBrand } from '../../contexts/BrandContext';

const EVENT_META = {
  submitted: { label: 'Onaya gönderildi', icon: Clock3, className: 'bg-terracotta/10 text-terracotta' },
  approved: { label: 'Onaylandı', icon: CheckCircle2, className: 'bg-olive/10 text-olive' },
  rejected: { label: 'Reddedildi', icon: XCircle, className: 'bg-red-50 text-red-600' },
  withdrawn: { label: 'Geri çekildi', icon: RotateCcw, className: 'bg-light-wood/50 text-coffee' },
};

const REQUEST_LABELS = {
  create: 'Yeni ürün',
  update: 'Ürün güncellemesi',
  delete: 'Silme talebi',
};

export default function ApprovalHistory() {
  const { brandId, brand } = useBrand();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['brandApprovalHistory', brandId],
    queryFn: () => getBrandApprovalHistory(brandId),
    enabled: Boolean(brandId),
  });
  const events = data?.events || [];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-terracotta">{brand?.brand_name}</p>
        <h1 className="font-heading text-2xl font-bold text-walnut">Onay geçmişi</h1>
        <p className="mt-1 text-sm text-coffee">Ürün ekleme, güncelleme ve silme taleplerinizin sonuçlarını takip edin.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-white" />)}</div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Onay geçmişi alınamadı.</div>
      ) : !events.length ? (
        <div className="rounded-xl border border-light-wood/60 bg-white p-10 text-center">
          <ClipboardCheck className="mx-auto mb-3 h-9 w-9 text-light-wood" />
          <p className="text-sm font-medium text-walnut">Henüz onay işlemi yok</p>
          <p className="mt-1 text-xs text-coffee">Ürün talebi gönderdiğinizde gelişmeler burada görünecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const meta = EVENT_META[event.event_type] || EVENT_META.submitted;
            const Icon = meta.icon;
            return (
              <article key={event.id} className="rounded-xl border border-light-wood/60 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.className}`}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-walnut">{event.product_name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-coffee">
                          <span>{REQUEST_LABELS[event.request_type] || event.request_type}</span>
                          <span className={`rounded-md px-2 py-0.5 font-medium ${meta.className}`}>{meta.label}</span>
                        </div>
                      </div>
                      <time className="text-xs text-coffee" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString('tr-TR')}</time>
                    </div>
                    {event.reason && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                        <p className="text-xs font-semibold text-red-700">Ret nedeni</p>
                        <p className="mt-1 text-sm text-red-800">{event.reason}</p>
                      </div>
                    )}
                    {event.actor_name && <p className="mt-2 text-xs text-coffee">İşlemi yapan: {event.actor_name}</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
