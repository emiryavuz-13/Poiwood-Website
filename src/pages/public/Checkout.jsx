import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import {
  ChevronRight, ChevronLeft, User, MapPin, CreditCard, Banknote,
  Mail, Phone, Truck, ShieldCheck, CheckCircle2, Package,
  ShoppingBag, AlertCircle,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { createOrder, createGuestOrder } from '../../api/orders';
import { updateProfile } from '../../api/profile';
import { iller, getIlceler } from '../../utils/turkiye-il-ilce';

const STEPS = [
  { id: 'info', label: 'Bilgi', icon: User },
  { id: 'shipping', label: 'Teslimat', icon: MapPin },
  { id: 'payment', label: 'Ödeme', icon: CreditCard },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, emailVerified } = useSelector((state) => state.auth);
  const { items, subtotal, clearAll } = useCart();
  const [step, setStep] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(true);

  const freeShippingThreshold = 500;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 49.90;
  const total = subtotal + shippingFee;

  // Form state
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    apartment: '',
    customerNote: '',
    couponCode: '',
    paymentMethod: 'cod',
  });

  // Giriş yapmış kullanıcı bilgilerini doldur
  useEffect(() => {
    if (isAuthenticated && user) {
      const names = (user.display_name || '').split(' ');
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: names[0] || prev.firstName,
        lastName: names.slice(1).join(' ') || prev.lastName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.email.trim()) e.email = 'E-posta gerekli';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Geçerli bir e-posta girin';
      if (!form.firstName.trim()) e.firstName = 'Ad gerekli';
      else if (form.firstName.trim().length < 2) e.firstName = 'Ad en az 2 karakter olmalıdır';
      else if (form.firstName.trim().length > 50) e.firstName = 'Ad en fazla 50 karakter olabilir';
      if (!form.lastName.trim()) e.lastName = 'Soyad gerekli';
      else if (form.lastName.trim().length < 2) e.lastName = 'Soyad en az 2 karakter olmalıdır';
      else if (form.lastName.trim().length > 50) e.lastName = 'Soyad en fazla 50 karakter olabilir';
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (!form.phone.trim()) e.phone = 'Telefon gerekli';
      else if (!phoneDigits.startsWith('0')) e.phone = 'Telefon numarası 0 ile başlamalıdır';
      else if (phoneDigits.length !== 11) e.phone = 'Telefon numarası 11 haneli olmalıdır (0XXX XXX XX XX)';
    }
    if (step === 1) {
      if (!form.address.trim()) e.address = 'Adres gerekli';
      else if (form.address.trim().length < 10) e.address = 'Adres en az 10 karakter olmalıdır';
      else if (form.address.trim().length > 300) e.address = 'Adres en fazla 300 karakter olabilir';
      if (!form.city) e.city = 'İl seçiniz';
      if (!form.district) e.district = 'İlçe seçiniz';
      if (!form.apartment.trim()) e.apartment = 'Apartman/Daire bilgisi gerekli';
      else if (form.apartment.trim().length > 150) e.apartment = 'En fazla 150 karakter olabilir';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Sipariş oluştur
  const orderMutation = useMutation({
    mutationFn: async () => {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const shippingData = {
        shipping_name: fullName,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_district: form.district,
        shipping_apartment: form.apartment,
        customer_note: form.customerNote || null,
        coupon_code: form.couponCode || null,
      };

      // Telefon numarasını profil bilgilerine kaydet
      if (isAuthenticated && savePhoneToProfile && form.phone && form.phone !== user?.phone) {
        try {
          await updateProfile({ phone: form.phone });
        } catch (_) { /* sessizce devam et */ }
      }

      if (isAuthenticated) {
        return createOrder(shippingData);
      } else {
        return createGuestOrder({
          ...shippingData,
          guest_email: form.email,
          guest_name: fullName,
          guest_phone: form.phone,
          cart_items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            selected_width_cm: i.selected_width_cm,
            selected_height_cm: i.selected_height_cm,
          })),
        });
      }
    },
    onSuccess: (order) => {
      clearAll();
      setCompletedOrder(order);
    },
  });

  const handlePlaceOrder = () => {
    if (isAuthenticated && !emailVerified) return;
    if (validateStep()) orderMutation.mutate();
  };

  // Sepet boşsa yönlendir
  if (!completedOrder && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-page-in">
        <ShoppingBag className="w-16 h-16 text-[#E8D5C4] mb-4" />
        <h2 className="text-2xl font-heading font-bold text-[#3D2914] mb-2">Sepetiniz Boş</h2>
        <p className="text-[#8B5A2B] mb-6">Siparişe devam etmek için ürün ekleyin.</p>
        <Link to="/products" className="px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors">
          Ürünlere Göz At
        </Link>
      </div>
    );
  }

  // Sipariş tamamlandı
  if (completedOrder) {
    return <OrderSuccess order={completedOrder} email={form.email} isGuest={!isAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914]">
            Siparişi Tamamla
          </h1>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pb-12">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div className={`w-8 sm:w-14 lg:w-20 h-[2px] ${isDone ? 'bg-[#4A5D23]' : 'bg-[#E8D5C4]'} transition-colors`} />
                )}
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#C67D4A] text-white shadow-lg shadow-[#C67D4A]/25'
                      : isDone
                        ? 'bg-[#4A5D23] text-white cursor-pointer group-hover:bg-[#4A5D23]/90'
                        : 'bg-[#E8D5C4]/60 text-[#8B5A2B]/40'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium transition-colors ${
                    isActive ? 'text-[#C67D4A]' : isDone ? 'text-[#4A5D23]' : 'text-[#8B5A2B]/40'
                  }`}>
                    {s.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Form */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
              {step === 0 && (
                <StepInfo
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  savePhoneToProfile={savePhoneToProfile}
                  setSavePhoneToProfile={setSavePhoneToProfile}
                />
              )}
              {step === 1 && (
                <StepShipping form={form} setForm={setForm} errors={errors} />
              )}
              {step === 2 && (
                <StepPayment
                  form={form}
                  setForm={setForm}
                  items={items}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  total={total}
                  onPlaceOrder={handlePlaceOrder}
                  isPending={orderMutation.isPending}
                  error={orderMutation.error}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-5 border-t border-[#E8D5C4]/50">
                {step > 0 ? (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#E8D5C4] text-[#3D2914] text-sm font-medium hover:bg-[#E8D5C4]/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Geri
                  </button>
                ) : (
                  <Link
                    to="/cart"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#E8D5C4] text-[#3D2914] text-sm font-medium hover:bg-[#E8D5C4]/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Sepete Dön
                  </Link>
                )}

                {step < 2 ? (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C67D4A] text-white text-sm font-semibold hover:bg-[#C67D4A]/90 transition-colors shadow-lg shadow-[#C67D4A]/20"
                  >
                    Devam Et <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderMutation.isPending}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#4A5D23] text-white text-sm font-semibold hover:bg-[#4A5D23]/90 transition-colors shadow-lg shadow-[#4A5D23]/20 disabled:opacity-60"
                  >
                    {orderMutation.isPending ? 'İşleniyor...' : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Siparişi Onayla
                      </>
                    )}
                  </button>
                )}
              </div>

              {isAuthenticated && !emailVerified && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Sipariş verebilmek için e-posta adresinizi doğrulamanız gerekmektedir. Gelen kutunuzu kontrol edin.
                </div>
              )}

              {orderMutation.isError && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {orderMutation.error?.response?.data?.message || 'Sipariş oluşturulurken bir hata oluştu.'}
                </div>
              )}
            </div>
          </div>

          {/* Sipariş Özeti Sidebar */}
          <div className="lg:w-[340px] shrink-0">
            <OrderSummary items={items} subtotal={subtotal} shippingFee={shippingFee} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   STEP 1 — İLETİŞİM BİLGİLERİ
   ============================================================ */
const StepInfo = ({ form, setForm, errors, isAuthenticated, user, savePhoneToProfile, setSavePhoneToProfile }) => {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const userHasPhone = !!(user?.phone);

  return (
    <div>
      <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-1">İletişim Bilgileri</h2>
      <p className="text-sm text-[#8B5A2B] mb-5">
        {isAuthenticated
          ? 'Hesap bilgileriniz otomatik olarak dolduruldu.'
          : 'Hesap oluşturmadan sipariş verebilirsiniz.'}
      </p>

      <div className="space-y-4">
        <FormField
          label="E-posta"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="ornek@posta.com"
          readOnly={isAuthenticated}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Ad"
            icon={User}
            value={form.firstName}
            onChange={set('firstName')}
            error={errors.firstName}
            placeholder="Adınız"
            readOnly={isAuthenticated}
          />
          <FormField
            label="Soyad"
            icon={User}
            value={form.lastName}
            onChange={set('lastName')}
            error={errors.lastName}
            placeholder="Soyadınız"
            readOnly={isAuthenticated}
          />
        </div>
        <FormField
          label="Telefon"
          icon={Phone}
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          placeholder="05XX XXX XX XX"
          readOnly={isAuthenticated && userHasPhone}
        />

        {/* Telefon profil bilgilerime kaydet checkbox */}
        {isAuthenticated && !userHasPhone && form.phone && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={savePhoneToProfile}
                onChange={(e) => setSavePhoneToProfile(e.target.checked)}
                className="peer sr-only"
              />
              <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                savePhoneToProfile
                  ? 'bg-[#C67D4A] border-[#C67D4A]'
                  : 'border-[#E8D5C4] group-hover:border-[#C67D4A]/50'
              }`}>
                {savePhoneToProfile && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[#3D2914]">Bu telefon numarasını profil bilgilerime kaydet</span>
          </label>
        )}
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-[#8B5A2B] mt-5">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-[#C67D4A] font-semibold hover:underline">Giriş yapın</Link>
        </p>
      )}
    </div>
  );
};

