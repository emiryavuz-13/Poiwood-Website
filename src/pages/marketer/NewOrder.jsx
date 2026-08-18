import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Check, Loader2, Plus, Search, Trash2, TrendingDown, UserRound,
} from 'lucide-react';
import { getProducts, calculateProductPrice, getProductBySlug } from '../../api/products';
import { createMarketerOrder, getMarketerCustomers, getMarketerProfile } from '../../api/marketer';
import { iller, getIlceler } from '../../utils/turkiye-il-ilce';
import { triggerActionToast } from '../../utils/toast';

const money = (v) => `${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
const round2 = (v) => Math.round(v * 100) / 100;

const blankBuyer = {
  buyer_name: '', buyer_phone: '', buyer_email: '',
  shipping_city: '', shipping_district: '', shipping_address: '', shipping_apartment: '',
  customer_note: '',
};

/**
 * İskonto hesabı backend'deki marketer-pricing.js ile birebir aynı sırayı izler:
 * önce satır indirimleri, sonra kalan tutara genel indirim. Buradaki sonuç yalnızca
 * önizlemedir; asıl doğrulama ve tavan kontrolü backend'de tekrar yapılır.
 */
function computeTotals(lines, orderDiscount) {
  const listSubtotal = lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const afterLines = lines.reduce(
    (sum, l) => sum + l.unit_price * l.quantity * (1 - (Number(l.line_discount_percent) || 0) / 100),
    0
  );
  const pct = Number(orderDiscount) || 0;
  const finalSubtotal = afterLines * (1 - pct / 100);

  return {
    listSubtotal: round2(listSubtotal),
    lineDiscount: round2(listSubtotal - afterLines),
    orderDiscount: round2(afterLines - finalSubtotal),
    finalSubtotal: round2(finalSubtotal),
    totalDiscount: round2(listSubtotal - finalSubtotal),
    effectivePercent: listSubtotal === 0 ? 0 : round2(((listSubtotal - finalSubtotal) / listSubtotal) * 100),
  };
}

export default function NewOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [lines, setLines] = useState([]);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [waiveShipping, setWaiveShipping] = useState(false);
  const [buyer, setBuyer] = useState(blankBuyer);
  const [error, setError] = useState('');

  const { data: profile } = useQuery({ queryKey: ['marketerProfile'], queryFn: getMarketerProfile });
  const maxDiscount = Number(profile?.max_discount_percent ?? 0);
  const commissionRate = Number(profile?.commission_rate ?? 0);

  const totals = useMemo(() => computeTotals(lines, orderDiscount), [lines, orderDiscount]);
  const overLimit = totals.effectivePercent > maxDiscount + 1e-9;
  const commission = round2((totals.finalSubtotal * commissionRate) / 100);

  const addLine = (product, extra = {}) => {
    setLines((prev) => [...prev, {
      key: `${product.id}-${extra.variant_id || ''}-${Date.now()}`,
      product_id: product.id,
      name: product.name,
      pricing_type: product.pricing_type,
      quantity: 1,
      line_discount_percent: 0,
      unit_price: extra.unit_price,
      ...extra,
    }]);
  };

  const updateLine = (key, patch) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

  const submit = useMutation({
    mutationFn: () => createMarketerOrder({
      ...buyer,
      order_discount_percent: Number(orderDiscount) || 0,
      waive_shipping: waiveShipping,
      cart_items: lines.map((l) => ({
        product_id: l.product_id,
        quantity: l.quantity,
        variant_id: l.variant_id || undefined,
        selected_width_cm: l.selected_width_cm || undefined,
        selected_height_cm: l.selected_height_cm || undefined,
        line_discount_percent: Number(l.line_discount_percent) || 0,
      })),
    }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['marketerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['marketerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['marketerCustomers'] });
      triggerActionToast({
        type: 'success',
        title: 'Sipariş oluşturuldu',
        message: `${order.order_number} numaralı sipariş kaydedildi.`,
      });
      navigate('/marketer-panel/orders');
    },
    onError: (err) => setError(err.response?.data?.message || 'Sipariş oluşturulamadı'),
  });

  const buyerValid =
    buyer.buyer_name.trim().length >= 2 &&
    /^0\d{10}$/.test(buyer.buyer_phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyer.buyer_email) &&
    buyer.shipping_address.trim().length >= 10 &&
    Boolean(buyer.shipping_city);

  const canSubmit = lines.length > 0 && buyerValid && !overLimit && !submit.isPending;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-walnut">Yeni sipariş</h1>
        <p className="mt-1 text-sm text-coffee">
          Ürünleri seç, iskontoyu belirle, alıcı bilgilerini gir. Ödeme siparişten bağımsız olarak tahsil edilir.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ProductPicker onAdd={addLine} />

          <Cart
            lines={lines}
            maxDiscount={maxDiscount}
            onUpdate={updateLine}
            onRemove={removeLine}
          />

          <BuyerForm buyer={buyer} setBuyer={setBuyer} />
        </div>

        <div className="xl:sticky xl:top-24 xl:h-fit">
          <Summary
            totals={totals}
            maxDiscount={maxDiscount}
            overLimit={overLimit}
            commission={commission}
            commissionRate={commissionRate}
            orderDiscount={orderDiscount}
            setOrderDiscount={setOrderDiscount}
            waiveShipping={waiveShipping}
            setWaiveShipping={setWaiveShipping}
            lineCount={lines.length}
          />

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          <button
            onClick={() => { setError(''); submit.mutate(); }}
            disabled={!canSubmit}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-walnut py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Siparişi tamamla
          </button>

          {!canSubmit && !submit.isPending && (
            <p className="mt-2 text-center text-xs text-coffee">
              {lines.length === 0
                ? 'Sepete en az bir ürün ekle'
                : overLimit
                  ? 'İskonto yetkini aşıyor'
                  : 'Alıcı bilgilerini eksiksiz doldur'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Ürün seçimi ---------------- */

function ProductPicker({ onAdd }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['marketerProducts', search],
    queryFn: () => getProducts({ search: search || undefined, limit: 8 }),
  });

  return (
    <section className="rounded-xl border border-light-wood/60 bg-white p-5">
      <h2 className="mb-3 font-semibold text-walnut">1 · Ürün seç</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün adıyla ara"
          className="w-full rounded-lg border border-light-wood py-2.5 pl-9 pr-3 text-sm text-walnut"
        />
      </div>

      <div className="mt-3 space-y-2">
        {isLoading && <p className="py-4 text-center text-sm text-coffee">Aranıyor...</p>}
        {!isLoading && !data?.products?.length && (
          <p className="py-4 text-center text-sm text-coffee">Ürün bulunamadı.</p>
        )}
        {data?.products?.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-light-wood/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-walnut">{product.name}</p>
              <p className="text-xs text-coffee">
                {product.has_sizes || product.has_colors
                  ? 'Beden/renk seçimi gerekir'
                  : product.pricing_type === 'fixed'
                    ? money(product.sale_price || product.base_price)
                    : 'Ölçüye göre fiyatlanır'}
                {' · '}stok {product.stock_quantity}
              </p>
            </div>
            <button
              onClick={() => setSelected(selected?.id === product.id ? null : product)}
              className="shrink-0 rounded-lg border border-walnut px-3 py-1.5 text-xs font-medium text-walnut hover:bg-walnut hover:text-white"
            >
              {selected?.id === product.id ? 'Kapat' : 'Seç'}
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <ProductConfigurator
          product={selected}
          onAdd={(extra) => { onAdd(selected, extra); setSelected(null); }}
        />
      )}
    </section>
  );
}

function ProductConfigurator({ product, onAdd }) {
  const custom = product.pricing_type !== 'fixed';
  const needsVariant = Boolean(product.has_sizes || product.has_colors);

  const [width, setWidth] = useState(product.min_width_cm || '');
  const [height, setHeight] = useState(product.min_height_cm || '');
  const [sizeId, setSizeId] = useState('');
  const [colorId, setColorId] = useState('');

  // Beden/renk gerektiren üründe seçenekler ürün detayından gelir.
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['productDetail', product.slug],
    queryFn: () => getProductBySlug(product.slug),
    enabled: needsVariant,
  });

  const sizes = detail?.sizes || [];
  const colors = detail?.colors || [];
  const variants = detail?.variants || [];

  // Ürün yalnızca bedenli ya da yalnızca renkli olabilir; olmayan tarafta varyantın null'ı eşleşir.
  const variant = needsVariant
    ? variants.find((v) =>
      (sizes.length ? v.size_id === sizeId : v.size_id === null)
      && (colors.length ? v.color_id === colorId : v.color_id === null))
    : null;

  const selectedSize = sizes.find((s) => s.id === sizeId);
  const selectedColor = colors.find((c) => c.id === colorId);
  const variantMissing = needsVariant
    && ((sizes.length > 0 && !sizeId) || (colors.length > 0 && !colorId));

  // Ölçüye göre fiyatlanan ürünlerde fiyat backend'den alınır; formül client'ta tekrarlanmaz.
  const { data: priceData, isFetching: pending, error: priceQueryError } = useQuery({
    queryKey: ['productPrice', product.id, width, height],
    queryFn: () => calculateProductPrice(product.id, Number(width), Number(height)),
    enabled: custom && !needsVariant && Boolean(width) && Boolean(height),
    retry: false,
  });

  const priceError = priceQueryError
    ? priceQueryError.response?.data?.message || 'Fiyat hesaplanamadı'
    : '';

  // Backend'deki applyProductDiscount ile aynı formül — yalnızca önizleme içindir,
  // siparişte fiyat her hâlükârda backend tarafından yeniden hesaplanır.
  const discounted = (base) => {
    const value = Number(product.discount_value);
    if (!product.discount_type || !value || value <= 0) return base;
    const result = product.discount_type === 'percentage' ? base * (1 - value / 100) : base - value;
    return Math.max(0, Math.round(result * 100) / 100);
  };

  let unitPrice;
  if (needsVariant) {
    unitPrice = variantMissing
      ? null
      : discounted(Number(selectedSize ? selectedSize.price : product.base_price));
  } else if (custom) {
    unitPrice = priceData ? Number(priceData.price ?? priceData) : null;
  } else {
    unitPrice = Number(product.sale_price || product.base_price);
  }

  const outOfStock = Boolean(variant) && variant.stock_quantity <= 0;
  const ready = needsVariant
    ? Boolean(variant) && !outOfStock && unitPrice != null
    : custom
      ? Boolean(unitPrice) && !pending && !priceError
      : true;

  return (
    <div className="mt-3 rounded-lg border border-terracotta/40 bg-terracotta/5 p-4">
      <p className="text-sm font-medium text-walnut">{product.name}</p>

      {needsVariant && (
        <>
          {detailLoading && <p className="mt-2 text-xs text-coffee">Seçenekler yükleniyor...</p>}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {sizes.length > 0 && (
              <label className="text-xs font-medium text-coffee">
                Beden *
                <select
                  value={sizeId}
                  onChange={(e) => setSizeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name} — {money(discounted(Number(size.price)))}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {colors.length > 0 && (
              <label className="text-xs font-medium text-coffee">
                Renk *
                <select
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>{color.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {!variantMissing && !variant && !detailLoading && (
            <p className="mt-2 text-xs text-red-600">Bu beden ve renk birleşimi mevcut değil.</p>
          )}
          {variant && (
            <p className={outOfStock ? 'mt-2 text-xs text-red-600' : 'mt-2 text-xs text-coffee'}>
              {outOfStock ? 'Bu seçenek stokta yok.' : `Stok: ${variant.stock_quantity}`}
            </p>
          )}
        </>
      )}

      {custom && !needsVariant && (
        <>
          <p className="mt-1 text-xs text-coffee">
            Genişlik {product.min_width_cm}–{product.max_width_cm} cm ·
            Yükseklik {product.min_height_cm}–{product.max_height_cm} cm
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-coffee">
              Genişlik (cm)
              <input
                type="number" value={width} onChange={(e) => setWidth(e.target.value)}
                className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-coffee">
              Yükseklik (cm)
              <input
                type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2 text-sm"
              />
            </label>
          </div>
        </>
      )}

      {priceError && <p className="mt-2 text-xs text-red-600">{priceError}</p>}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-coffee">
          Birim fiyat:{' '}
          <strong className="text-walnut">
            {pending ? '...' : unitPrice ? money(unitPrice) : '—'}
          </strong>
        </span>
        <button
          disabled={!ready}
          onClick={() => onAdd({
            unit_price: unitPrice,
            variant_id: variant ? variant.id : undefined,
            variant_label: [selectedSize?.name, selectedColor?.name].filter(Boolean).join(' · ') || undefined,
            selected_width_cm: custom && !needsVariant ? Number(width) : undefined,
            selected_height_cm: custom && !needsVariant ? Number(height) : undefined,
          })}
          className="flex items-center gap-1.5 rounded-lg bg-walnut px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Sepete ekle
        </button>
      </div>
    </div>
  );
}

/* ---------------- Sepet ---------------- */

function Cart({ lines, maxDiscount, onUpdate, onRemove }) {
  return (
    <section className="rounded-xl border border-light-wood/60 bg-white p-5">
      <h2 className="mb-3 font-semibold text-walnut">2 · Sepet ve satır iskontoları</h2>

      {!lines.length ? (
        <p className="py-6 text-center text-sm text-coffee">Henüz ürün eklenmedi.</p>
      ) : (
        <div className="space-y-3">
          {lines.map((line) => {
            const lineTotal = line.unit_price * line.quantity;
            const net = lineTotal * (1 - (Number(line.line_discount_percent) || 0) / 100);
            return (
              <div key={line.key} className="rounded-lg border border-light-wood/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-walnut">{line.name}</p>
                    <p className="text-xs text-coffee">
                      {money(line.unit_price)}
                      {line.variant_label && ` · ${line.variant_label}`}
                      {line.selected_width_cm && ` · ${line.selected_width_cm}×${line.selected_height_cm} cm`}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(line.key)}
                    aria-label="Satırı kaldır"
                    className="rounded-lg p-1.5 text-coffee hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="text-xs font-medium text-coffee">
                    Adet
                    <input
                      type="number" min="1" value={line.quantity}
                      onChange={(e) => onUpdate(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      className="mt-1 w-20 rounded-lg border border-light-wood px-3 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-coffee">
                    İskonto (%)
                    <input
                      type="number" min="0" max={maxDiscount} step="0.5"
                      value={line.line_discount_percent}
                      onChange={(e) => onUpdate(line.key, {
                        line_discount_percent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                      })}
                      className="mt-1 w-24 rounded-lg border border-light-wood px-3 py-1.5 text-sm"
                    />
                  </label>
                  <div className="ml-auto text-right">
                    {net !== lineTotal && (
                      <p className="text-xs text-coffee line-through">{money(lineTotal)}</p>
                    )}
                    <p className="text-sm font-semibold text-walnut">{money(net)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------------- Özet ve iskonto yetkisi ---------------- */

function Summary({
  totals, maxDiscount, overLimit, commission, commissionRate,
  orderDiscount, setOrderDiscount, waiveShipping, setWaiveShipping, lineCount,
}) {
  const ratio = maxDiscount === 0 ? (totals.effectivePercent > 0 ? 1 : 0) : Math.min(1, totals.effectivePercent / maxDiscount);
  const barColor = overLimit ? 'bg-red-500' : ratio > 0.8 ? 'bg-terracotta' : 'bg-olive';

  return (
    <section className="rounded-xl border border-light-wood/60 bg-white p-5">
      <h2 className="mb-4 font-semibold text-walnut">Özet</h2>

      <label className="block text-xs font-medium text-coffee">
        Sipariş geneli ek iskonto (%)
        <input
          type="number" min="0" max="100" step="0.5" value={orderDiscount}
          onChange={(e) => setOrderDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
          disabled={lineCount === 0}
          className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 flex items-center gap-2 text-sm text-coffee">
        <input
          type="checkbox"
          checked={waiveShipping}
          onChange={(e) => setWaiveShipping(e.target.checked)}
          className="h-4 w-4 rounded border-light-wood"
        />
        Kargo bedelsiz (elden teslim)
      </label>

      <dl className="mt-4 space-y-1.5 border-t border-light-wood/50 pt-4 text-sm">
        <Row label="Liste tutarı" value={money(totals.listSubtotal)} />
        {totals.lineDiscount > 0 && (
          <Row label="Satır iskontoları" value={`− ${money(totals.lineDiscount)}`} accent />
        )}
        {totals.orderDiscount > 0 && (
          <Row label="Genel iskonto" value={`− ${money(totals.orderDiscount)}`} accent />
        )}
        <Row
          label="Kargo"
          value={waiveShipping ? 'Bedelsiz' : 'Sipariş sonrası hesaplanır'}
          muted
        />
        <div className="flex justify-between border-t border-light-wood/50 pt-2 text-base font-bold text-walnut">
          <dt>Ödenecek</dt>
          <dd>{money(totals.finalSubtotal)}</dd>
        </div>
      </dl>

      {/* İskonto yetkisi: backend'in doğruladığı efektif oranın aynısı gösterilir. */}
      <div className="mt-5 rounded-lg bg-cream p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-coffee">Toplam iskonto</span>
          <span className={overLimit ? 'font-bold text-red-600' : 'font-medium text-walnut'}>
            %{totals.effectivePercent} / %{maxDiscount}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-light-wood">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        {overLimit && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            İskonto yetkini aşıyor. Satır veya genel indirimi düşür.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-olive/10 p-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-olive">
          <TrendingDown className="h-3.5 w-3.5" />
          Bu siparişten kazancın (%{commissionRate})
        </span>
        <span className="text-sm font-bold text-walnut">{money(commission)}</span>
      </div>
    </section>
  );
}

function Row({ label, value, accent, muted }) {
  return (
    <div className="flex justify-between">
      <dt className="text-coffee">{label}</dt>
      <dd className={accent ? 'text-terracotta' : muted ? 'text-xs text-coffee' : 'text-walnut'}>{value}</dd>
    </div>
  );
}

/* ---------------- Alıcı bilgileri ---------------- */

function BuyerForm({ buyer, setBuyer }) {
  const [search, setSearch] = useState('');
  const { data: customers = [] } = useQuery({
    queryKey: ['marketerCustomers', search],
    queryFn: () => getMarketerCustomers(search || undefined),
    enabled: search.length >= 2,
  });

  const pick = (customer) => {
    setBuyer({
      buyer_name: customer.full_name,
      buyer_phone: customer.phone,
      buyer_email: customer.email || '',
      shipping_city: customer.city || '',
      shipping_district: customer.district || '',
      shipping_address: customer.address_line || '',
      shipping_apartment: customer.apartment || '',
      customer_note: '',
    });
    setSearch('');
  };

  const set = (patch) => setBuyer({ ...buyer, ...patch });

  return (
    <section className="rounded-xl border border-light-wood/60 bg-white p-5">
      <h2 className="mb-3 font-semibold text-walnut">3 · Alıcı bilgileri</h2>

      <div className="relative mb-4">
        <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kayıtlı müşterilerimde ara (en az 2 harf)"
          className="w-full rounded-lg border border-light-wood py-2.5 pl-9 pr-3 text-sm text-walnut"
        />
        {search.length >= 2 && customers.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-light-wood bg-white shadow-lg">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => pick(customer)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-cream"
              >
                <span className="font-medium text-walnut">{customer.full_name}</span>
                <span className="ml-2 text-xs text-coffee">{customer.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ad soyad *">
          <input value={buyer.buyer_name} onChange={(e) => set({ buyer_name: e.target.value })} />
        </Field>
        <Field label="Telefon * (0XXXXXXXXXX)">
          <input
            value={buyer.buyer_phone}
            onChange={(e) => set({ buyer_phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            placeholder="05551112233"
          />
        </Field>
        <Field label="E-posta *">
          <input type="email" value={buyer.buyer_email} onChange={(e) => set({ buyer_email: e.target.value })} />
        </Field>
        <Field label="Daire / kapı no">
          <input value={buyer.shipping_apartment} onChange={(e) => set({ shipping_apartment: e.target.value })} />
        </Field>
        <Field label="İl *">
          <select
            value={buyer.shipping_city}
            onChange={(e) => set({ shipping_city: e.target.value, shipping_district: '' })}
          >
            <option value="">Seçiniz</option>
            {iller.map((il) => <option key={il} value={il}>{il}</option>)}
          </select>
        </Field>
        <Field label="İlçe">
          <select
            value={buyer.shipping_district}
            onChange={(e) => set({ shipping_district: e.target.value })}
            disabled={!buyer.shipping_city}
          >
            <option value="">Seçiniz</option>
            {getIlceler(buyer.shipping_city).map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Adres * (en az 10 karakter)">
        <textarea rows={2} value={buyer.shipping_address} onChange={(e) => set({ shipping_address: e.target.value })} />
      </Field>
      <Field label="Sipariş notu">
        <textarea rows={2} value={buyer.customer_note} onChange={(e) => set({ customer_note: e.target.value })} />
      </Field>

      <p className="mt-3 text-xs text-coffee">
        Alıcı, müşteri rehberine otomatik kaydedilir.
      </p>
    </section>
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
