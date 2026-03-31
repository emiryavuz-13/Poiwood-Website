import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/public/Home';
import ProductsPage from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import CartPage from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import Favorites from './pages/public/Favorites';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminQuestions from './pages/admin/Questions';
import AdminStories from './pages/admin/Stories';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Profile from './pages/public/Profile';
import OrderTracking from './pages/public/OrderTracking';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import ReturnPolicy from './pages/public/ReturnPolicy';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Terms from './pages/public/Terms';
import CookiePolicy from './pages/public/CookiePolicy';
import NotFound from './pages/public/NotFound';
import AuthProvider from './components/auth/AuthProvider';
import Toast from './components/Toast';

function App() {
  return (
    <>
    <Toast />
    <AuthProvider>
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <ScrollToTop />
      <Routes>
        {/* Public Routes - User Face */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/categories" element={<div className="p-24 text-center">Çok Yakında: Müşteri Katalogları</div>} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* SADECE GİRİŞ YAPANLAR İÇİN: */}
          <Route element={<ProtectedRoute />}>
             <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin Routes - Dashboard Face - SADECE ADMINLER İÇİN: */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="stories" element={<AdminStories />} />
          </Route>
        </Route>
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    </AuthProvider>
    </>
  );
}

export default App;
