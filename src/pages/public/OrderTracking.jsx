import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Package, Clock, CreditCard, Truck, CheckCircle2,
  XCircle, MapPin, ChevronRight, AlertCircle, ShoppingBag,
} from 'lucide-react';
import { trackOrder } from '../../api/orders';

const STATUS_STEPS = [
  { key: 'pending', label: 'Onay Bekliyor', icon: Clock },
  { key: 'paid', label: 'Ödeme Alındı', icon: CreditCard },
  { key: 'processing', label: 'Hazırlanıyor', icon: Package },
  { key: 'shipped', label: 'Kargoda', icon: Truck },
  { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle2 },
];

const CANCELLED_STATUSES = ['cancelled', 'refunded'];

const STATUS_MAP = {
  pending: { label: 'Onay Bekliyor', color: 'text-amber-600 bg-amber-50' },
  paid: { label: 'Ödeme Alındı', color: 'text-blue-600 bg-blue-50' },
  processing: { label: 'Hazırlanıyor', color: 'text-indigo-600 bg-indigo-50' },
  shipped: { label: 'Kargoda', color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Teslim Edildi', color: 'text-[#4A5D23] bg-[#4A5D23]/10' },
  cancelled: { label: 'İptal Edildi', color: 'text-red-600 bg-red-50' },
  refunded: { label: 'İade Edildi', color: 'text-gray-600 bg-gray-100' },
};

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await trackOrder(orderNumber.trim());
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914]">
            Sipariş Takibi
          </h1>
          <p className="text-[#8B5A2B] mt-1 text-sm sm:text-base">
            Sipariş numaranızı girerek siparişinizin durumunu takip edin.
          </p>
        </div>
      </div>

      <div className="max-w-[700px] mx-auto px-4 sm:px-6 pb-12">
        {/* Search form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-5 sm:p-6 mb-6">
          <label className="block text-sm font-medium text-[#3D2914] mb-1.5">Sipariş Numarası</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="POI-20260328-XXXX"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D5C4] text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A] transition-colors"
          />

          <button
            type="submit"
            disabled={loading || !orderNumber.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? 'Aranıyor...' : 'Sipariş Sorgula'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Order result */}
        {order && <OrderResult order={order} />}
      </div>
    </div>
  );
};

/* ============================================================
   SİPARİŞ SONUCU
   ============================================================ */
const OrderResult = ({ order }) => {
  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const isCancelled = CANCELLED_STATUSES.includes(order.status);
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-4">
      {/* Order header */}
      <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <p className="text-lg font-bold font-mono text-[#3D2914]">{order.order_number}</p>
            <p className="text-xs text-[#8B5A2B] mt-0.5">
              {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Progress stepper */}
        {!isCancelled && (
          <div className="mb-2">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    {i > 0 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${i <= currentStepIndex ? 'bg-[#4A5D23]' : 'bg-[#E8D5C4]'}`} />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-[#4A5D23] text-white shadow-md'
                          : isActive
                            ? 'bg-[#4A5D23]/20 text-[#4A5D23]'
                            : 'bg-[#E8D5C4]/50 text-[#8B5A2B]/40'
                      }`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] sm:text-xs text-center leading-tight ${
                        isActive ? 'text-[#3D2914] font-medium' : 'text-[#8B5A2B]/50'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled / Refunded message */}
        {isCancelled && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Bu sipariş {order.status === 'cancelled' ? 'iptal edilmiştir' : 'iade edilmiştir'}.</span>
          </div>
        )}
      </div>

      {/* Shipping & cargo */}
      {(order.shipping_city || order.cargo_company) && (
        <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[#3D2914] mb-3">Teslimat Bilgileri</h3>
          <div className="space-y-2 text-sm text-[#8B5A2B]">
            {order.shipping_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#C67D4A]" />
                <span>{order.shipping_address}, {order.shipping_district}/{order.shipping_city}</span>
              </div>
            )}
            {order.cargo_company && (
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 shrink-0 mt-0.5 text-[#C67D4A]" />
                <div>
                  <span className="font-medium text-[#3D2914]">{order.cargo_company}</span>
                  {order.cargo_tracking_no && (
                    <div className="mt-1">
                      <span className="text-xs text-[#8B5A2B]/70">Takip No: </span>
                      <span className="font-mono text-xs font-medium text-[#3D2914] bg-[#FAF6F0] px-2 py-0.5 rounded">
                        {order.cargo_tracking_no}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#3D2914] mb-3">Sipariş İçeriği</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-[#FAF6F0] rounded-xl p-2.5">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                <img
                  src={item.product_image_url || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=100&h=100&fit=crop'}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3D2914] line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-[#8B5A2B]">
                  {item.quantity} adet × {Number(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                </p>
              </div>
              <span className="text-sm font-semibold text-[#3D2914] shrink-0">
                {Number(item.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-[#E8D5C4]/50 flex items-center justify-between">
          <span className="text-sm font-medium text-[#8B5A2B]">Toplam</span>
          <span className="text-lg font-bold text-[#C67D4A]">
            {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
