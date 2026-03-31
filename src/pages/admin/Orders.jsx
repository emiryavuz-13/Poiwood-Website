import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Clock, CreditCard, Truck, CheckCircle2, XCircle,
  ChevronDown, ChevronRight, MapPin, Mail, Phone, User,
  Search, Filter, Send, X, AlertCircle, Loader2,
} from 'lucide-react';
import { getAdminOrders, getAdminOrderDetail, updateOrderStatus, addOrderTracking } from '../../api/admin';

const STATUS_MAP = {
  pending:    { label: 'Onay Bekliyor', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  paid:       { label: 'Ödeme Alındı', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: CreditCard },
  processing: { label: 'Hazırlanıyor', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Package },
  shipped:    { label: 'Kargoda', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Truck },
  delivered:  { label: 'Teslim Edildi', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelled:  { label: 'İptal', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
  refunded:   { label: 'İade', color: 'text-gray-700 bg-gray-100 border-gray-200', icon: XCircle },
};

const ALL_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', filterStatus, page],
    queryFn: () => getAdminOrders({ status: filterStatus || undefined, page, limit: 15 }),
  });

  const orders = data?.orders || data || [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2914]">Sipariş Yönetimi</h1>
          <p className="text-sm text-[#8B5A2B] mt-0.5">Siparişleri görüntüle, durumları güncelle ve kargo bilgisi ekle.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 sm:gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => { setFilterStatus(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            !filterStatus ? 'bg-[#3D2914] text-white' : 'bg-white text-[#8B5A2B] border border-[#E8D5C4] hover:border-[#C67D4A]'
          }`}
        >
          Tümü
        </button>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_MAP[s];
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === s ? 'bg-[#3D2914] text-white' : `bg-white ${cfg.color} border hover:opacity-80`
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-[#E8D5C4]/50 rounded w-1/3 mb-2" />
              <div className="h-4 bg-[#E8D5C4]/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
          <p className="text-[#8B5A2B]">Bu filtreye uygun sipariş bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(orders.length >= 15 || page > 1) && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="px-4 py-2 text-sm text-[#8B5A2B]">Sayfa {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914]"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SİPARİŞ SATIRI
   ============================================================ */
const OrderRow = ({ order, expanded, onToggle }) => {
  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl border border-[#E8D5C4]/50 overflow-hidden">
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full px-3 py-3 sm:px-4 flex items-center gap-2 sm:gap-3 text-left hover:bg-[#FAF6F0]/50 transition-colors"
      >
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${status.color}`}>
          <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#3D2914] font-mono truncate">{order.order_number}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-[#8B5A2B] truncate">
              {order.customer_name || order.user_name || order.guest_name || '—'}
            </span>
            {order.user_id ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">Üye</span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shrink-0">Misafir</span>
            )}
            <span className="text-[11px] text-[#8B5A2B]/60 hidden sm:inline">
              • {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-0.5">
          <span className="text-sm sm:text-base font-bold text-[#C67D4A] whitespace-nowrap">
            {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
          </span>
        </div>

        <ChevronRight className={`w-4 h-4 text-[#8B5A2B]/40 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && <OrderDetail orderId={order.id} currentStatus={order.status} />}
    </div>
  );
};

/* ============================================================
   SİPARİŞ DETAY (LAZY LOADED)
   ============================================================ */
const OrderDetail = ({ orderId, currentStatus }) => {
  const queryClient = useQueryClient();

  const { data: detail, isLoading } = useQuery({
    queryKey: ['adminOrderDetail', orderId],
    queryFn: () => getAdminOrderDetail(orderId),
  });

  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [cargoCompany, setCargoCompany] = useState('');
  const [trackingNo, setTrackingNo] = useState('');

  const statusMutation = useMutation({
    mutationFn: () => updateOrderStatus(orderId, { status: newStatus, admin_note: adminNote || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderId] });
      setNewStatus('');
      setAdminNote('');
    },
  });

  const trackingMutation = useMutation({
    mutationFn: () => addOrderTracking(orderId, { cargo_company: cargoCompany, cargo_tracking_no: trackingNo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderId] });
      setCargoCompany('');
      setTrackingNo('');
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 border-t border-[#E8D5C4]/50 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#C67D4A]" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="border-t border-[#E8D5C4]/50 bg-[#FAF6F0]/30 px-4 py-4 space-y-4">
      {/* Müşteri bilgisi */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-[#8B5A2B]/70 uppercase tracking-wide mb-2 flex items-center gap-2">
            Müşteri
            {detail.user_id ? (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 normal-case tracking-normal">Üye</span>
            ) : (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 normal-case tracking-normal">Misafir</span>
            )}
          </h4>
          <div className="space-y-1.5 text-sm text-[#3D2914]">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#C67D4A]" />
              {detail.user_name || detail.guest_name || detail.shipping_name || '—'}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C67D4A]" />
              {detail.user_email || detail.guest_email || '—'}
            </div>
            {(detail.user_phone || detail.guest_phone || detail.shipping_phone) && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C67D4A]" />
                {detail.user_phone || detail.guest_phone || detail.shipping_phone}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[#8B5A2B]/70 uppercase tracking-wide mb-2">Teslimat</h4>
          <div className="space-y-1.5 text-sm text-[#3D2914]">
            {detail.shipping_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C67D4A] mt-0.5" />
                <span>{detail.shipping_address}{detail.shipping_apartment ? ` (${detail.shipping_apartment})` : ''}, {detail.shipping_district}/{detail.shipping_city}</span>
              </div>
            )}
            {detail.cargo_company && (
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C67D4A]" />
                {detail.cargo_company} — <span className="font-mono text-xs">{detail.cargo_tracking_no}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ürünler */}
      <div>
        <h4 className="text-xs font-semibold text-[#8B5A2B]/70 uppercase tracking-wide mb-2">Ürünler ({detail.items?.length})</h4>
        <div className="space-y-1.5">
          {detail.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
                <img
                  src={item.product_image_url || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=80&h=80&fit=crop'}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3D2914] line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-[#8B5A2B]">
                  {item.quantity} adet × {Number(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                  {item.selected_width_cm && ` • ${item.selected_width_cm}×${item.selected_height_cm} cm`}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#3D2914] shrink-0">
                {Number(item.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8D5C4]/50">
        {/* Durum güncelle */}
        <div>
          <h4 className="text-xs font-semibold text-[#8B5A2B]/70 uppercase tracking-wide mb-2">Durum Güncelle</h4>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] bg-white focus:outline-none focus:border-[#C67D4A] mb-2"
          >
            <option value="">Durum seçin</option>
            {ALL_STATUSES.filter((s) => s !== currentStatus).map((s) => (
              <option key={s} value={s}>{STATUS_MAP[s].label}</option>
            ))}
          </select>
          <input
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Admin notu (opsiyonel)"
            className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A] mb-2"
          />
          <button
            onClick={() => statusMutation.mutate()}
            disabled={!newStatus || statusMutation.isPending}
            className="w-full py-2 rounded-lg bg-[#3D2914] text-white text-sm font-medium hover:bg-[#3D2914]/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {statusMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Güncelle
          </button>
          {statusMutation.isError && (
            <p className="text-xs text-red-500 mt-1">{statusMutation.error?.response?.data?.message || 'Hata oluştu'}</p>
          )}
          {statusMutation.isSuccess && (
            <p className="text-xs text-green-600 mt-1">Durum güncellendi.</p>
          )}
        </div>

        {/* Kargo bilgisi */}
        <div>
          <h4 className="text-xs font-semibold text-[#8B5A2B]/70 uppercase tracking-wide mb-2">Kargo Bilgisi</h4>
          <select
            value={cargoCompany}
            onChange={(e) => setCargoCompany(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] bg-white focus:outline-none focus:border-[#C67D4A] mb-2"
          >
            <option value="">Kargo firması seçin</option>
            <option value="Aras Kargo">Aras Kargo</option>
            <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
            <option value="MNG Kargo">MNG Kargo</option>
            <option value="PTT Kargo">PTT Kargo</option>
            <option value="Sürat Kargo">Sürat Kargo</option>
            <option value="Trendyol Express">Trendyol Express</option>
            <option value="HepsiJet">HepsiJet</option>
          </select>
          <input
            value={trackingNo}
            onChange={(e) => setTrackingNo(e.target.value)}
            placeholder="Takip numarası"
            className="w-full px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A] mb-2"
          />
          <button
            onClick={() => trackingMutation.mutate()}
            disabled={!cargoCompany || !trackingNo || trackingMutation.isPending}
            className="w-full py-2 rounded-lg bg-[#C67D4A] text-white text-sm font-medium hover:bg-[#C67D4A]/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {trackingMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
            Kargo Ekle
          </button>
          {trackingMutation.isError && (
            <p className="text-xs text-red-500 mt-1">{trackingMutation.error?.response?.data?.message || 'Hata oluştu'}</p>
          )}
          {trackingMutation.isSuccess && (
            <p className="text-xs text-green-600 mt-1">Kargo bilgisi eklendi.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
