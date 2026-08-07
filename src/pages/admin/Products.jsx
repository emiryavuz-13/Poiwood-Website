import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Edit3, Trash2, Save, Loader2, Package, Image as ImageIcon,
  Star, Upload, Crown, Search, ChevronLeft,
} from 'lucide-react';
import { getAllCategories } from '../../api/categories';
import { createProduct } from '../../api/products';
import {
  getAdminProducts, getAdminProductDetail, updateProduct, deleteProduct,
  addProductImage, setProductPrimaryImage, removeProductImage, saveProductVariants,
} from '../../api/admin';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { optimizeImage } from '../../utils/imageOptimizer';

const toSlug = (str) =>
  str.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const emptyForm = {
  name: '', slug: '', description: '', category_id: '',
  pricing_type: 'fixed', base_price: '', price_per_cm2: '',
  min_width_cm: '', max_width_cm: '', min_height_cm: '', max_height_cm: '',
  stock_quantity: '0', is_featured: false, is_weekly_pick: false, is_active: true,
  discount_type: '', discount_value: '',
};

export default function Products() {
  const queryClient = useQueryClient();
  const [view, setView] = useState('list'); // list | create | edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [page, setPage] = useState(1);

  // Data
  const { data: categoriesRaw = [] } = useQuery({ queryKey: ['categories'], queryFn: getAllCategories });
  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', searchQuery, filterCategory, filterStock, page],
    queryFn: () => getAdminProducts({
      search: searchQuery || undefined,
      category_id: filterCategory || undefined,
      stock: filterStock || undefined,
      page,
      limit: 15,
    }),
  });

  const products = data?.products || [];
  const total = data?.total || 0;

  // Flatten categories
  const flatCategories = [];
  const flatten = (cats, depth = 0) => {
    (cats || []).forEach((cat) => {
      flatCategories.push({ ...cat, depth });
      if (cat.children) flatten(cat.children, depth + 1);
    });
  };
  flatten(categoriesRaw);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      // Switch to edit mode to add images
      const product = res.data;
      setEditingId(product.id);
      setView('edit');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProductDetail', editingId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminProducts'] }),
  });


  const handleSubmitCreate = () => {
    const data = {
      name: form.name,
      slug: form.slug || toSlug(form.name),
      description: form.description || undefined,
      category_id: form.category_id,
      pricing_type: form.pricing_type,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_featured: form.is_featured,
      is_weekly_pick: form.is_weekly_pick,
      is_active: form.is_active,
    };
    if (form.pricing_type === 'fixed') {
      data.base_price = parseFloat(form.base_price) || 0;
    } else {
      data.price_per_cm2 = parseFloat(form.price_per_cm2) || 0;
      if (form.min_width_cm) data.min_width_cm = parseFloat(form.min_width_cm);
      if (form.max_width_cm) data.max_width_cm = parseFloat(form.max_width_cm);
      if (form.min_height_cm) data.min_height_cm = parseFloat(form.min_height_cm);
      if (form.max_height_cm) data.max_height_cm = parseFloat(form.max_height_cm);
      // Min ölçülerden başlangıç fiyatı hesapla
      const minW = parseFloat(form.min_width_cm) || 0;
      const minH = parseFloat(form.min_height_cm) || 0;
      data.base_price = parseFloat((minW * minH * (parseFloat(form.price_per_cm2) || 0)).toFixed(2));
    }
    // İndirim — her zaman gönder
    data.discount_type = form.discount_type || null;
    data.discount_value = form.discount_value ? parseFloat(form.discount_value) : null;
    createMutation.mutate(data);
  };

  const handleSubmitEdit = () => {
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      category_id: form.category_id,
      pricing_type: form.pricing_type,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_featured: form.is_featured,
      is_weekly_pick: form.is_weekly_pick,
      is_active: form.is_active,
    };
    if (form.pricing_type === 'fixed') {
      data.base_price = parseFloat(form.base_price) || 0;
    } else {
      data.price_per_cm2 = parseFloat(form.price_per_cm2) || 0;
      if (form.min_width_cm) data.min_width_cm = parseFloat(form.min_width_cm);
      if (form.max_width_cm) data.max_width_cm = parseFloat(form.max_width_cm);
      if (form.min_height_cm) data.min_height_cm = parseFloat(form.min_height_cm);
      if (form.max_height_cm) data.max_height_cm = parseFloat(form.max_height_cm);
      const minW = parseFloat(form.min_width_cm) || 0;
      const minH = parseFloat(form.min_height_cm) || 0;
      data.base_price = parseFloat((minW * minH * (parseFloat(form.price_per_cm2) || 0)).toFixed(2));
    }
    // İndirim — her zaman gönder
    data.discount_type = form.discount_type || null;
    data.discount_value = form.discount_value ? parseFloat(form.discount_value) : null;
    updateMutation.mutate({ id: editingId, data });
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      category_id: product.category_id || '',
      pricing_type: product.pricing_type || 'fixed',
      base_price: product.base_price || '',
      price_per_cm2: product.price_per_cm2 || '',
      min_width_cm: product.min_width_cm || '',
      max_width_cm: product.max_width_cm || '',
      min_height_cm: product.min_height_cm || '',
      max_height_cm: product.max_height_cm || '',
      stock_quantity: product.stock_quantity ?? '0',
      is_featured: product.is_featured || false,
      is_weekly_pick: product.is_weekly_pick || false,
      is_active: product.is_active !== false,
      discount_type: product.discount_type || '',
      discount_value: product.discount_value || '',
    });
    setView('edit');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  const goToList = () => {
    setView('list');
    setEditingId(null);
    setForm(emptyForm);
  };

  // =============== LIST VIEW ===============
  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#3D2914]">Ürün Yönetimi</h1>
            <p className="text-sm text-[#8B5A2B] mt-0.5">
              Ürünleri görüntüleyin, düzenleyin ve fotoğraf ekleyin. ({total} ürün)
            </p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setView('create'); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C67D4A] text-white text-sm font-medium hover:bg-[#C67D4A]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Yeni Ürün
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5A2B]/50" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Ürün ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8D5C4]/50 text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-white border border-[#E8D5C4]/50 text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
          >
            <option value="">Tüm Kategoriler</option>
            {flatCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {'—'.repeat(cat.depth)} {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filterStock}
            onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-white border border-[#E8D5C4]/50 text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
          >
            <option value="">Tüm Stok</option>
            <option value="in">Stokta Var</option>
            <option value="out">Stokta Yok</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-[#E8D5C4]/30 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
            <p className="text-[#8B5A2B]">Ürün bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-[#E8D5C4]/50 p-3 sm:p-4 hover:bg-[#FAF6F0]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Image */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
                      {product.primary_image ? (
                        <img src={product.primary_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#E8D5C4]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#3D2914] line-clamp-1">{product.name}</p>
                        {product.is_featured && <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#8B5A2B]">{product.category_name || '—'}</span>
                        <span className="text-xs font-semibold text-[#C67D4A]">
                          {product.pricing_type === 'fixed' ? (
                            product.sale_price && Number(product.sale_price) < Number(product.base_price) ? (
                              <>
                                <span className="line-through text-[#8B5A2B]/50 font-normal mr-1">₺{Number(product.base_price).toLocaleString('tr-TR')}</span>
                                ₺{Number(product.sale_price).toLocaleString('tr-TR')}
                              </>
                            ) : (
                              `₺${Number(product.base_price || 0).toLocaleString('tr-TR')}`
                            )
                          ) : (
                            `₺${product.price_per_cm2}/cm²`
                          )}
                        </span>
                        {product.discount_type && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                            {product.discount_type === 'percentage' ? `%${product.discount_value}` : `₺${product.discount_value}`} İndirim
                          </span>
                        )}
                        <span className={`text-xs ${product.stock_quantity <= 0 ? 'text-red-500 font-semibold' : 'text-[#8B5A2B]'}`}>
                          Stok: {product.stock_quantity}
                        </span>
                        <span className="text-xs text-[#8B5A2B] flex items-center gap-0.5">
                          <ImageIcon className="w-3 h-3" />{product.image_count || 0}
                        </span>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {product.is_active ? (
                        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Aktif</span>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Pasif</span>
                      )}
                      <button onClick={() => startEdit(product)} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30 hover:text-[#C67D4A]">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 15 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40">
                  Önceki
                </button>
                <span className="px-4 py-2 text-sm text-[#8B5A2B]">Sayfa {page} / {Math.ceil(total / 15)}</span>
                <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40">
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // =============== CREATE / EDIT VIEW ===============
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goToList} className="p-2 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#3D2914]">
            {view === 'create' ? 'Yeni Ürün Oluştur' : 'Ürünü Düzenle'}
          </h1>
          <p className="text-sm text-[#8B5A2B] mt-0.5">
            {view === 'create' ? 'Ürünü oluşturduktan sonra fotoğraf ekleyebilirsiniz.' : 'Ürün bilgilerini güncelleyin ve fotoğraf yönetin.'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <ProductForm
            form={form}
            setForm={setForm}
            flatCategories={flatCategories}
          />

          {view === 'edit' && editingId && form.pricing_type === 'fixed' && (
            <ProductVariants productId={editingId} />
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={goToList} className="px-4 py-2 text-sm text-[#8B5A2B] hover:bg-[#E8D5C4]/20 rounded-lg">
              İptal
            </button>
            <button
              onClick={view === 'create' ? handleSubmitCreate : handleSubmitEdit}
              disabled={!form.name || !form.category_id || (view === 'create' ? createMutation.isPending : updateMutation.isPending)}
              className="px-6 py-2 text-sm bg-[#4A5D23] text-white font-medium rounded-lg hover:bg-[#4A5D23]/90 disabled:opacity-40 flex items-center gap-1.5"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {view === 'create' ? 'Ürünü Oluştur' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-xs text-red-500">
              {(createMutation.error || updateMutation.error)?.response?.data?.message || 'Hata oluştu'}
            </p>
          )}
          {updateMutation.isSuccess && (
            <p className="text-xs text-green-600">Değişiklikler kaydedildi.</p>
          )}
        </div>

        {/* Right: Images (only in edit mode) */}
        <div className="lg:col-span-1">
          {view === 'edit' && editingId ? (
            <ProductImages productId={editingId} productSlug={form.slug} />
          ) : (
            <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-6 text-center">
              <ImageIcon className="w-10 h-10 text-[#E8D5C4] mx-auto mb-2" />
              <p className="text-sm text-[#8B5A2B]">Fotoğraf eklemek için önce ürünü oluşturun.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ÜRÜN FORMU
   ============================================================ */
const ProductForm = ({ form, setForm, flatCategories }) => {
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-4">
      {/* Genel Bilgiler */}
      <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5">
        <h3 className="text-sm font-bold text-[#3D2914] mb-3">Genel Bilgiler</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8B5A2B] mb-1">Ürün Adı *</label>
            <input
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                set('slug', toSlug(e.target.value));
              }}
              placeholder="Ahşap Yemek Masası"
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B5A2B] mb-1">URL Slug</label>
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="ahsap-yemek-masasi"
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] font-mono focus:outline-none focus:border-[#C67D4A]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#8B5A2B] mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Ürün detaylarını yazın..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B5A2B] mb-1">Kategori *</label>
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] bg-white focus:outline-none focus:border-[#C67D4A]"
            >
              <option value="">Kategori seçin</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8B5A2B] mb-1">Stok Miktarı</label>
            <input
              type="number"
              value={form.stock_quantity}
              onChange={(e) => set('stock_quantity', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
          </div>
        </div>
      </div>

      {/* Fiyatlandırma */}
      <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5">
        <h3 className="text-sm font-bold text-[#3D2914] mb-3">Fiyatlandırma</h3>
        <div className="flex gap-3 mb-3">
          <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${form.pricing_type === 'fixed' ? 'border-[#C67D4A] bg-[#C67D4A]/5' : 'border-[#E8D5C4]'}`}>
            <input type="radio" checked={form.pricing_type === 'fixed'} onChange={() => set('pricing_type', 'fixed')} className="accent-[#C67D4A]" />
            <div>
              <p className="text-sm font-medium text-[#3D2914]">Sabit Fiyat</p>
              <p className="text-xs text-[#8B5A2B]">Hazır ürünler</p>
            </div>
          </label>
          <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${form.pricing_type === 'per_cm2' ? 'border-[#C67D4A] bg-[#C67D4A]/5' : 'border-[#E8D5C4]'}`}>
            <input type="radio" checked={form.pricing_type === 'per_cm2'} onChange={() => set('pricing_type', 'per_cm2')} className="accent-[#C67D4A]" />
            <div>
              <p className="text-sm font-medium text-[#3D2914]">cm² Fiyat</p>
              <p className="text-xs text-[#8B5A2B]">Özel üretim</p>
            </div>
          </label>
        </div>

        {form.pricing_type === 'fixed' ? (
          <div>
            <label className="block text-xs text-[#8B5A2B] mb-1">Fiyat (₺) *</label>
            <input
              type="number"
              step="0.01"
              value={form.base_price}
              onChange={(e) => set('base_price', e.target.value)}
              placeholder="499.90"
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">cm² Başına Fiyat (₺) *</label>
              <input
                type="number"
                step="0.001"
                value={form.price_per_cm2}
                onChange={(e) => set('price_per_cm2', e.target.value)}
                placeholder="0.05"
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8B5A2B] mb-1">Min Genişlik (cm)</label>
                <input type="number" value={form.min_width_cm} onChange={(e) => set('min_width_cm', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8B5A2B] mb-1">Max Genişlik (cm)</label>
                <input type="number" value={form.max_width_cm} onChange={(e) => set('max_width_cm', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8B5A2B] mb-1">Min Yükseklik (cm)</label>
                <input type="number" value={form.min_height_cm} onChange={(e) => set('min_height_cm', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8B5A2B] mb-1">Max Yükseklik (cm)</label>
                <input type="number" value={form.max_height_cm} onChange={(e) => set('max_height_cm', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]" />
              </div>
            </div>
            {/* Otomatik hesaplanan başlangıç fiyatı */}
            {(() => {
              const minW = parseFloat(form.min_width_cm) || 0;
              const minH = parseFloat(form.min_height_cm) || 0;
              const ppcm2 = parseFloat(form.price_per_cm2) || 0;
              const calculatedPrice = (minW * minH * ppcm2).toFixed(2);
              return (
                <div className="bg-[#FAF6F0] rounded-lg p-3 border border-[#E8D5C4]/50">
                  <label className="block text-xs text-[#8B5A2B] mb-1">Başlangıç Fiyatı (₺) — otomatik hesaplanır</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={minW && minH && ppcm2 ? `₺${Number(calculatedPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
                      className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm font-bold text-[#3D2914] bg-white/60 cursor-not-allowed"
                    />
                  </div>
                  {minW > 0 && minH > 0 && ppcm2 > 0 && (
                    <p className="text-[10px] text-[#8B5A2B] mt-1">
                      {minW} cm × {minH} cm × ₺{ppcm2} = ₺{Number(calculatedPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* İndirim */}
      <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5">
        <h3 className="text-sm font-bold text-[#3D2914] mb-3">İndirim</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8B5A2B] mb-1">İndirim Türü</label>
            <select
              value={form.discount_type}
              onChange={(e) => {
                set('discount_type', e.target.value);
                if (!e.target.value) set('discount_value', '');
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] bg-white focus:outline-none focus:border-[#C67D4A]"
            >
              <option value="">İndirim Yok</option>
              <option value="percentage">Yüzdesel (%)</option>
              <option value="fixed">Sabit Tutar (₺)</option>
            </select>
          </div>
          {form.discount_type && (
            <div>
              <label className="block text-xs text-[#8B5A2B] mb-1">
                {form.discount_type === 'percentage' ? 'İndirim Oranı (%)' : 'İndirim Tutarı (₺)'}
              </label>
              <input
                type="number"
                step={form.discount_type === 'percentage' ? '1' : '0.01'}
                min="0"
                max={form.discount_type === 'percentage' ? '99' : undefined}
                value={form.discount_value}
                onChange={(e) => set('discount_value', e.target.value)}
                placeholder={form.discount_type === 'percentage' ? '20' : '50.00'}
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
          )}
        </div>
        {/* İndirimli fiyat önizleme */}
        {form.discount_type && form.discount_value && form.base_price && (() => {
          const base = parseFloat(form.base_price) || 0;
          const val = parseFloat(form.discount_value) || 0;
          const sale = form.discount_type === 'percentage'
            ? Math.round(base * (1 - val / 100) * 100) / 100
            : Math.max(0, Math.round((base - val) * 100) / 100);
          return (
            <div className="mt-3 bg-[#FAF6F0] rounded-lg p-3 border border-[#E8D5C4]/50">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-xs text-[#8B5A2B]">Normal Fiyat:</span>
                  <span className="text-sm text-[#8B5A2B]/60 line-through ml-1">₺{base.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-xs text-[#8B5A2B]">İndirimli:</span>
                  <span className="text-sm font-bold text-[#4A5D23] ml-1">₺{sale.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Seçenekler */}
      <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5">
        <h3 className="text-sm font-bold text-[#3D2914] mb-4">Seçenekler</h3>
        <div className="space-y-3">
          {/* Aktif toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3D2914]">Ürün Durumu</p>
              <p className="text-xs text-[#8B5A2B]">{form.is_active ? 'Ürün sitede görünüyor' : 'Ürün sitede gizli'}</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#4A5D23]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="border-t border-[#E8D5C4]/30" />
          {/* Öne Çıkan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3D2914]">Öne Çıkan</p>
              <p className="text-xs text-[#8B5A2B]">Ana sayfada öne çıkan ürünlerde göster</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_featured', !form.is_featured)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-[#C67D4A]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="border-t border-[#E8D5C4]/30" />
          {/* Haftanın Seçkisi */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3D2914]">Haftanın Seçkisi</p>
              <p className="text-xs text-[#8B5A2B]">Haftanın seçkisi bölümünde göster</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_weekly_pick', !form.is_weekly_pick)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_weekly_pick ? 'bg-[#C67D4A]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_weekly_pick ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   VARYANTLAR (BEDEN / RENK)
   ============================================================ */
const PRESET_COLORS = [
  { name: 'Kırmızı', hex: '#DC2626' },
  { name: 'Mavi', hex: '#2563EB' },
  { name: 'Siyah', hex: '#1F2937' },
  { name: 'Beyaz', hex: '#F9FAFB' },
  { name: 'Ceviz', hex: '#5C3A21' },
  { name: 'Meşe', hex: '#B8860B' },
  { name: 'Yeşil', hex: '#16A34A' },
  { name: 'Sarı', hex: '#EAB308' },
  { name: 'Gri', hex: '#6B7280' },
  { name: 'Bej', hex: '#D9C7A3' },
  { name: 'Antrasit', hex: '#374151' },
  { name: 'Natürel', hex: '#C9A876' },
];

const genClientId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const ProductVariants = ({ productId }) => {
  const { data: product, isLoading } = useQuery({
    queryKey: ['adminProductDetail', productId],
    queryFn: () => getAdminProductDetail(productId),
  });

  if (isLoading || !product) {
    return (
      <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5">
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#C67D4A]" /></div>
      </div>
    );
  }

  // key={productId}: farklı bir ürün düzenlenmeye başlanınca state sıfırdan kurulsun.
  // Kaydetme sonrası senkronizasyon useEffect yerine mutation'ın onSuccess'inde yapılır (aşağıda).
  return <VariantEditor key={productId} productId={productId} initialProduct={product} />;
};

const mapSizesFromServer = (sizes) => (sizes || []).map((s) => ({
  client_id: s.id, id: s.id, name: s.name, price: s.price, display_order: s.display_order,
}));
const mapColorsFromServer = (colors) => (colors || []).map((c) => ({
  client_id: c.id, id: c.id, name: c.name, hex_code: c.hex_code, is_default: c.is_default, display_order: c.display_order,
}));
const mapStockFromServer = (variants) => {
  const map = {};
  (variants || []).forEach((v) => { map[`${v.size_id || 'none'}|${v.color_id || 'none'}`] = v.stock_quantity; });
  return map;
};

const VariantEditor = ({ productId, initialProduct }) => {
  const queryClient = useQueryClient();
  const [sizes, setSizes] = useState(() => mapSizesFromServer(initialProduct.sizes));
  const [colors, setColors] = useState(() => mapColorsFromServer(initialProduct.colors));
  const [stockMap, setStockMap] = useState(() => mapStockFromServer(initialProduct.variants));
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#8B5A2B');

  const addSize = () => setSizes((s) => [...s, { client_id: genClientId(), id: null, name: '', price: '', display_order: s.length }]);
  const updateSize = (clientId, field, value) => setSizes((s) => s.map((sz) => (sz.client_id === clientId ? { ...sz, [field]: value } : sz)));
  const removeSize = (clientId) => {
    setSizes((s) => s.filter((sz) => sz.client_id !== clientId));
    setStockMap((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !k.startsWith(`${clientId}|`))));
  };

  const addColorFromPreset = (preset) => {
    if (colors.some((c) => c.name === preset.name)) return;
    setColors((c) => [...c, { client_id: genClientId(), id: null, name: preset.name, hex_code: preset.hex, is_default: c.length === 0, display_order: c.length }]);
  };
  const addCustomColor = () => {
    if (!customColorName.trim()) return;
    setColors((c) => [...c, { client_id: genClientId(), id: null, name: customColorName.trim(), hex_code: customColorHex, is_default: c.length === 0, display_order: c.length }]);
    setCustomColorName('');
  };
  const removeColor = (clientId) => {
    setColors((c) => {
      const next = c.filter((cl) => cl.client_id !== clientId);
      if (next.length && !next.some((cl) => cl.is_default)) next[0] = { ...next[0], is_default: true };
      return next;
    });
    setStockMap((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !k.endsWith(`|${clientId}`))));
  };
  const setDefaultColor = (clientId) => setColors((c) => c.map((cl) => ({ ...cl, is_default: cl.client_id === clientId })));

  const stockKey = (sizeId, colorId) => `${sizeId || 'none'}|${colorId || 'none'}`;
  const getStock = (sizeId, colorId) => stockMap[stockKey(sizeId, colorId)] ?? 0;
  const setStock = (sizeId, colorId, value) => setStockMap((m) => ({ ...m, [stockKey(sizeId, colorId)]: value }));

  const saveMutation = useMutation({
    mutationFn: (data) => saveProductVariants(productId, data),
    onSuccess: (result) => {
      // Sunucudan dönen gerçek id'lerle senkronize et — yoksa yeni eklenen bir satır
      // ikinci kaydetmede tekrar INSERT edilip yinelenen bir varyant satırı oluşturur.
      setSizes(mapSizesFromServer(result.sizes));
      setColors(mapColorsFromServer(result.colors));
      setStockMap(mapStockFromServer(result.variants));
      queryClient.setQueryData(['adminProductDetail', productId], (old) => (old ? { ...old, ...result } : old));
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });

  const activeSizes = sizes.filter((s) => s.name.trim());
  const activeColors = colors.filter((c) => c.name.trim());

  const handleSave = () => {
    const validSizes = activeSizes.filter((s) => s.price !== '');
    const payload = {
      sizes: validSizes.map((s) => ({ id: s.id, client_id: s.client_id, name: s.name.trim(), price: parseFloat(s.price) || 0, display_order: s.display_order })),
      colors: activeColors.map((c) => ({ id: c.id, client_id: c.client_id, name: c.name.trim(), hex_code: c.hex_code || null, is_default: c.is_default, display_order: c.display_order })),
      variants: [],
    };

    const sizeList = validSizes.length ? validSizes : [null];
    const colorList = activeColors.length ? activeColors : [null];
    if (validSizes.length || activeColors.length) {
      for (const s of sizeList) {
        for (const c of colorList) {
          if (!s && !c) continue;
          payload.variants.push({
            size_client_id: s ? s.client_id : null,
            color_client_id: c ? c.client_id : null,
            stock_quantity: parseInt(getStock(s?.client_id, c?.client_id)) || 0,
          });
        }
      }
    }
    saveMutation.mutate(payload);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#3D2914]">Varyantlar (Beden / Renk)</h3>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A5D23] text-white text-xs font-medium hover:bg-[#4A5D23]/90 disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Varyantları Kaydet
        </button>
      </div>
      {saveMutation.isSuccess && <p className="text-xs text-green-600">Varyantlar kaydedildi.</p>}
      {saveMutation.isError && (
        <p className="text-xs text-red-500">{saveMutation.error?.response?.data?.message || 'Hata oluştu'}</p>
      )}

      {/* Bedenler */}
      <div>
        <p className="text-xs font-semibold text-[#8B5A2B] mb-2">
          Bedenler <span className="font-normal text-[#8B5A2B]/70">(opsiyonel — tanımlarsanız müşteri sepete eklemeden önce seçmek zorunda kalır)</span>
        </p>
        <div className="space-y-2">
          {sizes.map((s) => (
            <div key={s.client_id} className="flex items-center gap-2">
              <input
                value={s.name}
                onChange={(e) => updateSize(s.client_id, 'name', e.target.value)}
                placeholder="Küçük / 30x40 ..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
              />
              <div className="relative w-32">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8B5A2B]">₺</span>
                <input
                  type="number" step="0.01"
                  value={s.price}
                  onChange={(e) => updateSize(s.client_id, 'price', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
                />
              </div>
              <button onClick={() => removeSize(s.client_id)} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-red-50 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addSize} className="mt-2 flex items-center gap-1 text-xs font-medium text-[#C67D4A] hover:underline">
          <Plus className="w-3.5 h-3.5" /> Beden Ekle
        </button>
      </div>

      <div className="border-t border-[#E8D5C4]/30" />

      {/* Renkler */}
      <div>
        <p className="text-xs font-semibold text-[#8B5A2B] mb-2">
          Renkler <span className="font-normal text-[#8B5A2B]/70">(opsiyonel — fiyatı etkilemez, görsel değişmez)</span>
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addColorFromPreset(preset)}
              title={preset.name}
              className="w-7 h-7 rounded-full border-2 border-white shadow ring-1 ring-[#E8D5C4] hover:scale-110 transition-transform"
              style={{ backgroundColor: preset.hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="color"
            value={customColorHex}
            onChange={(e) => setCustomColorHex(e.target.value)}
            className="w-9 h-9 rounded-lg border border-[#E8D5C4] cursor-pointer"
          />
          <input
            value={customColorName}
            onChange={(e) => setCustomColorName(e.target.value)}
            placeholder="Özel renk adı"
            className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
          />
          <button onClick={addCustomColor} className="px-3 py-1.5 rounded-lg bg-[#E8D5C4]/50 text-xs font-medium text-[#3D2914] hover:bg-[#E8D5C4]">
            Ekle
          </button>
        </div>
        {colors.length > 0 && (
          <div className="space-y-1.5">
            {colors.map((c) => (
              <div key={c.client_id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#FAF6F0]">
                <span className="w-4 h-4 rounded-full ring-1 ring-black/10 shrink-0" style={{ backgroundColor: c.hex_code || '#ccc' }} />
                <span className="flex-1 text-sm text-[#3D2914]">{c.name}</span>
                <label className="flex items-center gap-1 text-[11px] text-[#8B5A2B] cursor-pointer">
                  <input type="radio" name={`default-color-${productId}`} checked={c.is_default} onChange={() => setDefaultColor(c.client_id)} className="accent-[#C67D4A]" />
                  Varsayılan
                </label>
                <button onClick={() => removeColor(c.client_id)} className="p-1 rounded text-[#8B5A2B] hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stok Matrisi */}
      {(activeSizes.length > 0 || activeColors.length > 0) && (
        <>
          <div className="border-t border-[#E8D5C4]/30" />
          <div>
            <p className="text-xs font-semibold text-[#8B5A2B] mb-2">Stok</p>
            {activeSizes.length > 0 && activeColors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-[#8B5A2B] font-medium pb-1.5" />
                      {activeColors.map((c) => (
                        <th key={c.client_id} className="text-xs text-[#8B5A2B] font-medium pb-1.5 px-1.5">{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeSizes.map((s) => (
                      <tr key={s.client_id}>
                        <td className="text-xs text-[#3D2914] font-medium pr-2 py-1 whitespace-nowrap">{s.name}</td>
                        {activeColors.map((c) => (
                          <td key={c.client_id} className="px-1.5 py-1">
                            <input
                              type="number" min="0"
                              value={getStock(s.client_id, c.client_id)}
                              onChange={(e) => setStock(s.client_id, c.client_id, e.target.value)}
                              className="w-16 px-2 py-1 rounded-lg border border-[#E8D5C4] text-sm text-center text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-1.5">
                {(activeSizes.length > 0 ? activeSizes : activeColors).map((item) => {
                  const isSize = activeSizes.length > 0;
                  return (
                    <div key={item.client_id} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#3D2914]">{item.name}</span>
                      <input
                        type="number" min="0"
                        value={isSize ? getStock(item.client_id, null) : getStock(null, item.client_id)}
                        onChange={(e) => (isSize ? setStock(item.client_id, null, e.target.value) : setStock(null, item.client_id, e.target.value))}
                        className="w-20 px-2 py-1 rounded-lg border border-[#E8D5C4] text-sm text-center text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ============================================================
   FOTOĞRAF YÖNETİMİ
   ============================================================ */
const ProductImages = ({ productId, productSlug }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['adminProductDetail', productId],
    queryFn: () => getAdminProductDetail(productId),
  });

  const images = product?.images || [];

  const addImageMutation = useMutation({
    mutationFn: (data) => addProductImage(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProductDetail', productId] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });

  const removeImageMutation = useMutation({
    mutationFn: (imageId) => removeProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProductDetail', productId] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });

  const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15 MB

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalid = files.find((f) => !f.type.startsWith('image/'));
    if (invalid) {
      alert(`"${invalid.name}" bir görsel dosyası değil.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const tooLarge = files.find((f) => f.size > MAX_UPLOAD_SIZE);
    if (tooLarge) {
      alert(`"${tooLarge.name}" 15 MB sınırını aşıyor. Lütfen daha küçük bir dosya seçin.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ts = Date.now();
        setUploadProgress(`${i + 1}/${files.length} optimize ediliyor...`);

        // Full-size (1600px) ve thumbnail (800px) oluştur
        const [full, thumb] = await Promise.all([
          optimizeImage(file, { maxSize: 1600, quality: 0.82 }),
          optimizeImage(file, { maxSize: 800, quality: 0.82 }),
        ]);

        // Full-size yükle
        const fullPath = `products/${productSlug}/${ts}_${i}.webp`;
        const fullRef = ref(storage, fullPath);
        setUploadProgress(`${i + 1}/${files.length} yükleniyor...`);
        await uploadBytes(fullRef, full.blob, { contentType: 'image/webp' });
        const firebaseUrl = await getDownloadURL(fullRef);

        // Thumbnail yükle
        const thumbPath = `products/${productSlug}/thumb_${ts}_${i}.webp`;
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, thumb.blob, { contentType: 'image/webp' });
        const thumbnailUrl = await getDownloadURL(thumbRef);

        await addImageMutation.mutateAsync({
          firebase_url: firebaseUrl,
          storage_path: fullPath,
          display_order: images.length + i,
          is_primary: images.length === 0 && i === 0,
          thumbnail_url: thumbnailUrl,
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [settingPrimary, setSettingPrimary] = useState(null);

  const handleSetPrimary = async (img) => {
    setSettingPrimary(img.id);
    try {
      let thumbUrl = img.thumbnail_url;

      // Thumbnail yoksa full image'den oluştur
      if (!thumbUrl) {
        const response = await fetch(img.firebase_url);
        const blob = await response.blob();
        const file = new File([blob], 'image.webp', { type: blob.type });
        const { blob: thumbBlob } = await optimizeImage(file, { maxSize: 800, quality: 0.82 });

        const thumbPath = `products/${productSlug}/thumb_${Date.now()}.webp`;
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, thumbBlob, { contentType: 'image/webp' });
        thumbUrl = await getDownloadURL(thumbRef);
      }

      await setProductPrimaryImage(productId, img.id, thumbUrl);
      queryClient.invalidateQueries({ queryKey: ['adminProductDetail', productId] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    } catch (err) {
      console.error('Set primary error:', err);
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleRemove = (imageId) => {
    if (window.confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      removeImageMutation.mutate(imageId);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5">
      <h3 className="text-sm font-bold text-[#3D2914] mb-3 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-[#C67D4A]" />
        Fotoğraflar ({images.length})
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#C67D4A]" />
        </div>
      ) : (
        <>
          {/* Image grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {images.map((img) => (
              <div key={img.id} className="relative rounded-lg overflow-hidden aspect-square bg-[#FAF6F0]">
                <img src={img.firebase_url} alt="" className="w-full h-full object-cover" />
                {/* Primary badge */}
                {img.is_primary && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#C67D4A] text-white text-[10px] font-semibold flex items-center gap-0.5">
                    <Crown className="w-3 h-3" /> Ana
                  </div>
                )}
                {/* Action buttons */}
                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  {settingPrimary === img.id ? (
                    <div className="p-1.5 rounded-lg bg-black/50">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                  ) : (
                    <>
                      {!img.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(img)}
                          className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
                          title="Ana fotoğraf yap"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(img.id)}
                        className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-red-500 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 rounded-lg border-2 border-dashed border-[#E8D5C4] text-sm text-[#8B5A2B] hover:border-[#C67D4A] hover:text-[#C67D4A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress || 'Yükleniyor...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Fotoğraf Yükle
              </>
            )}
          </button>
          <p className="text-[10px] text-[#8B5A2B]/50 mt-1.5 text-center">
            Birden fazla fotoğraf seçebilirsiniz. İlk yüklenen otomatik ana fotoğraf olur.
          </p>
        </>
      )}
    </div>
  );
};
