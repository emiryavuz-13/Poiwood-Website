import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Heart, X, ChevronRight, Undo2 } from 'lucide-react';

let showToastGlobal = null;

/**
 * type: 'cart' | 'favorite-add' | 'favorite-remove'
 * product: { name, primary_image, displayPrice? }
 * onUndo: optional callback for undo action
 */
export const triggerToast = (type, product, onUndo) => {
  if (showToastGlobal) showToastGlobal({ type, product, onUndo });
};

// Kısa yollar
export const triggerCartToast = (product) => triggerToast('cart', product);
export const triggerFavoriteToast = (product, added = true, onUndo) =>
  triggerToast(added ? 'favorite-add' : 'favorite-remove', product, onUndo);

const CONFIGS = {
  cart: {
    icon: CheckCircle2,
    iconColor: 'text-[#4A5D23]',
    title: 'Sepete Eklendi',
    actionLabel: 'Sepete Git',
    actionLink: '/cart',
  },
  'favorite-add': {
    icon: Heart,
    iconColor: 'text-red-500',
    title: 'Favorilere Eklendi',
    actionLabel: 'Favorilere Git',
    actionLink: '/favorites',
  },
  'favorite-remove': {
    icon: Heart,
    iconColor: 'text-[#8B5A2B]',
    title: 'Favorilerden Çıkarıldı',
  },
};

const Toast = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [data, setData] = useState(null);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setData(null);
    }, 300);
  }, []);

  useEffect(() => {
    showToastGlobal = (d) => {
      setData(d);
      setClosing(false);
      setVisible(true);
    };
    return () => { showToastGlobal = null; };
  }, []);

  // Otomatik kapanma
  useEffect(() => {
    if (!visible || closing) return;
    const duration = data?.type === 'cart' ? 4000 : 3000;
    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [visible, closing, close, data]);

  if (!visible || !data) return null;

  const config = CONFIGS[data.type] || CONFIGS.cart;
  const Icon = config.icon;
  const product = data.product;
  const image = product?.primary_thumbnail || product?.primary_image || product?.images?.[0]?.firebase_url || null;
  const isCart = data.type === 'cart';
  const isFavRemove = data.type === 'favorite-remove';

  const handleUndo = () => {
    if (data.onUndo) data.onUndo();
    close();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop — sadece mobilde, sadece cart */}
      {isCart && (
        <div
          className={`absolute inset-0 bg-black/20 pointer-events-auto sm:hidden ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
          onClick={close}
        />
      )}

      {/* Toast panel */}
      <div
        className={`absolute pointer-events-auto
          ${isCart
            ? 'bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-20 sm:right-4 md:right-6 lg:right-8 sm:w-[380px] sm:rounded-2xl rounded-t-2xl'
            : 'top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 md:right-6 lg:right-8 w-[calc(100%-2rem)] sm:w-[360px] rounded-2xl'
          }
          bg-white shadow-2xl shadow-black/15
          ${closing
            ? (isCart ? 'animate-slide-out-bottom sm:animate-fade-out' : 'animate-fade-out')
            : (isCart ? 'animate-slide-in-bottom sm:animate-fade-in' : 'animate-fade-in')
          }`}
      >
        {/* Drag handle — mobilde, sadece cart */}
        {isCart && (
          <div className="flex justify-center pt-2 pb-0 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-[#E8D5C4]" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
          <div className={`flex items-center gap-2 ${config.iconColor}`}>
            <Icon className="w-5 h-5" fill={data.type === 'favorite-add' ? 'currentColor' : 'none'} />
            <span className="text-sm font-semibold">{config.title}</span>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8B5A2B]/40 hover:text-[#3D2914] hover:bg-[#E8D5C4]/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product */}
        {product && (
          <div className="px-4 sm:px-5 pb-3 flex gap-3 items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0">
              {image ? (
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#E8D5C4]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#3D2914] line-clamp-2 leading-snug">{product.name}</p>
              {product.displayPrice && (
                <p className="text-sm font-bold text-[#C67D4A] mt-0.5">{product.displayPrice}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2.5">
          {isFavRemove ? (
            <>
              <button
                onClick={close}
                className="flex-1 py-2.5 rounded-xl border border-[#E8D5C4] text-[#3D2914] text-sm font-medium hover:bg-[#E8D5C4]/20 transition-colors"
              >
                Tamam
              </button>
              <button
                onClick={handleUndo}
                className="flex-1 py-2.5 rounded-xl bg-[#C67D4A] text-white text-sm font-semibold hover:bg-[#C67D4A]/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <Undo2 className="w-4 h-4" /> Geri Al
              </button>
            </>
          ) : (
            <>
              <button
                onClick={close}
                className="flex-1 py-2.5 rounded-xl border border-[#E8D5C4] text-[#3D2914] text-sm font-medium hover:bg-[#E8D5C4]/20 transition-colors"
              >
                Alışverişe Devam Et
              </button>
              <Link
                to={config.actionLink}
                onClick={close}
                className="flex-1 py-2.5 rounded-xl bg-[#C67D4A] text-white text-sm font-semibold hover:bg-[#C67D4A]/90 transition-colors flex items-center justify-center gap-1.5"
              >
                {config.actionLabel} <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