/* ============================================================
   STEP 2 — TESLİMAT ADRESİ
   ============================================================ */
const StepShipping = ({ form, setForm, errors }) => {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const ilceler = getIlceler(form.city);

  const handleCityChange = (e) => {
    setForm((f) => ({ ...f, city: e.target.value, district: '' }));
  };

  return (
    <div>
      <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-1">Teslimat Adresi</h2>
      <p className="text-sm text-[#8B5A2B] mb-5">Siparişinizin gönderileceği adresi girin.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="İl"
            icon={MapPin}
            value={form.city}
            onChange={handleCityChange}
            error={errors.city}
            placeholder="İl seçiniz"
            options={iller}
          />
          <SelectField
            label="İlçe"
            icon={MapPin}
            value={form.district}
            onChange={set('district')}
            error={errors.district}
            placeholder={form.city ? 'İlçe seçiniz' : 'Önce il seçiniz'}
            options={ilceler}
            disabled={!form.city}
          />
        </div>
        <FormField
          label="Adres"
          icon={MapPin}
          value={form.address}
          onChange={set('address')}
          error={errors.address}
          placeholder="Mahalle, Cadde/Sokak, Bina No"
          multiline
        />
        <FormField
          label="Apartman / Daire / Kat"
          icon={MapPin}
          value={form.apartment}
          onChange={set('apartment')}
          error={errors.apartment}
          placeholder="Örn: A Blok, Kat 3, Daire 12"
        />
        <FormField
          label="Sipariş Notu (opsiyonel)"
          icon={Package}
          value={form.customerNote}
          onChange={set('customerNote')}
          placeholder="Kapıda teslim, zil çalınmasın vs."
          multiline
        />
      </div>
    </div>
  );
};

