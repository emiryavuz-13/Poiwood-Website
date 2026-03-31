import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree, Ticket,
  Star, MessageCircleQuestion, Menu, X, ExternalLink, Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Ürünler', icon: Package },
  { to: '/admin/orders', label: 'Siparişler', icon: ShoppingCart },
  { to: '/admin/categories', label: 'Kategoriler', icon: FolderTree },
  { to: '/admin/coupons', label: 'Kuponlar', icon: Ticket },
  { to: '/admin/reviews', label: 'Yorumlar', icon: Star },
  { to: '/admin/questions', label: 'Sorular', icon: MessageCircleQuestion },
  { to: '/admin/stories', label: 'Hikayeler', icon: Sparkles },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (item) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const NavLinks = ({ onNavigate }) => (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-[#3D2914] text-white'
                : 'text-[#8B5A2B] hover:bg-[#E8D5C4]/30 hover:text-[#3D2914]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#C67D4A] hover:bg-[#C67D4A]/10 transition-colors mt-4"
      >
        <ExternalLink className="w-4 h-4" />
        Siteye Dön
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: fixed, Mobile: slide-in */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8D5C4]/50 flex flex-col transition-transform duration-300 sm:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-14 items-center justify-between border-b border-[#E8D5C4]/50 px-4">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-[#3D2914] text-sm tracking-wide">
            POIWOOD YÖNETİM
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30 sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          <NavLinks onNavigate={() => setSidebarOpen(false)} />
        </nav>
      </aside>

      {/* Main area */}
      <div className="sm:pl-64 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-white border-b border-[#E8D5C4]/50 px-4 sm:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#3D2914] hover:bg-[#E8D5C4]/30"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-[#3D2914] tracking-wide">POIWOOD</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
