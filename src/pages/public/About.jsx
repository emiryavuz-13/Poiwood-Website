import { Link } from 'react-router-dom';
import {
  TreePine, Heart, Shield, Users, Award, Leaf, ArrowRight,
  Ruler, Hammer, Sparkles, PackageCheck, MapPin, Phone,
} from 'lucide-react';
import { COMPANY } from '../../config/site';

const values = [
  {
    icon: TreePine,
    title: 'Doğru Ahşap',
    description:
      'Her işin ahşabı ayrı seçilir. Ceviz, meşe, kayın ve çam; damarı, rengi ve dayanımı işe uygun olanı atölyeye girer.',
  },
  {
    icon: Ruler,
    title: 'Ölçüye Özel',
    description:
      'Standart ölçüye sığmayan alanlar için milimetrik üretim. Siz ölçüyü girin, fiyatı anında görün — sürpriz yok.',
  },
  {
    icon: Heart,
    title: 'Usta Elinden',
    description:
      'Zımparadan yağlamaya kadar son dokunuşlar hâlâ elle yapılır. Her parça atölyeden çıkmadan tek tek kontrol edilir.',
  },
  {
    icon: Shield,
    title: 'Arkasında Durmak',
    description:
      'Ürünlerimiz dayanıklılık testlerinden geçer ve 2 yıl garantilidir. Bir sorun olursa telefonun ucundayız.',
  },
];

const process = [
  {
    icon: Ruler,
    step: '01',
    title: 'Ölçü ve Tasarım',
    description:
      'Alanınızın ölçüsünü alıyoruz. Ölçüye özel ürünlerde fiyat, siz ölçüyü girdiğiniz anda hesaplanır.',
  },
  {
    icon: Hammer,
    step: '02',
    title: 'Seçim ve Kesim',
    description:
      'Ahşap levha tek tek elden geçirilir; damar yönü ve kusursuz yüzey gözetilerek hassas ölçüde kesilir.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Yüzey İşçiliği',
    description:
      'Kenar bantlama, zımpara ve doğal yağ ya da lake uygulaması. Ahşabın dokusunu kapatmayan, nefes alan bir yüzey.',
  },
  {
    icon: PackageCheck,
    step: '04',
    title: 'Paketleme ve Sevkiyat',
    description:
      'Köşe koruma ve çift kat ambalajla paketlenir, Türkiye’nin her yerine sağlam şekilde ulaştırılır.',
  },
];