/* ============================================================
   STEP 3 — ÖDEME & ONAY
   ============================================================ */
const StepPayment = ({ form, setForm, items, subtotal, shippingFee, total }) => {
  const fullName = `${form.firstName} ${form.lastName}`.trim();
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-1">Ödeme & Sipariş Onayı</h2>
      <p className="text-sm text-[#8B5A2B] mb-5">Ödeme yönteminizi seçin ve bilgilerinizi kontrol edin.</p>

      {/* Ödeme Yöntemi Seçimi */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-[#3D2914]">Ödeme Yöntemi</h3>

        {/* Kapıda Ödeme */}
        <button
          type="button"
          onClick={() => set('paymentMethod', 'cod')}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
            form.paymentMethod === 'cod'
              ? 'border-[#4A5D23] bg-[#4A5D23]/5'
              : 'border-[#E8D5C4] hover:border-[#D4A574]'
          }`}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            form.paymentMethod === 'cod' ? 'border-[#4A5D23]' : 'border-[#D4A574]'
          }`}>
            {form.paymentMethod === 'cod' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#4A5D23]" />
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#4A5D23]/10 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-[#4A5D23]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#3D2914]">Kapıda Ödeme</p>
            <p className="text-xs text-[#8B5A2B]">Teslimat sırasında nakit veya banka/kredi kartı ile ödeme yapın.</p>
          </div>
        </button>

        {/* Kredi Kartı — Yakında */}
        <div className="relative">
          <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E8D5C4] bg-[#FAF6F0]/50 opacity-60 cursor-not-allowed">
            <div className="w-5 h-5 rounded-full border-2 border-[#E8D5C4] shrink-0" />
            <div className="w-10 h-10 rounded-lg bg-[#E8D5C4]/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-[#8B5A2B]/50" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#3D2914]/50">Kredi / Banka Kartı</p>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C67D4A]/15 text-[#C67D4A] px-2 py-0.5 rounded-full">Yakında</span>
              </div>
              <p className="text-xs text-[#8B5A2B]/50">Güvenli online ödeme ile kredi veya banka kartınızla ödeyin.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Özet kartları */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#3D2914]">Sipariş Bilgileri</h3>

        <SummaryCard title="İletişim" icon={User}>
          <p>{fullName}</p>
          <p className="text-[#8B5A2B]">{form.email}</p>
          <p className="text-[#8B5A2B]">{form.phone}</p>
        </SummaryCard>

        <SummaryCard title="Teslimat Adresi" icon={MapPin}>
          <p>{form.address}</p>
          <p className="text-[#8B5A2B]">{form.apartment}</p>
          <p className="text-[#8B5A2B]">{form.district}, {form.city}</p>
        </SummaryCard>

        {form.customerNote && (
          <SummaryCard title="Sipariş Notu" icon={Package}>
            <p className="text-[#8B5A2B]">{form.customerNote}</p>
          </SummaryCard>
        )}
      </div>

      <p className="text-xs text-[#8B5A2B] mt-5">
        "Siparişi Onayla" butonuna tıklayarak <span className="font-medium text-[#3D2914]">Satış Sözleşmesi</span> ve <span className="font-medium text-[#3D2914]">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
      </p>
    </div>
  );
};

