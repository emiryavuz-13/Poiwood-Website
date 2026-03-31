import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, Clock, Percent, Gift, Truck as TruckIcon, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../api/categories';
import { getFeaturedProducts } from '../../api/products';
import { getStories } from '../../api/stories';
import ProductCard from '../../components/ProductCard';
import StoryViewer from '../../components/StoryViewer';

/* ============================================================
   HERO SLIDER
   ============================================================ */
const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      title: 'Doğanın Zarafeti Evinizde',
      subtitle: 'Yeni Koleksiyon',
      description: 'El işçiliği ile üretilen benzersiz ahşap dekor ürünleri',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&h=900&fit=crop',
      cta: 'Koleksiyonu Keşfet',
    },
    {
      title: 'El Yapımı Ahşap Ürünler',
      subtitle: 'Premium Kalite',
      description: 'Doğal malzemelerle üretilen özel tasarım dekorlar',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&h=900&fit=crop',
      cta: 'Ürünleri İncele',
    },
    {
      title: 'Bahar İndirimi Başladı',
      subtitle: "%40'a Varan İndirim",
      description: 'Sınırlı süre için kaçırmayın',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=900&fit=crop',
      cta: 'Fırsatları Gör',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goPrev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const goNext = () => setCurrent((p) => (p + 1) % slides.length);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[70vh] min-h-[380px] sm:min-h-[450px] lg:min-h-[500px] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(61,41,20,0.85) 0%, rgba(61,41,20,0.4) 50%, transparent 100%)' }} />

      {/* Content — items-start + pt pushes text toward top */}
      <div className="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 flex items-start pt-[15%] sm:pt-[12%] lg:pt-[10%]">
        <div className="max-w-[500px] lg:max-w-[600px]">
          <span className="inline-block bg-[#C67D4A] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            {slide.subtitle}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-3 sm:mb-6">
            {slide.title}
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-white/90 mb-5 sm:mb-8">{slide.description}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-[#3D2914] px-5 sm:px-8 py-2.5 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:scale-105 transition-transform shadow-lg"
          >
            {slide.cta} <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>

      {/* Arrows — hidden for now */}
      {/* <button onClick={goPrev} className="absolute left-2 sm:left-4 top-[60%] sm:top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/15 text-white/70 flex items-center justify-center hover:bg-white/30 hover:text-white active:bg-white/40 transition-colors z-10"><ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" /></button> */}
      {/* <button onClick={goNext} className="absolute right-2 sm:right-4 top-[60%] sm:top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/15 text-white/70 flex items-center justify-center hover:bg-white/30 hover:text-white active:bg-white/40 transition-colors z-10"><ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" /></button> */}

      {/* Dots — hidden for now */}
      {/* <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className="h-2.5 sm:h-3 rounded-full border-none transition-all duration-300" style={{ width: current === i ? '1.5rem' : '0.625rem', background: current === i ? 'var(--color-terracotta)' : 'rgba(255,255,255,0.5)' }} />
        ))}
      </div> */}
    </section>
  );
};

/* ============================================================
   STORY SECTION (Öne Çıkan Story'ler)
   ============================================================ */