const stats = [
  { value: `${COMPANY.experienceYears} Yıl`, label: 'Sektör Deneyimi' },
  { value: '5.000+', label: 'Mutlu Müşteri' },
  { value: '12.000+', label: 'Teslim Edilen Ürün' },
  { value: '4.8', label: 'Ortalama Puan' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Hero — full width */}
      <div className="relative overflow-hidden min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center">
        <img
          src="/images/about-hero.jpg"
          alt="Panelistan atölyesi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#3D2914]/60" />
        <div className="relative max-w-[1000px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-5">
            {COMPANY.foundedYear}’den beri · İstanbul
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4 drop-shadow-lg">
            {COMPANY.experienceYears} Yıldır Ahşabın<br />Dilinden Anlıyoruz
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-[640px] mx-auto leading-relaxed">
            Panelistan, İstanbul Başakşehir’deki atölyesinde ölçüye özel ahşap panel ve dekor
            ürünleri üretir. Seri üretim bandından değil; testerenin, zımparanın ve usta elinin
            geçtiği bir tezgâhtan çıkarız.
          </p>
        </div>
      </div>

      {/* Hikayemiz */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-10 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[#C67D4A] font-semibold text-xs uppercase tracking-widest">
                Hikayemiz
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mt-1 mb-4">
                Talaş kokusuyla başlayan {COMPANY.experienceYears} yıl
              </h2>
              <div className="space-y-4 text-[#8B5A2B] leading-relaxed text-sm sm:text-base">
                <p>
                  Yolculuğumuz {COMPANY.foundedYear} yılında, Başakşehir Keresteciler Sanayi
                  Sitesi’nde tek tezgâhlı küçük bir atölyede başladı. İlk yıllarımızı ustaların
                  yanında, ahşabın hangi mevsimde nasıl çalıştığını ve hangi kesimin yıllar sonra
                  bile düzgün durduğunu öğrenerek geçirdik.
                </p>
                <p>
                  Bugün aynı sanayi sitesinde, çok daha büyük bir atölyede üretim yapıyoruz. Ama
                  değişmeyen bir şey var: her sipariş hâlâ tek tek elden geçiyor. Ceviz, meşe,
                  kayın ve çamı; damarını, rengini ve dayanımını gözeterek seçiyor, milimetrik
                  ölçüde işliyoruz.
                </p>
                <p>
                  Panelistan’ı kurarken amacımız, ahşap ürün almanın günlerce süren bir pazarlığa
                  dönüşmemesi gerektiğini göstermekti. Sitemizde ölçünüzü giriyor, fiyatı anında
                  görüyor ve siparişinizi veriyorsunuz. Arkasında ise {COMPANY.experienceYears} yıllık
                  saha deneyimi, gerçek bir atölye ve adı sanı belli bir ekip duruyor.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-[#E8D5C4]/30 aspect-[4/3]">
              <img
                src="/images/about-story.jpg"
                alt="Panelistan atölyesinde ahşap işçiliği"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Değerlerimiz */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <span className="text-[#C67D4A] font-semibold text-xs uppercase tracking-widest">
              Neden Panelistan
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mt-1">
              Değerlerimiz
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-2xl card-shadow p-5 sm:p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#C67D4A]/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-[#C67D4A]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#3D2914] mb-1.5">{item.title}</h3>
                  <p className="text-xs text-[#8B5A2B] leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Üretim süreci */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <span className="text-[#C67D4A] font-semibold text-xs uppercase tracking-widest">
              Atölyeden Kapınıza
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mt-1">
              Nasıl Üretiyoruz?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {process.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-white rounded-2xl card-shadow p-5 sm:p-6 relative overflow-hidden">
                  <span className="absolute top-3 right-4 text-3xl font-heading font-bold text-[#E8D5C4]/70 select-none">
                    {item.step}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-[#3D2914] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#D4A574]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#3D2914] mb-1.5">{item.title}</h3>
                  <p className="text-xs text-[#8B5A2B] leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="bg-[#3D2914] rounded-2xl p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-heading font-bold text-[#C67D4A]">{stat.value}</p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Atölyemiz */}
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-10 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[#C67D4A] font-semibold text-xs uppercase tracking-widest">
                Atölyemiz
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mt-1 mb-4">
                Kapımız açık
              </h2>
              <p className="text-[#8B5A2B] leading-relaxed text-sm sm:text-base mb-6">
                Ahşabı ekranda görmek yetmez. Malzemeyi elinizle tutmak, yüzey seçeneklerini yan
                yana görmek isterseniz atölyemize bekleriz. Ölçüye özel projelerinizi yerinde
                konuşalım.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#C67D4A]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#C67D4A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B5A2B]/70">Adres</p>
                    <p className="text-sm font-medium text-[#3D2914]">
                      {COMPANY.address.line1}
                      <br />
                      {COMPANY.address.postalCode} {COMPANY.address.district}
                    </p>
                  </div>
                </div>
                <a href={COMPANY.phone.href} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-[#C67D4A]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#C67D4A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B5A2B]/70">Telefon</p>
                    <p className="text-sm font-medium text-[#3D2914] group-hover:text-[#C67D4A] transition-colors">
                      {COMPANY.phone.display}
                    </p>
                  </div>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF6F0] rounded-2xl p-5 text-center">
                <Users className="w-6 h-6 text-[#C67D4A] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#3D2914]">Deneyimli Ekip</p>
                <p className="text-xs text-[#8B5A2B] mt-1">Yılların ustalığı aynı tezgâhta</p>
              </div>
              <div className="bg-[#FAF6F0] rounded-2xl p-5 text-center">
                <Award className="w-6 h-6 text-[#C67D4A] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#3D2914]">Kendi Üretimimiz</p>
                <p className="text-xs text-[#8B5A2B] mt-1">Aracı yok, doğrudan atölyeden</p>
              </div>
              <div className="bg-[#FAF6F0] rounded-2xl p-5 text-center">
                <Leaf className="w-6 h-6 text-[#C67D4A] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#3D2914]">Sürdürülebilir</p>
                <p className="text-xs text-[#8B5A2B] mt-1">Sertifikalı ahşap, geri dönüşümlü ambalaj</p>
              </div>
              <div className="bg-[#FAF6F0] rounded-2xl p-5 text-center">
                <Ruler className="w-6 h-6 text-[#C67D4A] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#3D2914]">Ölçüye Özel</p>
                <p className="text-xs text-[#8B5A2B] mt-1">Milimetrik üretim, şeffaf fiyat</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#3D2914] mb-3">
            Ürünlerimizi Keşfedin
          </h2>
          <p className="text-[#8B5A2B] mb-6 max-w-md mx-auto">
            Ahşap koleksiyonumuzu inceleyin, ölçünüzü girin, fiyatı anında görün.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors"
            >
              Ürünlere Göz At <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E8D5C4] bg-white text-[#3D2914] font-semibold hover:border-[#C67D4A] transition-colors"
            >
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
