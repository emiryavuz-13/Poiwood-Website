import { createElement, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ExternalLink, LayoutDashboard, Menu, PlusCircle, ShoppingCart, Users, X } from 'lucide-react';
import Logo from '../components/Logo';

const links = [
  { to: '/marketer-panel', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/marketer-panel/new-order', label: 'Yeni Sipariş', icon: PlusCircle },
  { to: '/marketer-panel/orders', label: 'Siparişlerim', icon: ShoppingCart },
  { to: '/marketer-panel/customers', label: 'Müşterilerim', icon: Users },
];

export default function MarketerPanelLayout() {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-cream">
      {open && (
        <button
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-light-wood/60 bg-white transition-transform sm:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-light-wood/60 px-4">
          <Link to="/marketer-panel" className="flex items-center gap-2 text-sm font-bold tracking-wide text-walnut">
            <Logo markClassName="w-6 h-6" />
            SATIŞ PANELİ
          </Link>
          <button
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-coffee sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-walnut text-white' : 'text-coffee hover:bg-light-wood/30 hover:text-walnut'
                }`
              }
            >
              {createElement(item.icon, { className: 'h-4 w-4' })}
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/10"
          >
            <ExternalLink className="h-4 w-4" />
            Siteye dön
          </Link>
        </nav>
      </aside>

      <div className="min-h-screen sm:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-light-wood/60 bg-white px-4 sm:px-6">
          <button
            aria-label="Menüyü aç"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-walnut sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-coffee">Pazarlamacı paneli</p>
            <p className="text-sm font-semibold text-walnut">{user?.display_name || user?.email}</p>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