const StorySection = () => {
  const { data: groups = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: getStories,
  });

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);

  const openStory = (index) => {
    setSelectedGroup(index);
    setViewerOpen(true);
  };

  if (groups.length === 0) return null;

  return (
    <>
      <section className="w-full bg-[#FAF6F0] border-b border-[#E8D5C4] py-5 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-5 px-6 sm:px-8 min-w-max sm:justify-center">
          {groups.map((group, i) => (
            <button
              key={group.id}
              onClick={() => openStory(i)}
              className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
            >
              <div
                className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-full p-[3px]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-terracotta), var(--color-golden-oak), var(--color-olive-green))',
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#FAF6F0] bg-[#FAF6F0]">
                  <img
                    src={group.cover_image}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[0.75rem] sm:text-[0.8rem] font-semibold whitespace-nowrap text-[#3D2914] max-w-[80px] truncate">
                {group.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {viewerOpen && (
        <StoryViewer
          groups={groups}
          initialGroupIndex={selectedGroup}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
};

/* ============================================================
   KAMPANYA BANNER
   ============================================================ */
const CampaignBanner = () => {
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });

  const campaigns = [
    {
      title: 'Bahar Koleksiyonu',
      subtitle: 'Yeni Sezon',
      description: 'Evinize sıcaklık katacak ahşap dekor ürünlerinde %30 indirim!',
      discount: '%30',
      discountLabel: 'İndirim',
      bg: 'linear-gradient(135deg, #3D2914 0%, #8B5A2B 100%)',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
    },
    {
      title: 'Özel Fırsat',
      subtitle: 'Sadece Bu Hafta',
      description: 'Seçili masa lambaları ve dekoratif objelerde kaçırılmayacak fırsatlar.',
      discount: '%50',
      discountLabel: 'İndirim',
      bg: 'linear-gradient(135deg, #4A5D23 0%, #6B8E23 100%)',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    },
    {
      title: 'Ücretsiz Kargo',
      subtitle: 'Sınırlı Süre',
      description: '250₺ ve üzeri tüm siparişlerinizde kargo bedava!',
      discount: 'BEDAVA',
      discountLabel: 'Kargo',
      bg: 'linear-gradient(135deg, #C67D4A 0%, #E8A87C 100%)',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((p) => {
        let { days, hours, minutes, seconds } = p;
        if (seconds > 0) seconds--;
        else { seconds = 59; if (minutes > 0) minutes--; else { minutes = 59; if (hours > 0) hours--; else { hours = 23; if (days > 0) days--; } } }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % campaigns.length), 6000);
    return () => clearInterval(timer);
  }, [campaigns.length]);

  const camp = campaigns[current];

  return (
    <section className="w-full py-8 md:py-12 bg-[#FAF6F0]">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[#4A5D23] font-semibold text-xs uppercase tracking-widest">Kaçırılmayacak Fırsatlar</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#3D2914] mt-1">Kampanyalar</h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden relative" style={{ background: camp.bg }}>
            {/* BG Image */}
            <div
              className="absolute top-0 right-0 w-[60%] h-full bg-cover bg-center opacity-90 hidden md:block"
              style={{ backgroundImage: `url(${camp.image})` }}
            />
            <div className="absolute inset-0 hidden md:block" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />

            {/* Content */}
            <div className="relative z-10 p-8 h-[480px] flex flex-col justify-center max-w-[500px]">
              <span className="text-white/90 text-xs uppercase tracking-widest mb-2">{camp.subtitle}</span>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-3">{camp.title}</h3>
              <p className="text-white/90 mb-4">{camp.description}</p>

              {/* Discount badge */}
              <div className="inline-flex flex-col items-center bg-[#FAF6F0]/95 backdrop-blur-sm px-5 py-2 rounded-xl w-fit shadow-lg border border-[#D4A574]/30 mb-4">
                <span className="text-[0.6rem] text-[#8B5A2B] uppercase tracking-wider font-medium">{camp.discountLabel}</span>
                <span className="text-[#C67D4A] text-2xl font-bold leading-tight">{camp.discount}</span>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 text-white/90 text-sm mb-3">
                <Clock className="w-4 h-4" /> Kampanya bitimine:
              </div>
              <div className="flex gap-2 mb-5">
                {[
                  { v: timeLeft.days, l: 'Gün' },
                  { v: timeLeft.hours, l: 'Saat' },
                  { v: timeLeft.minutes, l: 'Dk' },
                  { v: timeLeft.seconds, l: 'Sn' },
                ].map((t, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[50px]">
                    <div className="text-white text-xl font-bold leading-none">{String(t.v).padStart(2, '0')}</div>
                    <div className="text-white/70 text-[0.65rem] mt-0.5">{t.l}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-[#3D2914] px-6 py-3 rounded-full font-semibold text-sm w-fit shadow-lg hover:scale-[1.03] transition-transform"
              >
                Kampanyayı İncele <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => setCurrent((p) => (p - 1 + campaigns.length) % campaigns.length)}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-20 hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5 text-[#3D2914]" />
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % campaigns.length)}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-20 hidden md:flex"
          >
            <ChevronRight className="w-5 h-5 text-[#3D2914]" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {campaigns.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2.5 rounded-full border-none transition-all duration-300"
                style={{
                  width: current === i ? '2rem' : '0.625rem',
                  background: current === i ? 'var(--color-terracotta)' : 'var(--color-golden-oak)',
                  opacity: current === i ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   ÖNE ÇIKAN ÜRÜNLER
   ============================================================ */
const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
  });

  return (
    <section className="w-full py-16 md:py-20" style={{ background: 'var(--color-light-wood)', backgroundImage: 'linear-gradient(to bottom, rgba(250,246,240,0.5), rgba(232,213,196,0.3))' }}>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#C67D4A] font-semibold text-sm uppercase tracking-wider">Öne Çıkan Koleksiyon</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#3D2914] mt-2 mb-4">Ürünler</h2>
          <p className="text-[#8B5A2B] max-w-[600px] mx-auto">En çok beğenilen ahşap dekor ürünlerimizi keşfedin.</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#FAF6F0] animate-pulse rounded-2xl" />
              ))
            : products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#3D2914] text-white px-8 py-4 rounded-full font-semibold hover:scale-[1.03] transition-transform"
          >
            Tüm Ürünleri Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   ÖZEL FIRSATLAR
   ============================================================ */
const SpecialOffers = () => {
  const offers = [
    { icon: Percent, title: 'İlk Alışveriş', description: 'Üyeliğinize özel ilk siparişinizde %15 indirim!', code: 'HOSGELDIN15', color: 'linear-gradient(135deg, #C67D4A, #8B5A2B)' },
    { icon: Gift, title: 'Hediye Kazanın', description: '1000₺ üzeri alışverişlerde sürpriz hediye.', badge: 'Sınırlı', color: 'linear-gradient(135deg, #4A5D23, #6B8E23)' },
    { icon: TruckIcon, title: 'Ücretsiz Kargo', description: '500₺ ve üzeri siparişlerde kargo bedava.', badge: 'Sürekli', color: 'linear-gradient(135deg, #D4A574, #C67D4A)' },
  ];

  return (
    <section className="w-full py-16 md:py-20" style={{ background: 'var(--color-light-wood)', backgroundImage: 'linear-gradient(to bottom, rgba(232,213,196,0.3), rgba(250,246,240,0.5))' }}>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#C67D4A] font-semibold text-sm uppercase tracking-wider">Size Özel</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#3D2914] mt-2 mb-4">Özel Fırsatlar</h2>
          <p className="text-[#8B5A2B] max-w-[600px] mx-auto">Poiwood'a özel avantajlardan yararlanın.</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {offers.map((offer, i) => {
            const Icon = offer.icon;
            return (
              <div
                key={i}
                className="rounded-2xl p-7 text-white relative overflow-hidden min-h-[240px] flex flex-col cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300"
                style={{ background: offer.color }}
              >
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 border-4 border-white/10 rounded-full" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 border-4 border-white/10 rounded-full" />

                {offer.badge && (
                  <span className="absolute top-4 right-4 bg-white/25 px-3 py-0.5 rounded-full text-xs font-semibold">
                    {offer.badge}
                  </span>
                )}

                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="font-heading font-bold text-xl mb-2">{offer.title}</h3>
                <p className="text-white/85 text-sm leading-relaxed flex-1">{offer.description}</p>

                {offer.code && (
                  <div className="bg-white/20 rounded-xl p-3 text-center mt-4">
                    <span className="text-[0.625rem] text-white/70 block">Kupon Kodu:</span>
                    <span className="font-mono font-bold text-base tracking-widest">{offer.code}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   HOME PAGE
   ============================================================ */
const Home = () => {
  return (
    <div className="w-full bg-[#FAF6F0]">
      <HeroSlider />
      <StorySection />
      <CampaignBanner />
      <FeaturedProducts />
      <SpecialOffers />
    </div>
  );
};

export default Home;
