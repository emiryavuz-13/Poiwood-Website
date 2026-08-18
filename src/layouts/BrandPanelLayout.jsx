import { createElement, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ClipboardCheck, ExternalLink, LayoutDashboard, Menu, MessageCircleQuestion, Package, ShoppingCart, Star, Ticket, X } from 'lucide-react';
import { BrandProvider, useBrand } from '../contexts/BrandContext';

const links = [
  { to: '/brand-panel', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/brand-panel/products', label: 'Ürünler', icon: Package },
  { to: '/brand-panel/approval-history', label: 'Onay Geçmişi', icon: ClipboardCheck },
  { to: '/brand-panel/orders', label: 'Siparişler', icon: ShoppingCart },
  { to: '/brand-panel/coupons', label: 'Kuponlar', icon: Ticket },
  { to: '/brand-panel/reviews', label: 'Yorumlar', icon: Star },
  { to: '/brand-panel/questions', label: 'Sorular', icon: MessageCircleQuestion },
];

function Shell() {
  const [open, setOpen] = useState(false);
  const { memberships, brandId, setBrandId, brand } = useBrand();

  return (
    <div className="min-h-screen bg-cream">
      {open && <button aria-label="Menüyü kapat" className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-light-wood/60 bg-white transition-transform sm:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-light-wood/60 px-4">
          <Link to="/brand-panel" className="text-sm font-bold tracking-wide text-walnut">MARKA PANELİ</Link>
          <button aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-coffee sm:hidden"><X className="h-5 w-5" /></button>
        </div>
        <div className="border-b border-light-wood/60 p-3">
          <label className="mb-1 block text-xs font-medium text-coffee">Aktif marka</label>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full rounded-lg border border-light-wood bg-cream px-3 py-2 text-sm font-medium text-walnut">
            {memberships.map((item) => <option key={item.brand_id} value={item.brand_id}>{item.brand_name}</option>)}
          </select>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-walnut text-white' : 'text-coffee hover:bg-light-wood/30 hover:text-walnut'}`}>
              {createElement(item.icon, { className: 'h-4 w-4' })}{item.label}
            </NavLink>
          ))}
          <Link to="/" className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/10"><ExternalLink className="h-4 w-4" />Siteye dön</Link>
        </nav>
      </aside>
      <div className="min-h-screen sm:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-light-wood/60 bg-white px-4 sm:px-6">
          <button aria-label="Menüyü aç" onClick={() => setOpen(true)} className="rounded-lg p-2 text-walnut sm:hidden"><Menu className="h-5 w-5" /></button>
          <div><p className="text-xs text-coffee">Üretici paneli</p><p className="text-sm font-semibold text-walnut">{brand?.brand_name || 'Marka seçiliyor'}</p></div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

export default function BrandPanelLayout() {
  return <BrandProvider><Shell /></BrandProvider>;
}
