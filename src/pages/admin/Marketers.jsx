import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Percent, Plus, UserRound } from 'lucide-react';
import {
  createMarketer, getMarketers, resetMarketerPassword, updateMarketer,
} from '../../api/admin';
import { triggerActionToast } from '../../utils/toast';

const money = (v) => `${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

const blank = {
  email: '', display_name: '', password: '',
  commission_rate: 10, max_discount_percent: 15, phone: '', note: '', is_active: true,
};

export default function Marketers() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const { data = [], isLoading } = useQuery({ queryKey: ['marketers'], queryFn: getMarketers });

  // Form, seçim anında doldurulur — effect ile senkronlamak gereksiz bir render turu yaratırdı.
  const selectMarketer = (marketer) => {
    setSelected(marketer);
    setCreating(false);
    setError('');
    setForm({
      ...blank,
      email: marketer.email,
      display_name: marketer.display_name || '',
      commission_rate: marketer.commission_rate,
      max_discount_percent: marketer.max_discount_percent,
      phone: marketer.phone || '',
      note: marketer.note || '',
      is_active: marketer.is_active,
    });
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['marketers'] });

  const save = useMutation({
    mutationFn: () => (selected
      ? updateMarketer(selected.id, {
        display_name: form.display_name,
        commission_rate: Number(form.commission_rate),
        max_discount_percent: Number(form.max_discount_percent),
        phone: form.phone,
        note: form.note,
        is_active: form.is_active,
      })
      : createMarketer({
        ...form,
        commission_rate: Number(form.commission_rate),
        max_discount_percent: Number(form.max_discount_percent),
      })),
    onSuccess: (marketer) => {
      refresh();
      selectMarketer(marketer);
      triggerActionToast({ type: 'success', title: 'Kaydedildi', message: 'Pazarlamacı bilgileri güncellendi.' });
    },
    onError: (err) => setError(err.response?.data?.message || 'Kaydedilemedi'),
  });

  const startCreate = () => {
    setSelected(null);
    setCreating(true);
    setForm(blank);
    setError('');
  };

  const resetPassword = async (userId, name) => {
    const password = window.prompt(`${name} için en az 8 karakterlik yeni geçici şifreyi girin:`);
    if (!password) return;
    if (password.length < 8) {
      triggerActionToast({ type: 'error', title: 'Şifre kısa', message: 'En az 8 karakter olmalı.' });
      return;
    }
    await resetMarketerPassword(userId, password);
    refresh();
    triggerActionToast({
      type: 'success',
      title: 'Şifre sıfırlandı',
      message: 'Pazarlamacı ilk girişte şifresini değiştirmek zorunda.',
    });
  };

  const canSave = selected
    ? form.display_name.trim().length >= 2
    : form.email.includes('@') && form.display_name.trim().length >= 2 && form.password.length >= 8;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#3D2914]">Pazarlamacılar</h1>
          <p className="mt-1 text-sm text-[#8B5A2B]">
            Saha satışı yapan kullanıcılar. Komisyon oranı ve iskonto yetkisi kişiye özel tanımlanır.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-lg bg-[#3D2914] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Yeni pazarlamacı
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <section className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />
            ))
          ) : !data.length ? (
            <div className="rounded-xl border border-[#E8D5C4]/60 bg-white p-10 text-center text-sm text-[#8B5A2B]">
              Henüz pazarlamacı tanımlanmadı.
            </div>
          ) : (
            data.map((marketer) => (
              <button
                key={marketer.id}
                onClick={() => selectMarketer(marketer)}
                className={`w-full rounded-xl border bg-white p-4 text-left transition ${
                  selected?.id === marketer.id
                    ? 'border-[#C67D4A] ring-1 ring-[#C67D4A]'
                    : 'border-[#E8D5C4]/60 hover:border-[#C67D4A]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium text-[#3D2914]">
                      <UserRound className="h-4 w-4 text-[#C67D4A]" />
                      {marketer.display_name || marketer.email}
                    </p>
                    <p className="mt-0.5 text-xs text-[#8B5A2B]">{marketer.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                    marketer.is_active ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'bg-red-50 text-red-600'
                  }`}>
                    {marketer.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#8B5A2B] sm:grid-cols-4">
                  <Stat label="Komisyon" value={`%${marketer.commission_rate}`} />
                  <Stat label="İskonto yetkisi" value={`%${marketer.max_discount_percent}`} />
                  <Stat label="Sipariş" value={marketer.order_count} />
                  <Stat label="Hak ediş" value={money(marketer.earned_commission)} />
                </div>

                {marketer.must_change_password && (
                  <p className="mt-2 text-xs text-[#C67D4A]">Şifre değişimi bekleniyor</p>
                )}
              </button>
            ))
          )}
        </section>

        <section className="h-fit rounded-xl border border-[#E8D5C4]/60 bg-white p-5">
          {!selected && !creating ? (
            <p className="py-10 text-center text-sm text-[#8B5A2B]">
              Düzenlemek için bir pazarlamacı seçin veya yeni bir tane ekleyin.
            </p>
          ) : (
            <>
              <h2 className="font-semibold text-[#3D2914]">
                {selected ? 'Pazarlamacıyı düzenle' : 'Yeni pazarlamacı'}
              </h2>

              <Field label="Ad soyad *">
                <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
              </Field>

              <Field label="E-posta *">
                <input
                  type="email" value={form.email} disabled={Boolean(selected)}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>

              {!selected && (
                <Field label="Geçici şifre * (en az 8 karakter)">
                  <input
                    type="text" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Pazarlamacıya iletilecek"
                  />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Komisyon oranı (%)">
                  <input
                    type="number" min="0" max="100" step="0.5" value={form.commission_rate}
                    onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                  />
                </Field>
                <Field label="İskonto yetkisi (%)">
                  <input
                    type="number" min="0" max="100" step="0.5" value={form.max_discount_percent}
                    onChange={(e) => setForm({ ...form, max_discount_percent: e.target.value })}
                  />
                </Field>
              </div>

              <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#FAF6F0] p-2.5 text-xs text-[#8B5A2B]">
                <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C67D4A]" />
                Komisyon, iskonto sonrası tutar üzerinden hesaplanır; kargo dahil edilmez.
                Sipariş anındaki oran dondurulur, sonradan değiştirmek geçmiş hak edişleri etkilemez.
              </p>

              <Field label="Telefon">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>

              <Field label="Dahili not">
                <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </Field>

              <label className="mt-3 flex items-center gap-2 text-sm text-[#8B5A2B]">
                <input
                  type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-[#E8D5C4]"
                />
                Aktif (pasif pazarlamacı sipariş oluşturamaz)
              </label>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <button
                onClick={() => save.mutate()}
                disabled={!canSave || save.isPending}
                className="mt-4 w-full rounded-lg bg-[#3D2914] py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {save.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {selected && (
                <button
                  onClick={() => resetPassword(selected.id, selected.display_name || selected.email)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8D5C4] py-2.5 text-sm font-medium text-[#8B5A2B] hover:bg-[#FAF6F0]"
                >
                  <KeyRound className="h-4 w-4" /> Geçici şifre ver
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-[#3D2914]">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="mt-3 block text-xs font-medium text-[#8B5A2B]">
      {label}
      <span className="mt-1 block [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#E8D5C4] [&>input]:px-3 [&>input]:py-2 [&>input]:text-sm [&>input:disabled]:bg-[#FAF6F0] [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-[#E8D5C4] [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea]:text-sm">
        {children}
      </span>
    </label>
  );
}
