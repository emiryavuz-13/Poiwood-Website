import { Link } from 'react-router-dom';
import { TreePine, Heart, Shield, Truck, Users, Award, Leaf, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: TreePine,
    title: 'Doğal Malzeme',
    description: 'Tüm ürünlerimizde %100 doğal, FSC sertifikalı ahşap kullanıyoruz.',
  },
  {
    icon: Heart,
    title: 'El İşçiliği',
    description: 'Her parça ustalarımız tarafından özenle, elle işlenerek üretilir.',
  },
  {
    icon: Shield,
    title: 'Kalite Garantisi',
    description: 'Ürünlerimiz dayanıklılık testlerinden geçer, 2 yıl garantilidir.',
  },
  {
    icon: Leaf,
    title: 'Sürdürülebilir',
    description: 'Çevre dostu üretim süreçleri ve geri dönüştürülebilir ambalaj kullanırız.',
  },
];

const stats = [
  { value: '5.000+', label: 'Mutlu Müşteri' },
  { value: '12.000+', label: 'Teslim Edilen Ürün' },
  { value: '50+', label: 'Benzersiz Tasarım' },
  { value: '4.8', label: 'Ortalama Puan' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Hero — full width */}
      <div className="relative overflow-hidden min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center">
        <img
          src="/images/about-hero.jpg"
          alt="Poiwood atölye"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#3D2914]/60" />
        <div className="relative max-w-[1000px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4 drop-shadow-lg">
            Ahşabın Sıcaklığını<br />Evinize Taşıyoruz
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-[600px] mx-auto leading-relaxed">
            Poiwood, doğanın en güzel dokusunu modern tasarımlarla buluşturarak yaşam alanlarınıza anlam katan el yapımı ahşap ürünler üretir.
          </p>
        </div>
      </div>

      {/* Hikayemiz */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-10 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mb-4">
                Hikayemiz
              </h2>
              <div className="space-y-4 text-[#8B5A2B] leading-relaxed text-sm sm:text-base">
                <p>
                  Poiwood, ahşaba olan tutkumuzdan doğdu. 2023 yılında İstanbul'da küçük bir atölyede başlayan yolculuğumuz, bugün binlerce eve dokunan bir markaya dönüştü.
                </p>
                <p>
                  Her bir ürünümüz, doğanın bize sunduğu eşsiz desenleri koruyarak, modern yaşam alanlarına uyum sağlayacak şekilde tasarlanır. Ceviz, meşe ve çam gibi seçkin ağaç türlerini kullanarak zamansız parçalar ortaya koyuyoruz.
                </p>
                <p>
                  Amacımız sadece bir ürün satmak değil; her parçanın arkasındaki hikayeyi, doğanın dokusunu ve ustanın emeğini evinize taşımaktır.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-[#E8D5C4]/30 aspect-[4/3]">
              <img
                src="/images/about-story.jpg"
                alt="Poiwood atölye"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Değerlerimiz */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] text-center mb-8">
            Değerlerimiz
          </h2>
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

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#3D2914] mb-3">
            Ürünlerimizi Keşfedin
          </h2>
          <p className="text-[#8B5A2B] mb-6 max-w-md mx-auto">
            El yapımı ahşap koleksiyonumuzu inceleyerek evinize doğallık katın.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors"
          >
            Ürünlere Göz At <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
