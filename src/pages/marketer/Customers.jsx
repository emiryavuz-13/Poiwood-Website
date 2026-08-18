import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, Search, Trash2, UserPlus } from 'lucide-react';
import { deleteMarketerCustomer, getMarketerCustomers, saveMarketerCustomer } from '../../api/marketer';
import { iller, getIlceler } from '../../utils/turkiye-il-ilce';
import { triggerActionToast } from '../../utils/toast';

const blank = {
  full_name: '', phone: '', email: '',
  city: '', district: '', address_line: '', apartment: '', note: '',
};

export default function MarketerCustomers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['marketerCustomers', search],
    queryFn: () => getMarketerCustomers(search || undefined),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['marketerCustomers'] });

  const save = useMutation({
    mutationFn: () => saveMarketerCustomer(form),
    onSuccess: () => {
      refresh();
      setForm(blank);
      setError('');
      triggerActionToast({ type: 'success', title: 'Kaydedildi', message: 'Müşteri rehberine eklendi.' });
    },
    onError: (err) => setError(err.response?.data?.message || 'Kaydedilemedi'),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteMarketerCustomer(id),
    onSuccess: refresh,
  });

  const canSave = form.full_name.trim().length >= 2 && /^0\d{10}$/.test(form.phone);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-walnut">Müşterilerim</h1>
        <p className="mt-1 text-sm text-coffee">
          Buradaki kişiler sipariş oluştururken aramayla otomatik dolar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <section>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim veya telefon ara"
              className="w-full rounded-lg border border-light-wood bg-white py-2.5 pl-9 pr-3 text-sm text-walnut"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
              ))}
            </div>
          ) : !data.length ? (
            <div className="rounded-xl border border-light-wood/60 bg-white p-10 text-center text-sm text-coffee">
              {search ? 'Eşleşen müşteri yok.' : 'Henüz müşteri kaydın yok.'}
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-light-wood/60 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-walnut">{customer.full_name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-coffee">
                      <Phone className="h-3.5 w-3.5" /> {customer.phone}
                    </p>
                    {(customer.city || customer.district) && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-coffee">
                        <MapPin className="h-3.5 w-3.5" />
                        {[customer.district, customer.city].filter(Boolean).join(' / ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => remove.mutate(customer.id)}
                    aria-label={`${customer.full_name} kaydını sil`}
                    className="rounded-lg p-2 text-coffee hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="h-fit rounded-xl border border-light-wood/60 bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-walnut">
            <UserPlus className="h-4 w-4 text-terracotta" /> Yeni müşteri
          </h2>
          <p className="mt-1 text-xs text-coffee">
            Aynı telefon zaten kayıtlıysa bilgiler güncellenir, kopya oluşmaz.
          </p>

          <Field label="Ad soyad *">
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Telefon * (0XXXXXXXXXX)">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              placeholder="05551112233"
            />
          </Field>
          <Field label="E-posta">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="İl">
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value, district: '' })}
            >
              <option value="">Seçiniz</option>
              {iller.map((il) => <option key={il} value={il}>{il}</option>)}
            </select>
          </Field>
          <Field label="İlçe">
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              disabled={!form.city}
            >
              <option value="">Seçiniz</option>
              {getIlceler(form.city).map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
            </select>
          </Field>
          <Field label="Adres">
            <textarea rows={2} value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} />
          </Field>
          <Field label="Daire / kapı no">
            <input value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
          </Field>
          <Field label="Not">
            <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={() => save.mutate()}
            disabled={!canSave || save.isPending}
            className="mt-4 w-full rounded-lg bg-walnut py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {save.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="mt-3 block text-xs font-medium text-coffee">
      {label}
      <span className="mt-1 block [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-light-wood [&>input]:px-3 [&>input]:py-2 [&>input]:text-sm [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-light-wood [&>select]:px-3 [&>select]:py-2 [&>select]:text-sm [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-light-wood [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea]:text-sm">
        {children}
      </span>
    </label>
  );
}
