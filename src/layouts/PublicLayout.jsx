import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Search, ShoppingCart, Heart, User, LogOut, ShieldAlert, Phone, Mail, MapPin, Instagram, Facebook, Twitter, ArrowRight, AlertTriangle } from 'lucide-react';
import { authAPI } from '../api/auth';
import { logout as logoutAction } from '../store/slices/authSlice';
import { setEmailVerified } from '../store/slices/authSlice';
import { auth as firebaseAuth } from '../lib/firebase';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';

const PublicLayout = () => {
  const { isAuthenticated, user, emailVerified } = useSelector((state) => state.auth);
  const { itemCount } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu', error);
    }
  };

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Tüm Ürünlerimiz', path: '/products' },
    { name: 'Tablolar', path: '/products?category=tablolar' },
    { name: 'Hediyelik Eşyalar', path: '/products?category=hediyelik-esyalar' },
    { name: 'Hakkımızda', path: '/about' },
    { name: 'Sipariş Takibi', path: '/order-tracking' },
    { name: 'İletişim', path: '/contact' },
  ];

  const cartCount = itemCount;

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* ========= HEADER ========= */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: isScrolled ? 'rgba(250, 246, 240, 0.95)' : 'rgba(250, 246, 240, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link to="/" className="text-[1.75rem] font-heading font-bold hover:opacity-80 transition-opacity shrink-0" style={{ color: '#3D2914' }}>
              Poi<span style={{ color: '#C67D4A' }}>wood</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-medium text-[0.9375rem] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:transition-all after:duration-300 pb-1"
                  style={{ color: '#3D2914', '--tw-after-bg': '#C67D4A' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#C67D4A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3D2914'}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0 sm:gap-1 ml-auto">
              {/* Search */}
              <button className="hidden md:flex w-10 h-10 rounded-full items-center justify-center hover:bg-[#E8D5C4] transition-colors" style={{ color: '#3D2914' }}>
                <Search className="w-5 h-5" />
              </button>

              {/* User / Login */}
              <Link to={isAuthenticated ? "/profile" : "/login"} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E8D5C4] transition-colors" style={{ color: '#3D2914' }}>
                <User className="w-5 h-5" />
              </Link>

              {/* Favorites */}
              <Link to="/favorites" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E8D5C4] transition-colors relative" style={{ color: '#3D2914' }}>
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E8D5C4] transition-colors relative" style={{ color: '#3D2914' }}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#4A5D23] text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin" className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[#3D2914] hover:bg-amber-100 hover:text-amber-600 transition-colors" title="Admin Paneli">
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}

              {/* Logout */}
              {isAuthenticated && (
                <button onClick={handleLogout} className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[#3D2914] hover:bg-red-50 hover:text-red-500 transition-colors" title="Çıkış Yap">
                  <LogOut className="w-5 h-5" />
                </button>
              )}

              {/* Mobile Menu */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#3D2914]">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8D5C4] bg-[#FAF6F0] animate-in slide-in-from-top-2">
            <nav className="flex flex-col px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 text-[#3D2914] font-medium border-b border-[#E8D5C4]/50 hover:text-[#C67D4A] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-4">
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full gap-2">
                        <ShieldAlert className="w-4 h-4" /> Admin Paneli
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-full gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-4">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full rounded-full">Giriş Yap</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <Button className="w-full rounded-full">Kayıt Ol</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Email verification banner */}
      {isAuthenticated && !emailVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>E-posta adresiniz doğrulanmamış. Sipariş verebilmek için lütfen e-postanızı doğrulayın.</span>
            </div>
            <div className="flex items-center gap-2">
              {resent ? (
                <span className="text-xs text-green-700 font-medium">Gönderildi!</span>
              ) : (
                <button
                  onClick={async () => {
                    setResending(true);
                    try {
                      await authAPI.resendVerification();
                      setResent(true);
                      setTimeout(() => setResent(false), 30000);
                    } catch { }
                    setResending(false);
                  }}
                  disabled={resending}
                  className="text-xs font-medium text-amber-800 underline hover:text-amber-900 disabled:opacity-50"
                >
                  {resending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                </button>
              )}
              <button
                onClick={async () => {
                  setVerifyMsg('');
                  try {
                    await firebaseAuth.currentUser?.reload();
                    if (firebaseAuth.currentUser?.emailVerified) {
                      dispatch(setEmailVerified(true));
                    } else {
                      setVerifyMsg('notVerified');
                      setTimeout(() => setVerifyMsg(''), 5000);
                    }
                  } catch {
                    setVerifyMsg('notVerified');
                    setTimeout(() => setVerifyMsg(''), 5000);
                  }
                }}
                className="text-xs font-medium text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Doğruladım
              </button>
            </div>
            {verifyMsg === 'notVerified' && (
              <p className="text-xs text-red-600 font-medium mt-1 w-full">E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.</p>
            )}
          </div>
        </div>
      )}

      {/* ========= MAIN ========= */}
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      {/* ========= FOOTER ========= */}
      <footer className="w-full bg-[#3D2914] text-white">
        {/* Newsletter */}
        <div className="border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-wrap justify-between items-center gap-8">
            <div>
              <h3 className="font-heading font-bold text-2xl mb-2">Bültenimize Katılın</h3>
              <p className="text-white/70">Yeni ürünler ve kampanyalardan haberdar olun.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white w-[280px] outline-none placeholder:text-white/50 focus:border-terracotta transition-colors"
              />
              <Button className="rounded-full bg-[#C67D4A] hover:bg-[#C67D4A]/90 text-white font-semibold px-6">
                Abone Ol <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="text-3xl font-heading font-bold mb-4">
                Poi<span className="text-[#C67D4A]">wood</span>
              </div>
              <p className="text-white/70 mb-6 max-w-[280px] leading-relaxed">
                El yapımı, doğal ahşap dekor ürünleri ile yaşam alanlarınıza sıcaklık katıyoruz.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                <a href="tel:+902121234567" className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors">
                  <Phone className="w-4 h-4" /> +90 212 123 45 67
                </a>
                <a href="mailto:info@poiwood.com" className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors">
                  <Mail className="w-4 h-4" /> info@poiwood.com
                </a>
                <span className="flex items-center gap-3 text-white/70 text-sm">
                  <MapPin className="w-4 h-4" /> Kadıköy, İstanbul
                </span>
              </div>
              <div className="flex gap-3">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Mağaza', items: [
                { label: 'Tüm Ürünler', to: '/products' },
                { label: 'Çok Satanlar', to: '/products?sort=popular' },
                { label: 'Favoriler', to: '/favorites' },
              ]},
              { title: 'Hesap', items: [
                { label: 'Profilim', to: '/profile' },
                { label: 'Sipariş Takibi', to: '/order-tracking' },
                { label: 'Sepetim', to: '/cart' },
              ]},
              { title: 'Destek', items: [
                { label: 'SSS', to: '/faq' },
                { label: 'İade Politikası', to: '/return-policy' },
                { label: 'İletişim', to: '/contact' },
              ]},
              { title: 'Kurumsal', items: [
                { label: 'Hakkımızda', to: '/about' },
                { label: 'Kullanım Koşulları', to: '/terms' },
                { label: 'Gizlilik Politikası', to: '/privacy-policy' },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[#D4A574] font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to} className="text-white/70 text-sm hover:text-white transition-colors">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-4 text-sm text-white/60">
            <p>&copy; 2026 Poiwood. Tüm hakları saklıdır.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Şartlar</Link>
              <Link to="/cookie-policy" className="hover:text-white transition-colors">Çerezler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
