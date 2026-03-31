import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../../api/products';
import { getAllCategories } from '../../api/categories';
import ProductCard from '../../components/ProductCard';
import { Skeleton } from '../../components/ui/skeleton';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'name_asc', label: 'İsim: A-Z' },
  { value: 'name_desc', label: 'İsim: Z-A' },
  { value: 'popular', label: 'En Popüler' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  const closeMobileFilters = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setMobileFiltersOpen(false);
      setDrawerClosing(false);
    }, 250);
  }, []);

  // Read filters from URL
  const currentCategoryParam = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';

  // Local state for price inputs (only applied on submit)
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const updateParams = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    if (!('page' in updates)) newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Fetch categories
  const { data: categoryTree = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten category tree for the sidebar
  const flatCategories = useMemo(() => {
    const result = [];
    const flatten = (cats, depth = 0) => {
      if (!Array.isArray(cats)) return;
      cats.forEach((cat) => {
        result.push({ ...cat, depth });
        if (cat.children?.length) flatten(cat.children, depth + 1);
      });
    };
    flatten(categoryTree);
    return result;
  }, [categoryTree]);

  // Resolve slug to ID if category param is not a UUID
  const currentCategory = useMemo(() => {
    if (!currentCategoryParam) return '';
    // UUID pattern check
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentCategoryParam)) {
      return currentCategoryParam;
    }
    const found = flatCategories.find((c) => c.slug === currentCategoryParam);
    return found?.id || '';
  }, [currentCategoryParam, flatCategories]);

  // Fetch products
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products', currentCategory, currentSort, currentSearch, currentPage, currentMinPrice, currentMaxPrice],
    queryFn: () => getProducts({
      category_id: currentCategory || undefined,
      sort: currentSort,
      search: currentSearch || undefined,
      page: currentPage,
      limit: 12,
      min_price: currentMinPrice || undefined,
      max_price: currentMaxPrice || undefined,
    }),
    staleTime: 30 * 1000,
  });

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / 12);

  const handlePriceFilter = () => {
    updateParams({ min_price: minPriceInput, max_price: maxPriceInput });
    closeMobileFilters();
  };

  const clearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
    closeMobileFilters();
  };

  const hasActiveFilters = currentCategory || currentSearch || currentMinPrice || currentMaxPrice;
  const selectedCategoryName = flatCategories.find(c => c.id === currentCategory)?.name;

  /* ---- Sidebar Filter Content ---- */
  const FilterContent = ({ onAction }) => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-[#3D2914] mb-3 uppercase tracking-wider">Ara</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Ürün ara..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateParams({ search: e.target.value });
                onAction?.();
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8D5C4] bg-white text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/50 focus:outline-none focus:border-[#C67D4A] focus:ring-1 focus:ring-[#C67D4A]/30 transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5A2B]" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-[#3D2914] mb-3 uppercase tracking-wider">Kategoriler</h3>
        <div className="space-y-1">
          <button
            onClick={() => { updateParams({ category: '' }); onAction?.(); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-[#C67D4A] text-white font-medium' : 'text-[#3D2914] hover:bg-[#E8D5C4]/60'}`}
          >
            Tüm Ürünler
          </button>
          {flatCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { updateParams({ category: cat.id }); onAction?.(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.id ? 'bg-[#C67D4A] text-white font-medium' : 'text-[#3D2914] hover:bg-[#E8D5C4]/60'}`}
              style={{ paddingLeft: `${12 + cat.depth * 16}px` }}
            >
              {cat.depth > 0 && <span className="text-[#D4A574] mr-1.5">—</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-[#3D2914] mb-3 uppercase tracking-wider">Fiyat Aralığı</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] bg-white text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A] transition-colors"
          />
          <span className="text-[#8B5A2B] text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] bg-white text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A] transition-colors"
          />
        </div>
        <button
          onClick={handlePriceFilter}
          className="w-full py-2 rounded-lg bg-[#3D2914] text-white text-sm font-medium hover:bg-[#3D2914]/90 transition-colors"
        >
          Uygula
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 rounded-lg border border-[#C67D4A] text-[#C67D4A] text-sm font-medium hover:bg-[#C67D4A]/5 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#3D2914]">
            {selectedCategoryName || 'Tüm Ürünler'}
          </h1>
          <p className="text-[#8B5A2B] mt-1 sm:mt-2 text-sm sm:text-base">
            {total > 0 ? `${total} ürün bulundu` : isLoading ? 'Yükleniyor...' : 'Henüz ürün bulunamadı'}
          </p>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C67D4A]/10 text-[#C67D4A] text-xs sm:text-sm">
                  &ldquo;{currentSearch}&rdquo;
                  <button onClick={() => updateParams({ search: '' })}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {selectedCategoryName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C67D4A]/10 text-[#C67D4A] text-xs sm:text-sm">
                  {selectedCategoryName}
                  <button onClick={() => updateParams({ category: '' })}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {(currentMinPrice || currentMaxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C67D4A]/10 text-[#C67D4A] text-xs sm:text-sm">
                  {currentMinPrice || '0'}₺ — {currentMaxPrice || '∞'}₺
                  <button onClick={() => { setMinPriceInput(''); setMaxPriceInput(''); updateParams({ min_price: '', max_price: '' }); }}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="flex gap-8">
          {/* ====== Desktop Sidebar ====== */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl p-5 card-shadow">
              <FilterContent />
            </div>
          </aside>

          {/* ====== Main Content ====== */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-[#E8D5C4] bg-white text-sm text-[#3D2914] font-medium hover:border-[#C67D4A] transition-colors shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden xs:inline">Filtrele</span>
              </button>

              {/* Sort */}
              <div className="relative ml-auto">
                <select
                  value={currentSort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 rounded-xl border border-[#E8D5C4] bg-white text-xs sm:text-sm text-[#3D2914] font-medium cursor-pointer hover:border-[#C67D4A] focus:outline-none focus:border-[#C67D4A] transition-colors max-w-[180px] sm:max-w-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5A2B] pointer-events-none" />
              </div>

              {/* Grid toggle (desktop only) */}
              <div className="hidden md:flex items-center border border-[#E8D5C4] rounded-xl overflow-hidden shrink-0">
                {[3, 4].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={`p-2.5 transition-colors ${gridCols === cols ? 'bg-[#3D2914] text-white' : 'bg-white text-[#8B5A2B] hover:bg-[#E8D5C4]/40'}`}
                  >
                    {cols === 3 ? <Grid3X3 className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden card-shadow">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <Skeleton className="h-3 w-16 sm:w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex justify-between items-center pt-1">
                        <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
                        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 sm:py-20 px-4">
                <p className="text-[#8B5A2B] text-base sm:text-lg mb-4">Ürünler yüklenirken bir hata oluştu.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 rounded-xl bg-[#C67D4A] text-white text-sm font-medium hover:bg-[#C67D4A]/90 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-20 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[#E8D5C4]/50 flex items-center justify-center">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B5A2B]" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-[#3D2914] mb-2">Ürün Bulunamadı</h3>
                <p className="text-[#8B5A2B] text-sm sm:text-base mb-5 sm:mb-6">Filtreleri değiştirmeyi veya farklı bir arama yapmayı deneyin.</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 rounded-xl bg-[#C67D4A] text-white text-sm font-medium hover:bg-[#C67D4A]/90 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-3 sm:gap-5 ${gridCols === 4 ? 'lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-10">
                <button
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#E8D5C4] bg-white text-[#3D2914] hover:border-[#C67D4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="w-6 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-[#8B5A2B] text-sm">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'bg-[#3D2914] text-white'
                          : 'border border-[#E8D5C4] bg-white text-[#3D2914] hover:border-[#C67D4A]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                  disabled={currentPage >= totalPages}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#E8D5C4] bg-white text-[#3D2914] hover:border-[#C67D4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Mobile Filters Drawer ====== */}
      {mobileFiltersOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/40 z-50 lg:hidden ${drawerClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={closeMobileFilters}
          />
          {/* Drawer */}
          <div
            className={`fixed inset-y-0 left-0 z-50 lg:hidden overflow-y-auto bg-[#FAF6F0] shadow-2xl ${drawerClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
            style={{ width: 'min(300px, calc(100vw - 3rem))' }}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8D5C4] sticky top-0 bg-[#FAF6F0] z-10">
              <h2 className="text-lg font-heading font-semibold text-[#3D2914]">Filtreler</h2>
              <button
                onClick={closeMobileFilters}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8D5C4] transition-colors text-[#3D2914]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <FilterContent onAction={closeMobileFilters} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function generatePageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default Products;
