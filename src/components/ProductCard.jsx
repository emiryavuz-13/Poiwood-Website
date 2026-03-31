import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useCart } from '../hooks/useCart';
import { triggerCartToast, triggerFavoriteToast } from './Toast';

const ProductCard = ({ product }) => {
  const { id, name, base_price, sale_price, discount_type, discount_value, is_weekly_pick, slug, primary_image, primary_thumbnail, avg_rating, review_count, category_name, stock_quantity } = product;
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  const hasDiscount = sale_price && Number(sale_price) < Number(base_price);
  const effectivePrice = hasDiscount ? sale_price : base_price;
  const inStock = stock_quantity > 0;
  const displayPrice = effectivePrice
    ? `${Number(effectivePrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`
    : 'Fiyat Sorunuz';

  const rating = parseFloat(avg_rating) || 0;
  const reviews = parseInt(review_count) || 0;
  const liked = isAuthenticated && isFavorite(id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    const wasLiked = liked;
    toggleFavorite(id);
    triggerFavoriteToast({ name, primary_image }, !wasLiked);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!base_price || stock_quantity <= 0) return;

    await addItem({
      product: { id, name, slug, primary_image, base_price, stock_quantity },
      quantity: 1,
      unit_price: Number(effectivePrice),
    });

    triggerCartToast({ name, primary_image, displayPrice });
  };

  return (
    <Link to={`/product/${slug || id}`} className="block">
      <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 sm:hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#FAF6F0]">
          <img
            src={primary_thumbnail || primary_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-start gap-1.5">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[0.6rem] sm:text-[0.7rem] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow">
                {discount_type === 'percentage' ? `%${Number(discount_value)}` : `₺${Number(discount_value)}`} İndirim
              </span>
            )}
            {is_weekly_pick && (
              <span className="bg-[#4A5D23] text-white text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wider font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow">
                Haftanın Seçimi
              </span>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:scale-110 transition-transform ${
              liked ? 'text-red-500' : 'text-[#3D2914] hover:text-[#C67D4A]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" fill={liked ? 'currentColor' : 'none'} />
          </button>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-[#3D2914] text-xs font-semibold px-3 py-1.5 rounded-full">
                Tükendi
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          {/* Category */}
          {category_name && (
            <span className="text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wider text-[#8B5A2B] font-medium line-clamp-1">{category_name}</span>
          )}

          {/* Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-1.5 mt-0.5 sm:mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                fill={i < Math.round(rating) ? '#D4A574' : 'transparent'}
                color="#D4A574"
              />
            ))}
            <span className="text-[0.6rem] sm:text-[0.7rem] text-[#8B5A2B] ml-0.5 sm:ml-1">({reviews})</span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-xs sm:text-[0.9rem] text-[#3D2914] mb-1.5 sm:mb-2.5 leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] font-body">
            {name}
          </h3>

          {/* Price + Cart */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[0.65rem] sm:text-xs text-[#8B5A2B]/50 line-through leading-none">
                  {Number(base_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                </span>
              )}
              <span className={`text-sm sm:text-lg font-bold ${hasDiscount ? 'text-red-500' : 'text-[#C67D4A]'}`}>{displayPrice}</span>
            </div>
            {inStock && (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#3D2914] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform flex-shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
