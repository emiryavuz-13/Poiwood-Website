import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, Check, ChevronDown, ChevronUp, ClipboardCheck, Image as ImageIcon,
  Loader2, Package, Palette, Pencil, PlusCircle, Ruler, Trash2, X,
} from 'lucide-react';
import { approveProductDraft, getProductApprovals, rejectProductDraft } from '../../api/admin';
import { triggerActionToast } from '../../utils/toast';

const REQUEST_META = {
  create: { label: 'Yeni ürün ekleme', icon: PlusCircle, className: 'bg-olive/10 text-olive' },
  update: { label: 'Ürün güncelleme', icon: Pencil, className: 'bg-terracotta/10 text-terracotta' },
  delete: { label: 'Ürün silme', icon: Trash2, className: 'bg-red-50 text-red-600' },
};

const FIELD_DEFINITIONS = [
  { key: 'name', label: 'Ürün adı' },
  { key: 'slug', label: 'Bağlantı adı' },
  { key: 'description', label: 'Açıklama', multiline: true },
  { key: 'pricing_type', label: 'Fiyatlandırma', format: (value) => ({ fixed: 'Sabit fiyat', per_cm2: 'cm² fiyatı', formula: 'Formül' }[value] || value) },
  { key: 'base_price', label: 'Temel fiyat', format: formatMoney },
  { key: 'price_per_cm2', label: 'cm² fiyatı', format: formatMoney },
  { key: 'stock_quantity', label: 'Ana stok' },
  { key: 'discount_type', label: 'İndirim türü', format: (value) => ({ percentage: 'Yüzde', fixed: 'Sabit tutar' }[value] || value) },
  { key: 'discount_value', label: 'İndirim değeri' },
  { key: 'min_width_cm', label: 'Minimum genişlik', suffix: ' cm' },
  { key: 'max_width_cm', label: 'Maksimum genişlik', suffix: ' cm' },
  { key: 'min_height_cm', label: 'Minimum yükseklik', suffix: ' cm' },
  { key: 'max_height_cm', label: 'Maksimum yükseklik', suffix: ' cm' },
  { key: 'is_active', label: 'Yayında', format: formatBoolean },
  { key: 'is_featured', label: 'Öne çıkan', format: formatBoolean },
  { key: 'is_weekly_pick', label: 'Haftanın seçimi', format: formatBoolean },
];

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return 'Belirtilmedi';
  return `${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}

function formatBoolean(value) {
  return value ? 'Evet' : 'Hayır';
}

function displayValue(field, value) {
  if (field.format) return field.format(value);
  if (value === null || value === undefined || value === '') return 'Belirtilmedi';
  return `${value}${field.suffix || ''}`;
}

function valuesEqual(left, right) {
  if ((left === null || left === undefined || left === '') && (right === null || right === undefined || right === '')) return true;
  return String(left) === String(right);
}

function changedFields(item) {
  if (item.request_type !== 'update') return [];
  const current = item.current_product || {};
  const proposed = item.proposed_product || {};
  const fields = FIELD_DEFINITIONS.filter((field) => !valuesEqual(current[field.key], proposed[field.key]));
  if (item.current_category_name !== item.proposed_category_name) {
    fields.splice(2, 0, { key: 'category', label: 'Kategori' });
  }
  return fields;
}

function changeSummary(item, fields) {
  if (item.request_type !== 'update') return [];
  const summary = fields.map((field) => field.label);
  const currentPhotos = (item.current_images || []).map((image) => image.firebase_url).sort();
  const proposedPhotos = (item.proposed_images || []).map((image) => image.firebase_url).sort();
  if (JSON.stringify(currentPhotos) !== JSON.stringify(proposedPhotos)) summary.push('Fotoğraflar');
  const currentOptions = optionSnapshot(item.current_sizes, item.current_colors, item.current_variants);
  const proposedOptions = optionSnapshot(item.proposed_sizes, item.proposed_colors, item.proposed_variants);
  if (JSON.stringify(currentOptions) !== JSON.stringify(proposedOptions)) summary.push('Beden, renk veya stok');
  return summary;
}

export default function ProductApprovals() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState('');
  const { data = [], isLoading } = useQuery({ queryKey: ['productApprovals'], queryFn: getProductApprovals });

  const approve = useMutation({
    mutationFn: (item) => approveProductDraft(item.product_id),
    onSuccess: async (result, item) => {
      await queryClient.invalidateQueries({ queryKey: ['productApprovals'] });
      setPreview('');
      triggerActionToast({
        type: 'success',
        title: result.deleted ? 'Silme talebi onaylandı' : 'Ürün talebi onaylandı',
        message: `“${item.name}” için işlem başarıyla tamamlandı.`,
      });
    },
    onError: (error) => triggerActionToast({ type: 'error', title: 'Talep onaylanamadı', message: error?.response?.data?.message || 'Lütfen tekrar deneyin.' }),
  });

  const reject = useMutation({
    mutationFn: ({ item, reason }) => rejectProductDraft(item.product_id, reason),
    onSuccess: async (_result, { item }) => {
      await queryClient.invalidateQueries({ queryKey: ['productApprovals'] });
      setPreview('');
      triggerActionToast({ type: 'success', title: 'Talep reddedildi', message: `Ret nedeni “${item.name}” ürününün marka yöneticisine iletilecek.` });
    },
    onError: (error) => triggerActionToast({ type: 'error', title: 'Talep reddedilemedi', message: error?.response?.data?.message || 'Lütfen tekrar deneyin.' }),
  });

  const rejectWithReason = (item) => {
    const reason = window.prompt('Ret nedenini marka yetkilisine iletin:');
    if (reason?.trim().length >= 3) reject.mutate({ item, reason: reason.trim() });
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-bold text-walnut">Ürün onayları</h1>
        <p className="text-sm text-coffee">Yeni ürünleri ve mevcut ürünlerde talep edilen tüm değişiklikleri ayrıntılı inceleyin.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-white" />)}</div>
      ) : !data.length ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-coffee">
          <ClipboardCheck className="mx-auto mb-2 h-9 w-9 text-light-wood" />
          Onay bekleyen ürün yok.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const meta = REQUEST_META[item.request_type] || REQUEST_META.update;
            const RequestIcon = meta.icon;
            const open = preview === item.product_id;
            const changes = changedFields(item);
            const summary = changeSummary(item, changes);
            return (
              <article key={item.product_id} className="overflow-hidden rounded-xl border border-light-wood/60 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.className}`}><RequestIcon className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-walnut">{item.proposed_product?.name || item.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-coffee">
                        <span>{item.brand_name}</span>
                        <span className={`rounded-md px-2 py-0.5 font-medium ${meta.className}`}>{meta.label}</span>
                        {item.request_type === 'update' && (
                          <span>{summary.length ? `${summary.slice(0, 2).join(', ')}${summary.length > 2 ? ` +${summary.length - 2}` : ''}` : 'İçerik değişikliği yok'}</span>
                        )}
                        {item.submitted_at && <span>{new Date(item.submitted_at).toLocaleString('tr-TR')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setPreview(open ? '' : item.product_id)} className="flex items-center gap-1 rounded-lg border border-light-wood px-3 py-2 text-xs font-medium text-walnut hover:bg-cream">
                      {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}{open ? 'Kapat' : 'Detayları incele'}
                    </button>
                    <button disabled={approve.isPending || reject.isPending} onClick={() => approve.mutate(item)} className="flex items-center gap-1 rounded-lg bg-olive px-3 py-2 text-xs font-medium text-white disabled:opacity-50">
                      {approve.isPending && approve.variables?.product_id === item.product_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}Onayla
                    </button>
                    <button disabled={approve.isPending || reject.isPending} onClick={() => rejectWithReason(item)} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"><X className="h-3.5 w-3.5" />Reddet</button>
                  </div>
                </div>
                {open && <ApprovalPreview item={item} changes={changes} />}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApprovalPreview({ item, changes }) {
  const proposed = item.proposed_product || {};
  const current = item.current_product || {};
  return (
    <div className="border-t border-light-wood/60 bg-cream/35 p-4 sm:p-5">
      {item.request_type === 'create' && <InfoBanner icon={PlusCircle} title="Yeni ürün talebi" text="Bu ürün henüz mağazada yayınlanmadı. Aşağıdaki bilgiler ilk kez eklenecek." />}
      {item.request_type === 'delete' && <InfoBanner icon={Trash2} title="Silme talebi" text="Onaylandığında ürün, fotoğrafları ve seçenekleri mağazadan kaldırılacak." danger />}

      <section className="mt-5 first:mt-0">
        <SectionTitle icon={Package} title={item.request_type === 'update' ? 'Değiştirilen ürün bilgileri' : 'Ürün bilgileri'} />
        {item.request_type === 'update' ? (
          changes.length ? <div className="space-y-2">{changes.map((field) => {
            const oldValue = field.key === 'category' ? item.current_category_name : current[field.key];
            const newValue = field.key === 'category' ? item.proposed_category_name : proposed[field.key];
            return <ChangeRow key={field.key} field={field} oldValue={oldValue} newValue={newValue} />;
          })}</div> : <p className="rounded-lg bg-white p-3 text-sm text-coffee">Temel ürün bilgilerinde değişiklik yok. Fotoğraf veya seçenek değişikliklerini aşağıda inceleyin.</p>
        ) : (
          <ProductDetails product={proposed} categoryName={item.proposed_category_name} />
        )}
      </section>

      <PhotoComparison item={item} />
      <OptionComparison item={item} />
    </div>
  );
}

function InfoBanner(props) {
  const Icon = props.icon;
  const danger = props.danger || false;
  return <div className={`flex gap-3 rounded-xl border p-4 ${danger ? 'border-red-200 bg-red-50' : 'border-terracotta/20 bg-white'}`}><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${danger ? 'text-red-600' : 'text-terracotta'}`} /><div><p className="text-sm font-semibold text-walnut">{props.title}</p><p className="mt-0.5 text-xs leading-5 text-coffee">{props.text}</p></div></div>;
}

function SectionTitle(props) {
  const Icon = props.icon;
  return <div className="mb-3 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-walnut"><Icon className="h-4 w-4 text-terracotta" />{props.title}</h3>{props.detail && <span className="text-xs text-coffee">{props.detail}</span>}</div>;
}

function ProductDetails({ product, categoryName }) {
  const fields = FIELD_DEFINITIONS.filter((field) => !['description'].includes(field.key) && product[field.key] !== null && product[field.key] !== undefined);
  return <div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"><DetailCell label="Kategori" value={categoryName || 'Belirtilmedi'} />{fields.map((field) => <DetailCell key={field.key} label={field.label} value={displayValue(field, product[field.key])} />)}</div><div className="mt-2 rounded-lg bg-white p-3"><p className="text-xs font-medium text-coffee">Açıklama</p><p className="mt-1 whitespace-pre-wrap text-sm text-walnut">{product.description || 'Açıklama yok.'}</p></div></div>;
}

function DetailCell({ label, value }) {
  return <div className="rounded-lg bg-white p-3"><p className="text-xs text-coffee">{label}</p><p className="mt-1 break-words text-sm font-medium text-walnut">{value}</p></div>;
}

function ChangeRow({ field, oldValue, newValue }) {
  return <div className={`grid gap-2 rounded-lg bg-white p-3 ${field.multiline ? '' : 'sm:grid-cols-[150px_1fr_auto_1fr] sm:items-center'}`}><p className="text-xs font-semibold text-coffee">{field.label}</p><div className="min-w-0 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 line-through decoration-red-300">{displayValue(field, oldValue)}</div><ArrowRight className="hidden h-4 w-4 text-terracotta sm:block" /><div className="min-w-0 rounded-md bg-olive/10 px-3 py-2 text-sm font-medium text-walnut">{displayValue(field, newValue)}</div></div>;
}

function PhotoComparison({ item }) {
  const current = item.current_images || [];
  const proposed = item.proposed_images || [];
  const currentUrls = new Set(current.map((image) => image.firebase_url));
  const proposedUrls = new Set(proposed.map((image) => image.firebase_url));
  const removed = item.request_type === 'update' ? current.filter((image) => !proposedUrls.has(image.firebase_url)) : [];
  return <section className="mt-6"><SectionTitle icon={ImageIcon} title="Fotoğraflar" detail={`${proposed.length} fotoğraf`} />{!proposed.length ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Talepte fotoğraf bulunmuyor.</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{proposed.map((image, index) => { const isNew = item.request_type === 'create' || !currentUrls.has(image.firebase_url); return <a key={image.id || image.firebase_url} href={image.firebase_url} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-lg border border-light-wood bg-white"><img src={image.thumbnail_url || image.firebase_url} alt={`${item.name} fotoğrafı ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />{image.is_primary && <span className="absolute bottom-2 left-2 rounded-md bg-walnut/90 px-2 py-1 text-[10px] text-white">Ana fotoğraf</span>}{isNew && <span className="absolute right-2 top-2 rounded-md bg-olive px-2 py-1 text-[10px] font-medium text-white">Yeni</span>}</a>; })}</div>}{removed.length > 0 && <div className="mt-3"><p className="mb-2 text-xs font-semibold text-red-600">Kaldırılacak fotoğraflar</p><div className="flex flex-wrap gap-2">{removed.map((image) => <img key={image.id || image.firebase_url} src={image.thumbnail_url || image.firebase_url} alt="Kaldırılacak ürün fotoğrafı" className="h-20 w-20 rounded-lg border border-red-200 object-cover opacity-60" />)}</div></div>}</section>;
}

