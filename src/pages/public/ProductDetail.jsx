import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  ChevronRight, Heart, ShoppingCart, Star, Minus, Plus, X,
  Truck, ShieldCheck, RotateCcw, Ruler, ChevronLeft,
  MessageCircleQuestion, Send, User, CheckCircle2, Clock, ChevronDown,
} from 'lucide-react';
import { getProductBySlug, calculateProductPrice, getFeaturedProducts } from '../../api/products';
import { getProductQuestions, createQuestion } from '../../api/questions';
import { getProductReviews } from '../../api/reviews';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';
import { triggerCartToast, triggerFavoriteToast } from '../../components/Toast';
import ProductCard from '../../components/ProductCard';
import ReviewLightbox from '../../components/ReviewLightbox';
import { Skeleton } from '../../components/ui/skeleton';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <ProductNotFound />;

  const related = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-[#8B5A2B] flex-wrap">
          <Link to="/" className="hover:text-[#C67D4A] transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link to="/products" className="hover:text-[#C67D4A] transition-colors">Ürünler</Link>
          {product.parent_category_name && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link
                to={`/products?category=${product.category_id}`}
                className="hover:text-[#C67D4A] transition-colors"
              >
                {product.parent_category_name}
              </Link>
            </>
          )}
          {product.category_name && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link
                to={`/products?category=${product.category_id}`}
                className="hover:text-[#C67D4A] transition-colors"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[#3D2914] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image Gallery */}
          <ImageGallery product={product} />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Description Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-white rounded-2xl p-5 sm:p-8 card-shadow">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#3D2914] mb-4">Ürün Açıklaması</h2>
          <p className="text-[#8B5A2B] leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <ProductReviews productId={product.id} />
      </div>

      {/* Questions Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <ProductQuestions productId={product.id} />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#3D2914] mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   IMAGE GALLERY
   ============================================================ */
const ImageGallery = ({ product }) => {
  const placeholderImg = 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=800&fit=crop';
  const images = product.images?.length > 0
    ? product.images.map(img => img.firebase_url)
    : [placeholderImg];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const goTo = (dir) => {
    setSelectedIndex(prev => {
      if (dir === 'prev') return prev === 0 ? images.length - 1 : prev - 1;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <div className="lg:w-[55%] flex-shrink-0">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white card-shadow group mb-3">
        <img
          src={images[selectedIndex]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 cursor-zoom-in ${zoomed ? 'scale-150' : ''}`}
          onClick={() => setZoomed(!zoomed)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2">
          {product.is_weekly_pick && (
            <span className="bg-[#4A5D23] text-white text-[0.65rem] sm:text-xs uppercase tracking-wider font-semibold px-2.5 py-1 sm:px-3 rounded-md shadow">
              Haftanın Seçimi
            </span>
          )}
          {product.is_featured && (
            <span className="bg-[#C67D4A] text-white text-[0.65rem] sm:text-xs uppercase tracking-wider font-semibold px-2.5 py-1 sm:px-3 rounded-md shadow">
              Öne Çıkan
            </span>
          )}
        </div>

        {/* Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo('prev')}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2914]" />
            </button>
            <button
              onClick={() => goTo('next')}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2914]" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                selectedIndex === i ? 'border-[#C67D4A]' : 'border-transparent hover:border-[#E8D5C4]'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   PRODUCT INFO
   ============================================================ */
const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { addItem, addPending, addError } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isVariable = product.pricing_type !== 'fixed';
  const liked = isAuthenticated && isFavorite(product.id);

  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState(product.min_width_cm || 30);
  const [height, setHeight] = useState(product.min_height_cm || 30);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    const unitPrice = isVariable && calculatedPrice
      ? Number(calculatedPrice)
      : Number(product.sale_price || product.base_price);

    await addItem({
      product,
      quantity,
      selected_width_cm: isVariable ? width : undefined,
      selected_height_cm: isVariable ? height : undefined,
      unit_price: unitPrice,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);

    triggerCartToast({
      name: product.name,
      primary_image: product.primary_image || product.images?.[0]?.firebase_url,
      displayPrice: `${(unitPrice * quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`,
    });
  };

  const hasDiscount = product.sale_price && Number(product.sale_price) < Number(product.base_price);
  const basePrice = product.base_price
    ? Number(product.base_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
    : null;
  const salePrice = hasDiscount
    ? Number(product.sale_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
    : null;

  const rating = parseFloat(product.avg_rating) || 0;
  const reviews = parseInt(product.review_count) || 0;

  const handleCalculatePrice = useCallback(async () => {
    if (!isVariable) return;
    setPriceLoading(true);
    setPriceError('');
    try {
      const result = await calculateProductPrice(product.id, width, height);
      setCalculatedPrice(result.price);
    } catch (err) {
      setPriceError(err.response?.data?.message || 'Fiyat hesaplanamadı');
      setCalculatedPrice(null);
    } finally {
      setPriceLoading(false);
    }
  }, [isVariable, product.id, width, height]);

  const displayPrice = isVariable && calculatedPrice
    ? Number(calculatedPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
    : (salePrice || basePrice);

  const inStock = product.stock_quantity > 0;

  return (
    <div className="flex-1 min-w-0">
      {/* Category */}
      {product.category_name && (
        <Link
          to={`/products?category=${product.category_id}`}
          className="inline-block text-xs sm:text-sm uppercase tracking-wider text-[#C67D4A] font-semibold hover:text-[#8B5A2B] transition-colors mb-2"
        >
          {product.parent_category_name ? `${product.parent_category_name} / ` : ''}{product.category_name}
        </Link>
      )}

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-[#3D2914] mb-3 sm:mb-4 leading-tight">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill={i < Math.round(rating) ? '#D4A574' : 'transparent'}
              color="#D4A574"
            />
          ))}
        </div>
        <span className="text-sm text-[#8B5A2B]">
          {rating > 0 ? `${rating}` : '0'} ({reviews} değerlendirme)
        </span>
      </div>

      {/* Price */}
      <div className="mb-5 sm:mb-6">
        {displayPrice ? (
          <div className="flex items-baseline gap-2 flex-wrap">
            {hasDiscount && !isVariable && (
              <span className="text-lg sm:text-xl text-[#8B5A2B]/50 line-through">{basePrice}₺</span>
            )}
            <span className={`text-3xl sm:text-4xl font-bold ${hasDiscount && !isVariable ? 'text-red-500' : 'text-[#C67D4A]'}`}>{displayPrice}₺</span>
            {hasDiscount && !isVariable && product.discount_type && (
              <span className="text-sm font-semibold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                {product.discount_type === 'percentage' ? `%${product.discount_value} İndirim` : `₺${product.discount_value} İndirim`}
              </span>
            )}
            {isVariable && !calculatedPrice && (
              <span className="text-sm text-[#8B5A2B]">başlangıç fiyatı</span>
            )}
            {isVariable && calculatedPrice && (
              <span className="text-sm text-[#4A5D23] font-medium">{width}x{height} cm için</span>
            )}
          </div>
        ) : (
          <span className="text-2xl font-bold text-[#8B5A2B]">Fiyat Sorunuz</span>
        )}
      </div>

      {/* Dimension Calculator */}
      {isVariable && (
        <div className="bg-[#E8D5C4]/30 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-[#C67D4A]" />
            <h3 className="font-semibold text-[#3D2914]">Boyut Seçin</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Width */}
            <div>
              <label className="text-xs text-[#8B5A2B] font-medium mb-1 block">
                Genişlik (cm)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={product.min_width_cm || 1}
                  max={product.max_width_cm || 999}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8D5C4] bg-white text-sm text-[#3D2914] text-center focus:outline-none focus:border-[#C67D4A] transition-colors"
                />
              </div>
              <span className="text-[0.65rem] text-[#8B5A2B] mt-1 block">
                {product.min_width_cm}–{product.max_width_cm} cm
              </span>
            </div>

            {/* Height */}
            <div>
              <label className="text-xs text-[#8B5A2B] font-medium mb-1 block">
                Yükseklik (cm)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={product.min_height_cm || 1}
                  max={product.max_height_cm || 999}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8D5C4] bg-white text-sm text-[#3D2914] text-center focus:outline-none focus:border-[#C67D4A] transition-colors"
                />
              </div>
              <span className="text-[0.65rem] text-[#8B5A2B] mt-1 block">
                {product.min_height_cm}–{product.max_height_cm} cm
              </span>
            </div>
          </div>

          <button
            onClick={handleCalculatePrice}
            disabled={priceLoading}
            className="w-full py-2.5 rounded-xl bg-[#3D2914] text-white text-sm font-semibold hover:bg-[#3D2914]/90 transition-colors disabled:opacity-60"
          >
            {priceLoading ? 'Hesaplanıyor...' : 'Fiyat Hesapla'}
          </button>

          {priceError && (
            <p className="text-red-500 text-xs mt-2">{priceError}</p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-4 mb-5 sm:mb-6">
        <span className="text-sm font-medium text-[#3D2914]">Adet:</span>
        <div className="flex items-center border border-[#E8D5C4] rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-[#3D2914] hover:bg-[#E8D5C4]/40 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-[#3D2914] border-x border-[#E8D5C4]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-[#3D2914] hover:bg-[#E8D5C4]/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {inStock ? (
          <span className="text-xs text-[#4A5D23] font-medium">Stokta {product.stock_quantity} adet</span>
        ) : (
          <span className="text-xs text-red-500 font-medium">Stokta yok</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 sm:mb-8">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addPending}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
            addedToCart
              ? 'bg-[#4A5D23] text-white shadow-[#4A5D23]/20'
              : 'bg-[#C67D4A] text-white hover:bg-[#C67D4A]/90 shadow-[#C67D4A]/20'
          }`}
        >
          {addPending ? (
            <>Ekleniyor...</>
          ) : addedToCart ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Sepete Eklendi
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Sepete Ekle
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (!isAuthenticated) { navigate('/login'); return; }
            const wasLiked = liked;
            toggleFavorite(product.id);
            triggerFavoriteToast({
              name: product.name,
              primary_image: product.primary_image || product.images?.[0]?.firebase_url,
            }, !wasLiked);
          }}
          className={`w-12 sm:w-14 flex items-center justify-center rounded-xl border-2 transition-colors ${
            liked
              ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
              : 'border-[#E8D5C4] text-[#3D2914] hover:border-[#C67D4A] hover:text-[#C67D4A]'
          }`}
        >
          <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      {addError && (
        <p className="text-red-500 text-xs -mt-4 mb-6">
          {addError?.response?.data?.message || 'Sepete eklenirken bir hata oluştu'}
        </p>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: Truck, title: 'Ücretsiz Kargo', desc: '500₺ üzeri' },
          { icon: ShieldCheck, title: 'Güvenli Ödeme', desc: '256-bit SSL' },
          { icon: RotateCcw, title: 'Kolay İade', desc: '14 gün içinde' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center p-3 sm:p-4 rounded-xl bg-white card-shadow">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C67D4A] mx-auto mb-1.5" />
            <h4 className="text-[0.65rem] sm:text-xs font-semibold text-[#3D2914]">{title}</h4>
            <p className="text-[0.6rem] sm:text-[0.65rem] text-[#8B5A2B]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   PRODUCT REVIEWS
   ============================================================ */
const ProductReviews = ({ productId }) => {
  const [showAll, setShowAll] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => getProductReviews(productId, 1, 50),
    enabled: !!productId,
  });

  const allReviews = reviewsData?.reviews || [];
  const avgRating = parseFloat(reviewsData?.avg_rating) || 0;
  const totalReviews = reviewsData?.pagination?.total || 0;

  const filteredReviews = filterRating > 0
    ? allReviews.filter(r => r.rating === filterRating)
    : allReviews;

  const displayReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3);

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter(r => r.rating === star).length,
  }));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderStars = (rating, size = 'w-4 h-4') => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={size}
          fill={i < rating ? '#D4A574' : 'transparent'}
          color="#D4A574"
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-[#E8D5C4]/50">
        <div className="flex items-center gap-2.5 mb-5">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4A574]" fill="#D4A574" />
          <h2 className="text-lg sm:text-xl font-heading font-bold text-[#3D2914]">
            Değerlendirmeler
          </h2>
          {totalReviews > 0 && (
            <span className="bg-[#E8D5C4]/60 text-[#3D2914] text-xs font-semibold px-2 py-0.5 rounded-full">
              {totalReviews}
            </span>
          )}
        </div>

        {/* Rating Summary */}
        {totalReviews > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            {/* Big score */}
            <div className="flex items-center gap-4 sm:min-w-[160px]">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[#3D2914] leading-none">{avgRating.toFixed(1)}</div>
                <div className="mt-1.5">{renderStars(Math.round(avgRating), 'w-3.5 h-3.5 sm:w-4 sm:h-4')}</div>
                <p className="text-xs text-[#8B5A2B] mt-1">{totalReviews} değerlendirme</p>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 space-y-1.5">
              {ratingCounts.map(({ star, count }) => {
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                    className={`flex items-center gap-2 sm:gap-3 w-full group text-left py-0.5 rounded transition-colors ${filterRating === star ? 'bg-[#E8D5C4]/30' : 'hover:bg-[#FAF6F0]'}`}
                  >
                    <span className="text-xs sm:text-sm text-[#3D2914] font-medium w-8 shrink-0 flex items-center gap-0.5">
                      {star} <Star className="w-3 h-3 text-[#D4A574]" fill="#D4A574" />
                    </span>
                    <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-[#E8D5C4]/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D4A574] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#8B5A2B] w-6 text-right shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active filter tag */}
        {filterRating > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-[#8B5A2B]">Filtre:</span>
            <button
              onClick={() => setFilterRating(0)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C67D4A]/10 text-[#C67D4A] text-xs font-medium"
            >
              {filterRating} Yıldız
              <span className="hover:text-[#3D2914]">&times;</span>
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-[#E8D5C4]/40">
        {isLoading ? (
          <div className="p-5 sm:p-6 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-10 sm:py-14 text-center px-4">
            <Star className="w-10 h-10 text-[#E8D5C4] mx-auto mb-3" />
            <p className="text-[#8B5A2B] text-sm">
              {filterRating > 0
                ? `${filterRating} yıldız değerlendirme bulunamadı.`
                : 'Henüz bu ürün değerlendirilmemiş.'
              }
            </p>
            {filterRating > 0 && (
              <button onClick={() => setFilterRating(0)} className="text-[#C67D4A] text-sm mt-2 font-medium">
                Filtreyi kaldır
              </button>
            )}
          </div>
        ) : (
          <>
            {displayReviews.map((review) => (
              <div key={review.id} className="px-5 sm:px-6 py-4 sm:py-5">
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-2.5">
                  {/* Avatar */}
                  {review.user_avatar ? (
                    <img src={review.user_avatar} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #C67D4A, #D4A574)' }}
                    >
                      {(review.user_name || 'K')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#3D2914]">{review.user_name || 'Kullanıcı'}</span>
                      <span className="text-[0.65rem] text-[#8B5A2B]/60">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="mt-0.5">{renderStars(review.rating, 'w-3.5 h-3.5')}</div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-[#3D2914]/90 leading-relaxed ml-12 sm:ml-[52px]">{review.comment}</p>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && review.images[0] !== null && (
                  <div className="flex gap-2.5 mt-3 ml-12 sm:ml-[52px] overflow-x-auto pb-1">
                    {review.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox({ open: true, images: review.images, index: i })}
                        className="shrink-0 rounded-xl overflow-hidden border-2 border-[#E8D5C4] hover:border-[#C67D4A] transition-colors group"
                      >
                        <img
                          src={img.firebase_url}
                          alt=""
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Admin Reply */}
                {review.admin_reply && (
                  <div className="mt-3 ml-12 sm:ml-[52px] pl-4 border-l-2 border-[#4A5D23]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#4A5D23]">Satıcı Yanıtı</span>
                    </div>
                    <p className="text-sm text-[#3D2914]/70 leading-relaxed">{review.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Show More */}
            {filteredReviews.length > 3 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3.5 sm:py-4 text-sm font-semibold text-[#C67D4A] hover:bg-[#FAF6F0]/60 transition-colors flex items-center justify-center gap-1.5"
              >
                Tüm Değerlendirmeleri Gör ({filteredReviews.length})
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <ReviewLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, images: [], index: 0 })}
        />
      )}
    </div>
  );
};

/* ============================================================
   PRODUCT QUESTIONS (Trendyol Style)
   ============================================================ */
const ProductQuestions = ({ productId }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [questionText, setQuestionText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['productQuestions', productId, page],
    queryFn: () => getProductQuestions(productId, page, 50),
    enabled: !!productId,
  });

  const questions = questionsData?.questions || [];
  const total = questionsData?.total || 0;
  const displayQuestions = showAll ? questions : questions.slice(0, 3);

  const submitMutation = useMutation({
    mutationFn: () => createQuestion(productId, questionText),
    onSuccess: () => {
      setQuestionText('');
      queryClient.invalidateQueries({ queryKey: ['productQuestions', productId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    submitMutation.mutate();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E8D5C4]/50">
        <div className="flex items-center gap-2.5">
          <MessageCircleQuestion className="w-5 h-5 sm:w-6 sm:h-6 text-[#C67D4A]" />
          <h2 className="text-lg sm:text-xl font-heading font-bold text-[#3D2914]">
            Ürün Hakkında Sorular
          </h2>
          {total > 0 && (
            <span className="bg-[#E8D5C4]/60 text-[#3D2914] text-xs font-semibold px-2 py-0.5 rounded-full">
              {total}
            </span>
          )}
        </div>
      </div>

      {/* Ask Question Form */}
      <div className="px-5 sm:px-6 py-4 bg-[#FAF6F0]/60 border-b border-[#E8D5C4]/50">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Bu ürün hakkında bir soru sorun..."
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-[#E8D5C4] bg-white text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/50 focus:outline-none focus:border-[#C67D4A] focus:ring-1 focus:ring-[#C67D4A]/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!questionText.trim() || submitMutation.isPending}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#C67D4A] text-white font-semibold text-sm hover:bg-[#C67D4A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gönder</span>
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-[#8B5A2B]">Soru sormak için giriş yapmanız gerekmektedir.</p>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-[#3D2914] text-white text-sm font-medium hover:bg-[#3D2914]/90 transition-colors shrink-0"
            >
              Giriş Yap
            </Link>
          </div>
        )}
        {submitMutation.isSuccess && (
          <p className="text-[#4A5D23] text-xs mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sorunuz başarıyla gönderildi.
          </p>
        )}
        {submitMutation.isError && (
          <p className="text-red-500 text-xs mt-2">
            {submitMutation.error?.response?.data?.message || 'Soru gönderilirken bir hata oluştu.'}
          </p>
        )}
      </div>

      {/* Questions List */}
      <div className="divide-y divide-[#E8D5C4]/40">
        {isLoading ? (
          <div className="p-5 sm:p-6 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="py-10 sm:py-14 text-center px-4">
            <MessageCircleQuestion className="w-10 h-10 text-[#E8D5C4] mx-auto mb-3" />
            <p className="text-[#8B5A2B] text-sm">Henüz bu ürün hakkında soru sorulmamış.</p>
            <p className="text-[#8B5A2B]/60 text-xs mt-1">İlk soruyu siz sorun!</p>
          </div>
        ) : (
          <>
            {displayQuestions.map((q) => (
              <div key={q.id} className="px-5 sm:px-6 py-4 sm:py-5 hover:bg-[#FAF6F0]/40 transition-colors">
                {/* Question */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C67D4A]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#C67D4A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-[#3D2914]">
                        {q.user_name || 'Kullanıcı'}
                      </span>
                      <span className="text-[0.65rem] text-[#8B5A2B]/60">
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#3D2914] leading-relaxed">{q.question_text}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer_text ? (
                  <div className="flex gap-3 mt-3 ml-5 sm:ml-6 pl-4 sm:pl-5 border-l-2 border-[#4A5D23]/20">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#4A5D23]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-[#4A5D23]">Satıcı</span>
                        <span className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-wider bg-[#4A5D23]/10 text-[#4A5D23] font-semibold px-1.5 py-0.5 rounded">
                          Resmi Yanıt
                        </span>
                        {q.answered_at && (
                          <span className="text-[0.65rem] text-[#8B5A2B]/60">
                            {formatDate(q.answered_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#3D2914]/80 leading-relaxed">{q.answer_text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 ml-11 sm:ml-12">
                    <span className="inline-flex items-center gap-1 text-xs text-[#8B5A2B]/60">
                      <Clock className="w-3 h-3" /> Yanıt bekleniyor
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Show More */}
            {questions.length > 3 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3.5 sm:py-4 text-sm font-semibold text-[#C67D4A] hover:bg-[#FAF6F0]/60 transition-colors flex items-center justify-center gap-1.5"
              >
                Tüm Soruları Gör ({total})
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   SKELETON
   ============================================================ */
const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-[#FAF6F0]">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="lg:w-[55%]">
          <Skeleton className="aspect-square rounded-2xl w-full" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-12 w-48 mt-4" />
          <Skeleton className="h-40 w-full rounded-2xl mt-4" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================
   NOT FOUND
   ============================================================ */
const ProductNotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
    <div className="w-20 h-20 rounded-full bg-[#E8D5C4]/50 flex items-center justify-center mb-6">
      <ShoppingCart className="w-8 h-8 text-[#8B5A2B]" />
    </div>
    <h2 className="text-2xl font-heading font-bold text-[#3D2914] mb-2">Ürün Bulunamadı</h2>
    <p className="text-[#8B5A2B] mb-6">Bu ürün mevcut değil veya kaldırılmış olabilir.</p>
    <Link
      to="/products"
      className="px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors"
    >
      Ürünlere Dön
    </Link>
  </div>
);

export default ProductDetail;
