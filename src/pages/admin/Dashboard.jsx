import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, ShoppingCart, Users, Package, Star, MessageCircleQuestion,
  TrendingUp, ChevronRight, Clock, CreditCard, Truck, CheckCircle2, XCircle,
} from 'lucide-react';
import { getDashboardSummary } from '../../api/admin';

const STATUS_MAP = {
  pending:    { label: 'Onay Bekliyor', color: 'text-amber-700 bg-amber-50', icon: Clock },
  paid:       { label: 'Ödeme Alındı', color: 'text-blue-700 bg-blue-50', icon: CreditCard },
  processing: { label: 'Hazırlanıyor', color: 'text-indigo-700 bg-indigo-50', icon: Package },
  shipped:    { label: 'Kargoda', color: 'text-purple-700 bg-purple-50', icon: Truck },
  delivered:  { label: 'Teslim Edildi', color: 'text-green-700 bg-green-50', icon: CheckCircle2 },
  cancelled:  { label: 'İptal', color: 'text-red-700 bg-red-50', icon: XCircle },
  refunded:   { label: 'İade', color: 'text-gray-700 bg-gray-100', icon: XCircle },
};

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getDashboardSummary,
  });

  const summary = data?.summary || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topSellingProducts || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3D2914] mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <StatCard icon={DollarSign} label="Toplam Gelir" value={isLoading ? '—' : `₺${Number(summary.total_revenue || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} color="bg-green-50 text-green-700" />
        <StatCard icon={ShoppingCart} label="Toplam Sipariş" value={isLoading ? '—' : summary.total_orders} color="bg-blue-50 text-blue-700" />
        <StatCard icon={Users} label="Kayıtlı Üye" value={isLoading ? '—' : summary.total_users} color="bg-purple-50 text-purple-700" />
        <StatCard icon={Package} label="Ürün Sayısı" value={isLoading ? '—' : summary.total_products} color="bg-indigo-50 text-indigo-700" />
        <StatCard icon={Star} label="Bekleyen Yorum" value={isLoading ? '—' : summary.pending_reviews} color="bg-amber-50 text-amber-700" />
        <StatCard icon={MessageCircleQuestion} label="Cevaplanmamış Soru" value={isLoading ? '—' : summary.pending_questions} color="bg-rose-50 text-rose-700" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Son siparişler */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E8D5C4]/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8D5C4]/50 flex items-center justify-between">
            <h2 className="font-bold text-[#3D2914]">Son Siparişler</h2>
            <Link to="/admin/orders" className="text-xs text-[#C67D4A] font-semibold hover:underline flex items-center gap-1">
              Tümünü Gör <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#E8D5C4]/30">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse">
                  <div className="h-4 bg-[#E8D5C4]/30 rounded w-1/3 mb-1" />
                  <div className="h-3 bg-[#E8D5C4]/20 rounded w-1/2" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#8B5A2B]">Henüz sipariş yok.</div>
            ) : (
              recentOrders.map((order) => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                return (
                  <Link key={order.id} to="/admin/orders" className="px-5 py-3 flex items-center gap-3 hover:bg-[#FAF6F0]/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-[#3D2914]">{order.order_number}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-[#8B5A2B] mt-0.5">
                        {order.user_name || order.customer_name || '—'} • {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#C67D4A]">
                      ₺{Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* En çok satanlar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8D5C4]/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8D5C4]/50">
            <h2 className="font-bold text-[#3D2914]">En Çok Satanlar</h2>
          </div>
          <div className="divide-y divide-[#E8D5C4]/30">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse">
                  <div className="h-4 bg-[#E8D5C4]/30 rounded w-2/3" />
                </div>
              ))
            ) : topProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#8B5A2B]">Henüz satış yok.</div>
            ) : (
              topProducts.map((product, i) => (
                <div key={product.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#E8D5C4]/50 flex items-center justify-center text-xs font-bold text-[#8B5A2B] shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#E8D5C4]" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium text-[#3D2914] line-clamp-1">{product.name}</span>
                  <span className="text-xs font-semibold text-[#8B5A2B] bg-[#FAF6F0] px-2 py-0.5 rounded">
                    {product.total_sold} adet
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-4">
    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-2`}>
      <Icon className="w-4 h-4" />
    </div>
    <p className="text-xl font-bold text-[#3D2914]">{value}</p>
    <p className="text-xs text-[#8B5A2B] mt-0.5">{label}</p>
  </div>
);

export default Dashboard;