function OptionComparison({ item }) {
  const proposed = optionSnapshot(item.proposed_sizes, item.proposed_colors, item.proposed_variants);
  const current = optionSnapshot(item.current_sizes, item.current_colors, item.current_variants);
  const changed = JSON.stringify(current) !== JSON.stringify(proposed);
  return <section className="mt-6"><SectionTitle icon={Ruler} title="Beden, renk ve varyant stokları" detail={`${proposed.variants.length} varyant`} />{item.request_type === 'update' && changed && <div className="mb-3 grid gap-3 lg:grid-cols-2"><OptionPanel title="Mevcut seçenekler" snapshot={current} muted /><OptionPanel title="Onay sonrası" snapshot={proposed} /></div>}{(item.request_type !== 'update' || !changed) && <OptionPanel title={changed ? 'Eklenecek seçenekler' : 'Seçenekler'} snapshot={proposed} />}{item.request_type === 'update' && !changed && <p className="mt-2 text-xs text-coffee">Beden, renk ve varyant stoklarında değişiklik yok.</p>}</section>;
}

function optionSnapshot(sizes = [], colors = [], variants = []) {
  const normalizedSizes = sizes.map((size) => ({ id: size.client_id || size.id, name: size.name, price: Number(size.price || 0) }));
  const normalizedColors = colors.map((color) => ({ id: color.client_id || color.id, name: color.name, hex: color.hex_code, isDefault: !!color.is_default }));
  const normalizedVariants = variants.map((variant) => {
    const sizeId = variant.size_client_id || variant.size_id;
    const colorId = variant.color_client_id || variant.color_id;
    return { size: normalizedSizes.find((size) => size.id === sizeId)?.name || null, color: normalizedColors.find((color) => color.id === colorId)?.name || null, stock: Number(variant.stock_quantity || 0) };
  });
  return { sizes: normalizedSizes, colors: normalizedColors, variants: normalizedVariants };
}

