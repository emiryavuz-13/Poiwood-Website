import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, Trash2, ShoppingCart, Star, HeartOff } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../hooks/useCart';
import { triggerCartToast, triggerFavoriteToast } from '../../components/Toast';
import { Skeleton } from '../../components/ui/skeleton';

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { favorites, isLoading } = useFavorites();

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Favorilerinizi Görün"
        description="Beğendiğiniz ürünleri favorilere ekleyip takip etmek için giriş yapın."
        actionText="Giriş Yap"
        actionLink="/login"
        secondaryText="Ürünlere Göz At"
        secondaryLink="/products"
      />
    );
  }

  if (isLoading) return <FavoritesSkeleton />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="Favori Listeniz Boş"
        description="Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyin."
        actionText="Ürünlere Göz At"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#3D2914]">
            Favorilerim
          </h1>
          <p className="text-[#8B5A2B] mt-1 text-sm sm:text-base">{favorites.length} ürün</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {favorites.map((item) => (
            <FavoriteCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   FAVORITE CARD
   ============================================================ */
const FavoriteCard = ({ item }) => {
  const { toggleFavorite, addToFavorites, isPending } = useFavorites();
  const { addItem } = useCart();

  const hasDiscount = item.sale_price && Number(item.sale_price) < Number(item.base_price);
  const effectivePrice = hasDiscount ? item.sale_price : item.base_price;
  const price = effectivePrice
    ? `${Number(effectivePrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`
    : 'Fiyat Sorunuz';

  const rating = parseFloat(item.avg_rating) || 0;
  const inStock = item.stock_quantity > 0;

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.product_id);
    triggerFavoriteToast(
      { name: item.name, primary_image: item.primary_image },
      false,
      () => addToFavorites(item.product_id)
    );
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    await addItem({
      product: {
        id: item.product_id,
        name: item.name,
        slug: item.slug,
        primary_image: item.primary_image,
        base_price: item.base_price,
        stock_quantity: item.stock_quantity,
      },
      quantity: 1,
      unit_price: Number(effectivePrice),
    });

    triggerCartToast({
      name: item.name,
      primary_image: item.primary_image,
      displayPrice: price,
    });
  };

  return (
    <Link
      to={`/product/${item.slug}`}
      className="group bg-white rounded-2xl card-shadow overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF6F0]">
        <img
          src={item.primary_thumbnail || item.primary_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" />
        </button>

        {/* Out of stock badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-[#3D2914] text-xs font-semibold px-3 py-1.5 rounded-full">
              Tükendi
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-sm sm:text-base font-semibold text-[#3D2914] line-clamp-2 leading-snug mb-1.5 group-hover:text-[#C67D4A] transition-colors">
          {item.name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-[#D4A574]" fill="#D4A574" />
            <span className="text-xs text-[#8B5A2B]">{rating.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[0.65rem] text-[#8B5A2B]/50 line-through leading-none">
                {Number(item.base_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
              </span>
            )}
            <span className={`text-sm sm:text-base font-bold ${hasDiscount ? 'text-red-500' : 'text-[#C67D4A]'}`}>{price}</span>
          </div>

          {inStock && (
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C67D4A]/10 flex items-center justify-center text-[#C67D4A] hover:bg-[#C67D4A] hover:text-white transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ============================================================
   EMPTY STATE
   ============================================================ */
const EmptyState = ({ title, description, actionText, actionLink, secondaryText, secondaryLink }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-page-in">
    <div className="w-20 h-20 rounded-full bg-[#E8D5C4]/50 flex items-center justify-center mb-6">
      <HeartOff className="w-8 h-8 text-[#8B5A2B]" />
    </div>
    <h2 className="text-2xl font-heading font-bold text-[#3D2914] mb-2">{title}</h2>
    <p className="text-[#8B5A2B] mb-6 text-center max-w-md">{description}</p>
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Link
        to={actionLink}
        className="px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors"
      >
        {actionText}
      </Link>
      {secondaryText && secondaryLink && (
        <Link
          to={secondaryLink}
          className="px-6 py-3 rounded-xl border-2 border-[#E8D5C4] text-[#3D2914] font-semibold hover:border-[#C67D4A] hover:text-[#C67D4A] transition-colors"
        >
          {secondaryText}
        </Link>
      )}
    </div>
  </div>
);

/* ============================================================
   SKELETON
   ============================================================ */
const FavoritesSkeleton = () => (
  <div className="min-h-screen bg-[#FAF6F0]">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-5 w-20 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl card-shadow overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-16" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="w-9 h-9 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Favorites;
