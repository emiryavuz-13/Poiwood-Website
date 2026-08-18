import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Loader2, Pencil, Plus, Power, Ticket, Trash2, X } from 'lucide-react';
import {
  createBrandCoupon,
  deleteBrandCoupon,
  getBrandCoupons,
  updateBrandCoupon,
} from '../../api/brand';
import { useBrand } from '../../contexts/BrandContext';
import { triggerActionToast } from '../../utils/toast';

const emptyForm = {
  code: '',
  discount_type: 'percentage',
  discount_amount: '',
  min_cart_amount: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

const money = (value) => Number(value || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

export default function BrandCoupons() {
  const { brandId, brand } = useBrand();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['brandCoupons', brandId],
    queryFn: () => getBrandCoupons(brandId),
    enabled: Boolean(brandId),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['brandCoupons', brandId] });
  const saveMutation = useMutation({
    mutationFn: (payload) => editingId
      ? updateBrandCoupon(brandId, editingId, payload)
      : createBrandCoupon(brandId, payload),
    onSuccess: () => {
      refresh();
      triggerActionToast({ title: editingId ? 'Kupon güncellendi' : 'Kupon oluşturuldu', message: 'Değişiklikler hemen kullanıma hazır.' });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBrandCoupon(brandId, id),
    onSuccess: () => {
      refresh();
      triggerActionToast({ title: 'Kupon silindi', message: 'Kupon artık kullanılamaz.' });
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateBrandCoupon(brandId, id, { is_active: isActive }),
    onSuccess: refresh,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      ...emptyForm,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_amount: coupon.discount_amount,
      min_cart_amount: coupon.min_cart_amount || '',
      max_uses: coupon.max_uses || '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active,
    });
    setFormOpen(true);
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = editingId ? {
      min_cart_amount: Number(form.min_cart_amount || 0),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    } : {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_amount: Number(form.discount_amount),
      min_cart_amount: Number(form.min_cart_amount || 0),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };
    saveMutation.mutate(payload);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-terracotta">{brand?.brand_name}</p>
          <h1 className="font-heading text-2xl font-bold text-walnut">Kuponlar</h1>
          <p className="mt-1 max-w-2xl text-sm text-coffee">Kupon indirimi yalnızca markanızın ürün toplamına uygulanır. Minimum tutar şartı da markanızın sepet ara toplamına göre kontrol edilir.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta/90">
          <Plus className="h-4 w-4" /> Yeni kupon
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="mb-5 rounded-xl border border-light-wood/70 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="font-semibold text-walnut">{editingId ? 'Kupon şartlarını düzenle' : 'Yeni kupon oluştur'}</h2><p className="text-xs text-coffee">Müşteri kodu sepetteki tek kupon alanından uygular.</p></div>
            <button type="button" onClick={closeForm} aria-label="Formu kapat" className="rounded-lg p-2 text-coffee hover:bg-cream"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Kupon kodu" disabled={Boolean(editingId)}><input required={!editingId} disabled={Boolean(editingId)} value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="YAZ15" className="w-full rounded-lg border border-light-wood bg-white px-3 py-2.5 text-sm text-walnut outline-none focus:border-terracotta disabled:bg-cream" /></Field>
            <Field label="İndirim tipi"><select disabled={Boolean(editingId)} value={form.discount_type} onChange={(event) => setForm((current) => ({ ...current, discount_type: event.target.value }))} className="w-full rounded-lg border border-light-wood bg-white px-3 py-2.5 text-sm text-walnut outline-none focus:border-terracotta disabled:bg-cream"><option value="percentage">Yüzde (%)</option><option value="fixed">Sabit tutar (₺)</option></select></Field>
            <Field label="İndirim değeri"><input required={!editingId} disabled={Boolean(editingId)} type="number" min="0.01" max={form.discount_type === 'percentage' ? '100' : undefined} step="0.01" value={form.discount_amount} onChange={(event) => setForm((current) => ({ ...current, discount_amount: event.target.value }))} className="w-full rounded-lg border border-light-wood bg-white px-3 py-2.5 text-sm text-walnut outline-none focus:border-terracotta disabled:bg-cream" /></Field>
            <Field label="Marka minimum tutarı"><input type="number" min="0" step="0.01" value={form.min_cart_amount} onChange={(event) => setForm((current) => ({ ...current, min_cart_amount: event.target.value }))} placeholder="0" className="w-full rounded-lg border border-light-wood bg-white px-3 py-2.5 text-sm text-walnut outline-none focus:border-terracotta" /></Field>
            <Field label="Maksimum kullanım"><input type="number" min="1" step="1" value={form.max_uses} onChange={(event) => setForm((current) => ({ ...current, max_uses: event.target.value }))} placeholder="Sınırsız" className="w-full rounded-lg border border-light-wood bg-white px-3 py-2.5 text-sm text-walnut outline-none focus:border-terracotta" /></Field>
            <Field label="Son kullanım tarihi"><input type="date" value={form.expires_at} onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))} className="w-full rounded-lg border border-light-wood bg-white px-3 py-2.5 text-sm text-walnut outline-none focus:border-terracotta" /></Field>
          </div>
          {saveMutation.isError && <p className="mt-3 text-sm text-red-600">{saveMutation.error?.response?.data?.message || 'Kupon kaydedilemedi'}</p>}
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg px-4 py-2 text-sm font-medium text-coffee hover:bg-cream">Vazgeç</button><button disabled={saveMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-olive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Kaydet</button></div>
        </form>
      )}

      {isLoading ? <div className="h-40 animate-pulse rounded-xl bg-white" /> : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-light-wood bg-white p-12 text-center"><Ticket className="mx-auto mb-3 h-10 w-10 text-golden-oak" /><h2 className="font-semibold text-walnut">Henüz kupon yok</h2><p className="mt-1 text-sm text-coffee">İlk mağaza kuponunuzu oluşturarak başlayın.</p></div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {coupons.map((coupon) => {
            const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
            const exhausted = coupon.max_uses && coupon.used_count >= coupon.max_uses;
            const usable = coupon.is_active && !expired && !exhausted;
            return <article key={coupon.id} className="rounded-xl border border-light-wood/70 bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate font-mono text-lg font-bold tracking-wide text-walnut">{coupon.code}</span>{usable && <CheckCircle2 className="h-4 w-4 shrink-0 text-olive" />}</div><p className="mt-1 text-sm font-semibold text-terracotta">{coupon.discount_type === 'percentage' ? `%${money(coupon.discount_amount)}` : `${money(coupon.discount_amount)} ₺`} indirim</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${usable ? 'bg-olive/10 text-olive' : 'bg-red-50 text-red-600'}`}>{usable ? 'Aktif' : expired ? 'Süresi doldu' : exhausted ? 'Limit doldu' : 'Pasif'}</span></div><div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-cream p-3 text-xs text-coffee"><span>Min. marka tutarı<strong className="mt-0.5 block text-sm text-walnut">{money(coupon.min_cart_amount)} ₺</strong></span><span>Kullanım<strong className="mt-0.5 block text-sm text-walnut">{coupon.used_count || 0}{coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}</strong></span>{coupon.expires_at && <span className="col-span-2 flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(coupon.expires_at).toLocaleDateString('tr-TR')}</span>}</div><div className="mt-3 flex justify-end gap-1"><button onClick={() => statusMutation.mutate({ id: coupon.id, isActive: !coupon.is_active })} title={coupon.is_active ? 'Pasife al' : 'Aktifleştir'} className="rounded-lg p-2 text-coffee hover:bg-cream"><Power className="h-4 w-4" /></button><button onClick={() => openEdit(coupon)} title="Düzenle" className="rounded-lg p-2 text-coffee hover:bg-cream"><Pencil className="h-4 w-4" /></button><button onClick={() => window.confirm(`${coupon.code} kuponu silinsin mi?`) && deleteMutation.mutate(coupon.id)} title="Sil" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></article>;
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, disabled, children }) {
  return <label className={disabled ? 'opacity-60' : ''}><span className="mb-1.5 block text-xs font-medium text-coffee">{label}</span>{children}</label>;
}