function OptionPanel({ title, snapshot, muted = false }) {
  return <div className={`rounded-xl border p-4 ${muted ? 'border-light-wood bg-white/60' : 'border-terracotta/20 bg-white'}`}><p className="mb-3 text-xs font-semibold text-coffee">{title}</p>{!snapshot.sizes.length && !snapshot.colors.length && !snapshot.variants.length ? <p className="text-sm text-coffee">Seçenek tanımlanmamış.</p> : <div className="space-y-4">{snapshot.sizes.length > 0 && <div><p className="mb-2 flex items-center gap-1 text-xs font-medium text-coffee"><Ruler className="h-3.5 w-3.5" />Bedenler</p><div className="flex flex-wrap gap-2">{snapshot.sizes.map((size) => <span key={size.id} className="rounded-md bg-cream px-2.5 py-1.5 text-xs text-walnut">{size.name}: {formatMoney(size.price)}</span>)}</div></div>}{snapshot.colors.length > 0 && <div><p className="mb-2 flex items-center gap-1 text-xs font-medium text-coffee"><Palette className="h-3.5 w-3.5" />Renkler</p><div className="flex flex-wrap gap-2">{snapshot.colors.map((color) => <span key={color.id} className="flex items-center gap-1.5 rounded-md bg-cream px-2.5 py-1.5 text-xs text-walnut"><span className={`h-3.5 w-3.5 rounded-full border border-walnut/10 ${color.hex ? '' : 'bg-light-wood'}`} style={color.hex ? { backgroundColor: color.hex } : undefined} />{color.name}{color.isDefault ? ' (varsayılan)' : ''}</span>)}</div></div>}{snapshot.variants.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-coffee"><th className="pb-2 font-medium">Beden</th><th className="pb-2 font-medium">Renk</th><th className="pb-2 text-right font-medium">Stok</th></tr></thead><tbody>{snapshot.variants.map((variant, index) => <tr key={`${variant.size}-${variant.color}-${index}`} className="border-t border-light-wood/50 text-walnut"><td className="py-2">{variant.size || 'Tek beden'}</td><td className="py-2">{variant.color || 'Tek renk'}</td><td className="py-2 text-right font-semibold">{variant.stock}</td></tr>)}</tbody></table></div>}</div>}</div>;
}
