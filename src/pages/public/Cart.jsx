import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Minus, Plus, ChevronRight,
  ShoppingBag, Truck, ShieldCheck, Tag,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Skeleton } from '../../components/ui/skeleton';

const Cart = () => {
  const navigate = useNavigate();
  const { items, subtotal, isLoading } = useCart();

  const freeShippingThreshold = 500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (isLoading) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Sepetiniz Boş"
        description="Henüz sepetinize ürün eklememişsiniz. Ürünlerimize göz atın!"
        actionText="Alışverişe Başla"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#3D2914]">
            Sepetim
          </h1>
          <p className="text-[#8B5A2B] mt-1 text-sm sm:text-base">{items.length} ürün</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 ? (
          <div className="bg-white rounded-xl p-4 card-shadow mb-6 flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#C67D4A] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#3D2914]">
                <span className="font-semibold">{remainingForFreeShipping.toLocaleString('tr-TR')}₺</span> daha ekleyin, <span className="font-semibold text-[#4A5D23]">ücretsiz kargo</span> kazanın!
              </p>
              <div className="h-1.5 rounded-full bg-[#E8D5C4]/50 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C67D4A] transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#4A5D23]/10 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#4A5D23] shrink-0" />
            <p className="text-sm text-[#4A5D23] font-medium">Tebrikler! Ücretsiz kargo kazandınız.</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Clear All */}
            <div className="flex justify-end mb-1">
              <ClearCartButton />
            </div>

            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-[360px] shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="p-5 sm:p-6">
                <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-5">Sipariş Özeti</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#8B5A2B]">
                    <span>Ara Toplam ({items.length} ürün)</span>
                    <span>{Number(subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺</span>
                  </div>
                  <div className="flex justify-between text-[#8B5A2B]">
                    <span>Kargo</span>
                    <span className={subtotal >= freeShippingThreshold ? 'text-[#4A5D23] font-medium' : ''}>
                      {subtotal >= freeShippingThreshold ? 'Ücretsiz' : '49,90₺'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E8D5C4] my-4" />

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-base font-semibold text-[#3D2914]">Toplam</span>
                  <span className="text-2xl font-bold text-[#C67D4A]">
                    {(subtotal + (subtotal >= freeShippingThreshold ? 0 : 49.90)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-[#C67D4A] text-white font-semibold text-sm sm:text-base hover:bg-[#C67D4A]/90 transition-colors shadow-lg shadow-[#C67D4A]/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Alışverişi Tamamla
                </button>

                <Link
                  to="/products"
                  className="block text-center text-sm text-[#8B5A2B] hover:text-[#C67D4A] font-medium mt-4 transition-colors"
                >
                  Alışverişe Devam Et
                </Link>
              </div>

              {/* Trust badges */}
              <div className="bg-[#FAF6F0] px-5 sm:px-6 py-4 flex items-center justify-around gap-4">
                {[
                  { icon: ShieldCheck, text: 'Güvenli Ödeme' },
                  { icon: Truck, text: 'Hızlı Kargo' },
                  { icon: Tag, text: 'En İyi Fiyat' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1">
                    <Icon className="w-4 h-4 text-[#C67D4A]" />
                    <span className="text-[0.6rem] sm:text-[0.65rem] text-[#8B5A2B] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CART ITEM
   ============================================================ */
const CartItem = ({ item }) => {
  const { updateItem, removeItem, updatePending, removePending } = useCart();

  const lineTotal = item.unit_price * item.quantity;
  const isUpdating = updatePending;
  const isRemoving = removePending;

  return (
    <div className={`bg-white rounded-2xl card-shadow p-4 sm:p-5 transition-opacity ${isRemoving ? 'opacity-50' : ''}`}>
      <div className="flex gap-3 sm:gap-4">
        {/* Image */}
        <Link to={`/product/${item.slug}`} className="shrink-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#FAF6F0]">
            <img
              src={item.primary_thumbnail || item.primary_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=200&h=200&fit=crop'}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Name + Remove */}
          <div className="flex justify-between gap-2 mb-1">
            <Link
              to={`/product/${item.slug}`}
              className="text-sm sm:text-base font-semibold text-[#3D2914] hover:text-[#C67D4A] transition-colors line-clamp-2 leading-snug"
            >
              {item.name}
            </Link>
            <button
              onClick={() => removeItem(item.id)}
              disabled={isRemoving}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#8B5A2B]/50 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Dimensions */}
          {item.selected_width_cm && item.selected_height_cm && (
            <p className="text-xs text-[#8B5A2B] mb-1.5">
              Boyut: {item.selected_width_cm} x {item.selected_height_cm} cm
            </p>
          )}

          {/* Unit Price */}
          <p className="text-xs text-[#8B5A2B] mb-auto">
            Birim: {Number(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
          </p>

          {/* Bottom: Quantity + Total */}
          <div className="flex items-center justify-between mt-3 gap-2">
            {/* Quantity */}
            <div className="flex items-center border border-[#E8D5C4] rounded-lg overflow-hidden">
              <button
                onClick={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#3D2914] hover:bg-[#E8D5C4]/40 transition-colors disabled:opacity-30"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`w-9 sm:w-10 h-8 sm:h-9 flex items-center justify-center text-sm font-semibold text-[#3D2914] border-x border-[#E8D5C4] ${isUpdating ? 'opacity-50' : ''}`}>
                {item.quantity}
              </span>
              <button
                onClick={() => item.quantity < item.stock_quantity && updateItem(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock_quantity || isUpdating}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#3D2914] hover:bg-[#E8D5C4]/40 transition-colors disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Line Total */}
            <span className="text-base sm:text-lg font-bold text-[#C67D4A]">
              {lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CLEAR CART BUTTON
   ============================================================ */
const ClearCartButton = () => {
  const [confirming, setConfirming] = useState(false);
  const { clearAll, clearPending } = useCart();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#8B5A2B]">Sepeti temizle?</span>
        <button
          onClick={() => { clearAll(); setConfirming(false); }}
          disabled={clearPending}
          className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
        >
          Evet
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1 rounded-lg border border-[#E8D5C4] text-[#8B5A2B] text-xs font-medium hover:bg-[#E8D5C4]/30 transition-colors"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs text-[#8B5A2B]/60 hover:text-red-500 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" /> Sepeti Temizle
    </button>
  );
};

/* ============================================================
   EMPTY STATE
   ============================================================ */
const EmptyState = ({ title, description, actionText, actionLink }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-page-in">
    <div className="w-20 h-20 rounded-full bg-[#E8D5C4]/50 flex items-center justify-center mb-6">
      <ShoppingBag className="w-8 h-8 text-[#8B5A2B]" />
    </div>
    <h2 className="text-2xl font-heading font-bold text-[#3D2914] mb-2">{title}</h2>
    <p className="text-[#8B5A2B] mb-6 text-center max-w-md">{description}</p>
    <Link
      to={actionLink}
      className="px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors"
    >
      {actionText}
    </Link>
  </div>
);

/* ============================================================
   SKELETON
   ============================================================ */
const CartSkeleton = () => (
  <div className="min-h-screen bg-[#FAF6F0]">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-10 w-40 mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 card-shadow flex gap-4">
              <Skeleton className="w-28 h-28 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-24" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:w-[360px]">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export default Cart;