/* ============================================================
   SUMMARY CARD
   ============================================================ */
const SummaryCard = ({ title, icon: Icon, children }) => (
  <div className="flex gap-3 p-3 rounded-xl bg-[#FAF6F0]">
    <Icon className="w-4 h-4 text-[#C67D4A] mt-0.5 shrink-0" />
    <div className="text-sm text-[#3D2914] min-w-0">
      <p className="font-semibold mb-0.5">{title}</p>
      {children}
    </div>
  </div>
);

/* ============================================================
   FORM FIELD
   ============================================================ */
const FormField = ({ label, icon: Icon, type = 'text', value, onChange, error, placeholder, multiline, readOnly }) => {
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <div>
      <label className="text-xs font-medium text-[#3D2914] mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5A2B]/40 pointer-events-none" style={multiline ? { top: '0.875rem', transform: 'none' } : undefined} />
        )}
        <Tag
          type={multiline ? undefined : type}
          value={value}
          onChange={readOnly ? undefined : onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
          rows={multiline ? 3 : undefined}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none transition-colors ${
            readOnly
              ? 'bg-[#FAF6F0] border-[#E8D5C4]/60 text-[#8B5A2B] cursor-not-allowed'
              : error
                ? 'border-red-400 focus:border-red-500 bg-white'
                : 'border-[#E8D5C4] focus:border-[#C67D4A] bg-white'
          } ${multiline ? 'resize-none' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

/* ============================================================
   SELECT FIELD — Custom Searchable Dropdown (İl / İlçe)
   ============================================================ */
const SelectField = ({ label, icon: Icon, value, onChange, error, placeholder, options = [], disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const listRef = React.useRef(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Açılınca aramaya odaklan
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
      setSearch('');
    }
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))
  );

  const handleSelect = (opt) => {
    onChange({ target: { value: opt } });
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium text-[#3D2914] mb-1.5 block">{label}</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        className={`w-full flex items-center gap-2 ${Icon ? 'pl-10' : 'pl-4'} pr-3 py-2.5 rounded-xl border text-sm text-left transition-colors relative ${
          disabled
            ? 'bg-[#FAF6F0] border-[#E8D5C4]/60 cursor-not-allowed opacity-60'
            : open
              ? 'border-[#C67D4A] bg-white ring-1 ring-[#C67D4A]/20'
              : error
                ? 'border-red-400 bg-white'
                : 'border-[#E8D5C4] bg-white hover:border-[#D4A574]'
        }`}
      >
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5A2B]/40" />
        )}
        <span className={`flex-1 truncate ${value ? 'text-[#3D2914]' : 'text-[#8B5A2B]/40'}`}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#8B5A2B]/50 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E8D5C4] rounded-xl shadow-lg shadow-[#3D2914]/8 overflow-hidden animate-fade-in">
          {/* Search */}
          {options.length > 6 && (
            <div className="p-2 border-b border-[#E8D5C4]/50">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara..."
                className="w-full px-3 py-2 rounded-lg bg-[#FAF6F0] border border-[#E8D5C4]/60 text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A]"
              />
            </div>
          )}

          {/* Options list */}
          <ul
            ref={listRef}
            className="max-h-[200px] overflow-y-auto py-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4A574 transparent' }}
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#8B5A2B]/60 text-center">Sonuç bulunamadı</li>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt === value;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#C67D4A]/10 text-[#C67D4A] font-semibold'
                          : 'text-[#3D2914] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

/* ============================================================
   ORDER SUMMARY SIDEBAR
   ============================================================ */
const OrderSummary = ({ items, subtotal, shippingFee, total }) => (
  <div className="sticky top-24 bg-white rounded-2xl card-shadow overflow-hidden">
    <div className="p-5">
      <h3 className="text-base font-heading font-bold text-[#3D2914] mb-4">
        Sipariş Özeti ({items.length} ürün)
      </h3>

      {/* Items */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0 relative">
              <img
                src={item.primary_thumbnail || item.primary_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=100&h=100&fit=crop'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#3D2914] text-white text-[0.6rem] font-bold flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#3D2914] line-clamp-2 leading-snug">{item.name}</p>
              {item.selected_width_cm && item.selected_height_cm && (
                <p className="text-[0.65rem] text-[#8B5A2B]">{item.selected_width_cm}x{item.selected_height_cm} cm</p>
              )}
            </div>
            <span className="text-xs font-semibold text-[#3D2914] shrink-0">
              {(item.unit_price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E8D5C4] pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-[#8B5A2B]">
          <span>Ara Toplam</span>
          <span>{Number(subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺</span>
        </div>
        <div className="flex justify-between text-[#8B5A2B]">
          <span>Kargo</span>
          <span className={shippingFee === 0 ? 'text-[#4A5D23] font-medium' : ''}>
            {shippingFee === 0 ? 'Ücretsiz' : `${shippingFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`}
          </span>
        </div>
      </div>

      <div className="border-t border-[#E8D5C4] mt-3 pt-3 flex justify-between items-baseline">
        <span className="font-semibold text-[#3D2914]">Toplam</span>
        <span className="text-xl font-bold text-[#C67D4A]">
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
        </span>
      </div>
    </div>

    <div className="bg-[#FAF6F0] px-5 py-3 flex items-center justify-around">
      {[
        { icon: ShieldCheck, text: 'Güvenli' },
        { icon: Truck, text: 'Hızlı Kargo' },
      ].map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-[#C67D4A]" />
          <span className="text-[0.65rem] text-[#8B5A2B] font-medium">{text}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ============================================================
   ORDER SUCCESS
   ============================================================ */
const OrderSuccess = ({ order, email, isGuest }) => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 animate-page-in">
    <div className="max-w-lg w-full text-center">
      <div className="w-20 h-20 rounded-full bg-[#4A5D23]/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-[#4A5D23]" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mb-2">
        Siparişiniz Alındı!
      </h1>
      <p className="text-[#8B5A2B] mb-6">
        Siparişiniz başarıyla oluşturuldu. Onay e-postası <span className="font-semibold text-[#3D2914]">{email}</span> adresine gönderildi.
      </p>

      <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6 mb-6 text-left">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#8B5A2B]">Sipariş Numarası</span>
          <span className="text-sm font-bold text-[#3D2914] font-mono">{order.order_number}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#8B5A2B]">Toplam Tutar</span>
          <span className="text-lg font-bold text-[#C67D4A]">
            {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8B5A2B]">Durum</span>
          <span className="text-sm font-medium text-[#4A5D23] bg-[#4A5D23]/10 px-3 py-1 rounded-full">
            Onay Bekliyor
          </span>
        </div>
      </div>

      {isGuest && (
        <div className="bg-[#E8D5C4]/30 rounded-xl p-4 mb-6 text-sm text-[#3D2914]">
          <p className="font-medium mb-1">Sipariş takibi için:</p>
          <p className="text-[#8B5A2B]">
            Sipariş numaranız ve e-posta adresiniz ile siparişinizi takip edebilirsiniz.
            <Link to="/register" className="text-[#C67D4A] font-semibold hover:underline ml-1">
              Hesap oluşturarak
            </Link>{' '}
            tüm siparişlerinizi kolayca yönetebilirsiniz.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/products"
          className="px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors"
        >
          Alışverişe Devam Et
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl border-2 border-[#E8D5C4] text-[#3D2914] font-semibold hover:border-[#C67D4A] hover:text-[#C67D4A] transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  </div>
);

export default Checkout;
