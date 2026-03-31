import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X, Save, Loader2, Ticket, CheckCircle2, XCircle } from 'lucide-react';
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/admin';

const emptyCoupon = { code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '' };

const LIMIT = 15;

const Coupons = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [page, setPage] = useState(1);

  const { data: allCoupons = [], isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: getAdminCoupons,
  });

  const totalPages = Math.ceil(allCoupons.length / LIMIT);
  const coupons = allCoupons.slice((page - 1) * LIMIT, page * LIMIT);

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setShowCreate(false);
      setForm(emptyCoupon);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCoupons'] }),
  });

  const handleSubmit = (isEdit) => {
    const data = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_amount: parseFloat(form.discount_value),
    };
    if (form.min_order_amount) data.min_order_amount = parseFloat(form.min_order_amount);
    if (form.max_uses) data.max_uses = parseInt(form.max_uses);
    if (form.expires_at) data.expires_at = form.expires_at;

    if (isEdit) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_amount,
      min_order_amount: coupon.min_order_amount || '',
      max_uses: coupon.max_uses || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    });
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`"${code}" kuponunu silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  const mutation = editingId ? updateMutation : createMutation;
  const showForm = showCreate || editingId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2914]">Kupon Yönetimi</h1>
          <p className="text-sm text-[#8B5A2B] mt-0.5">İndirim kuponlarını oluşturun ve yönetin.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowCreate(true); setForm(emptyCoupon); setEditingId(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C67D4A] text-white text-sm font-medium hover:bg-[#C67D4A]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Yeni Kupon
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5 mb-4">
          <h3 className="text-sm font-bold text-[#3D2914] mb-3">
            {editingId ? 'Kuponu Düzenle' : 'Yeni Kupon Oluştur'}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">Kupon Kodu *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="YENIYIL25"
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] uppercase focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">İndirim Tipi *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] bg-white focus:outline-none focus:border-[#C67D4A]"
              >
                <option value="percentage">Yüzde (%)</option>
                <option value="fixed">Sabit Tutar (₺)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">İndirim Değeri *</label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.discount_type === 'percentage' ? '25' : '50'}
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">Min. Sipariş Tutarı</label>
              <input
                type="number"
                value={form.min_order_amount}
                onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                placeholder="100"
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">Maks. Kullanım</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="100"
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">Son Kullanma Tarihi</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowCreate(false); setEditingId(null); setForm(emptyCoupon); }}
              className="px-3 py-1.5 text-sm text-[#8B5A2B] hover:bg-[#E8D5C4]/20 rounded-lg"
            >
              İptal
            </button>
            <button
              onClick={() => handleSubmit(!!editingId)}
              disabled={!form.code || !form.discount_value || mutation.isPending}
              className="px-4 py-1.5 text-sm bg-[#4A5D23] text-white font-medium rounded-lg hover:bg-[#4A5D23]/90 disabled:opacity-40 flex items-center gap-1.5"
            >
              {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Kaydet
            </button>
          </div>
          {mutation.isError && <p className="text-xs text-red-500 mt-2">{mutation.error?.response?.data?.message || 'Hata'}</p>}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-[#E8D5C4]/30 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Ticket className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
          <p className="text-[#8B5A2B]">Henüz kupon oluşturulmamış.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => {
            const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
            const maxReached = coupon.max_uses && coupon.used_count >= coupon.max_uses;
            const active = !expired && !maxReached && coupon.is_active !== false;

            return (
              <div key={coupon.id} className="bg-white rounded-xl border border-[#E8D5C4]/50 p-3 sm:p-4 hover:bg-[#FAF6F0]/50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-sm text-[#3D2914] truncate">{coupon.code}</span>
                    {active ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(coupon)} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30 hover:text-[#C67D4A]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(coupon.id, coupon.code)} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-[#8B5A2B]">
                  <span className="font-semibold text-[#C67D4A]">
                    {coupon.discount_type === 'percentage' ? `%${coupon.discount_amount}` : `₺${coupon.discount_amount}`}
                  </span>
                  {coupon.min_order_amount && <span>Min: ₺{coupon.min_order_amount}</span>}
                  <span>Kullanım: {coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                  {coupon.expires_at && (
                    <span className={expired ? 'text-red-500 font-semibold' : ''}>
                      {expired ? 'Süresi doldu: ' : 'Bitiş: '}{new Date(coupon.expires_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {allCoupons.length > LIMIT && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40">
            Önceki
          </button>
          <span className="px-4 py-2 text-sm text-[#8B5A2B]">Sayfa {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40">
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default Coupons;
