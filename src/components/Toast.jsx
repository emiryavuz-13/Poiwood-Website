import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ShoppingBag, Heart, X, ChevronRight, Undo2, Clock3 } from 'lucide-react';
import { setToastHandler } from '../utils/toast';

const CONFIGS = {
  cart: { icon: CheckCircle2, iconColor: 'text-olive', title: 'Sepete Eklendi', actionLabel: 'Sepete Git', actionLink: '/cart' },
  'favorite-add': { icon: Heart, iconColor: 'text-red-500', title: 'Favorilere Eklendi', actionLabel: 'Favorilere Git', actionLink: '/favorites' },
  'favorite-remove': { icon: Heart, iconColor: 'text-coffee', title: 'Favorilerden Çıkarıldı' },
  'action-success': { icon: CheckCircle2, iconColor: 'text-olive', iconBackground: 'bg-olive/10' },
  'action-pending': { icon: Clock3, iconColor: 'text-terracotta', iconBackground: 'bg-terracotta/10' },
  'action-error': { icon: AlertCircle, iconColor: 'text-red-600', iconBackground: 'bg-red-50' },
};

const Toast = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [data, setData] = useState(null);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setData(null);
    }, 300);
  }, []);

  useEffect(() => {
    setToastHandler((nextData) => {
      setData(nextData);
      setClosing(false);
      setVisible(true);
    });
    return () => setToastHandler(null);
  }, []);

  useEffect(() => {
    if (!visible || closing) return undefined;
    const isAction = data?.type?.startsWith('action-');
    const duration = isAction ? 6500 : data?.type === 'cart' ? 4000 : 3000;
    const timer = window.setTimeout(close, duration);
    return () => window.clearTimeout(timer);
  }, [visible, closing, close, data]);

  if (!visible || !data) return null;

  const config = CONFIGS[data.type] || CONFIGS.cart;
  const Icon = config.icon;
  const product = data.product;
  const image = product?.primary_thumbnail || product?.primary_image || product?.images?.[0]?.firebase_url || null;
  const isCart = data.type === 'cart';
  const isFavRemove = data.type === 'favorite-remove';
  const isAction = data.type.startsWith('action-');
  const isError = data.type === 'action-error';

  const handleUndo = () => {
    if (data.onUndo) data.onUndo();
    close();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {isCart && <div className={`absolute inset-0 bg-black/20 pointer-events-auto sm:hidden ${closing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={close} />}

      <div
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        className={`absolute pointer-events-auto bg-white shadow-2xl shadow-walnut/15
          ${isAction
            ? 'left-4 right-4 top-4 mx-auto max-w-md rounded-xl border border-light-wood/70 sm:left-auto sm:right-5 sm:mx-0'
            : isCart
              ? 'bottom-0 left-0 right-0 rounded-t-2xl sm:bottom-auto sm:left-auto sm:right-4 sm:top-20 sm:w-[380px] sm:rounded-2xl md:right-6 lg:right-8'
              : 'left-1/2 top-20 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl sm:left-auto sm:right-4 sm:w-[360px] sm:translate-x-0 md:right-6 lg:right-8'}
          ${closing ? (isCart ? 'animate-slide-out-bottom sm:animate-fade-out' : 'animate-fade-out') : (isCart ? 'animate-slide-in-bottom sm:animate-fade-in' : 'animate-fade-in')}`}
      >
        {isAction ? (
          <div className="flex items-start gap-3 p-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBackground} ${config.iconColor}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-walnut">{data.title}</p>
              {data.message && <p className="mt-1 text-sm leading-5 text-coffee">{data.message}</p>}
            </div>
            <button type="button" onClick={close} aria-label="Bildirimi kapat" className="rounded-lg p-1.5 text-coffee/70 transition-colors hover:bg-cream hover:text-walnut focus:outline-none focus:ring-2 focus:ring-terracotta/40">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            {isCart && <div className="flex justify-center pb-0 pt-2 sm:hidden"><div className="h-1 w-10 rounded-full bg-light-wood" /></div>}
            <div className="flex items-center justify-between px-4 pb-2 pt-3 sm:px-5 sm:pt-4">
              <div className={`flex items-center gap-2 ${config.iconColor}`}>
                <Icon className="h-5 w-5" fill={data.type === 'favorite-add' ? 'currentColor' : 'none'} />
                <span className="text-sm font-semibold">{config.title}</span>
              </div>
              <button onClick={close} aria-label="Bildirimi kapat" className="flex h-7 w-7 items-center justify-center rounded-full text-coffee/40 transition-colors hover:bg-light-wood/40 hover:text-walnut"><X className="h-4 w-4" /></button>
            </div>

            {product && (
              <div className="flex items-center gap-3 px-4 pb-3 sm:px-5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-16 sm:w-16">
                  {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-6 w-6 text-light-wood" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-walnut">{product.name}</p>
                  {product.displayPrice && <p className="mt-0.5 text-sm font-bold text-terracotta">{product.displayPrice}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
              {isFavRemove ? (
                <>
                  <button onClick={close} className="flex-1 rounded-xl border border-light-wood py-2.5 text-sm font-medium text-walnut transition-colors hover:bg-light-wood/20">Tamam</button>
                  <button onClick={handleUndo} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-terracotta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta/90"><Undo2 className="h-4 w-4" /> Geri Al</button>
                </>
              ) : (
                <>
                  <button onClick={close} className="flex-1 rounded-xl border border-light-wood py-2.5 text-sm font-medium text-walnut transition-colors hover:bg-light-wood/20">Alışverişe Devam Et</button>
                  <Link to={config.actionLink} onClick={close} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-terracotta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta/90">{config.actionLabel} <ChevronRight className="h-4 w-4" /></Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Toast;
