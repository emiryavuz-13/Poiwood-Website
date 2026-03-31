import { Link } from 'react-router-dom';
import { RotateCcw, Clock, PackageCheck, AlertCircle, Mail } from 'lucide-react';

const steps = [
  {
    icon: Mail,
    title: '1. Başvuru',
    description: 'İade talebinizi iletişim formu veya info@poiwood.com adresinden bize iletin.',
  },
  {
    icon: PackageCheck,
    title: '2. Onay',
    description: 'Talebiniz incelenir ve 24 saat içinde onay veya bilgilendirme yapılır.',
  },
  {
    icon: RotateCcw,
    title: '3. Kargo',
    description: 'Onay sonrası ürünü orijinal ambalajında kargoya verin.',
  },
  {
    icon: Clock,
    title: '4. İade',
    description: 'Ürün tarafımıza ulaştıktan sonra 5 iş günü içinde ödemeniz iade edilir.',
  },
];

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      <div className="bg-[#3D2914] py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
          İade & Değişim Politikası
        </h1>
        <p className="text-white/70 max-w-md mx-auto px-4">
          Memnuniyetiniz bizim için önceliklidir.
        </p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
        {/* İade Süreci */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="bg-white rounded-2xl card-shadow p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#C67D4A]/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#C67D4A]" />
                </div>
                <h3 className="text-sm font-bold text-[#3D2914] mb-1">{step.title}</h3>
                <p className="text-xs text-[#8B5A2B] leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Koşullar */}
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-3">İade Koşulları</h2>
            <ul className="space-y-2 text-sm text-[#8B5A2B] leading-relaxed">
              <li className="flex gap-2"><span className="text-[#C67D4A] mt-1">•</span>Ürünü teslim aldığınız tarihten itibaren <strong>14 gün</strong> içerisinde iade başvurusu yapabilirsiniz.</li>
              <li className="flex gap-2"><span className="text-[#C67D4A] mt-1">•</span>Ürün <strong>kullanılmamış, hasar görmemiş</strong> ve orijinal ambalajında olmalıdır.</li>
              <li className="flex gap-2"><span className="text-[#C67D4A] mt-1">•</span>Özel ölçü ile üretilen ürünlerde iade kabul edilmemektedir (üretim hatası hariç).</li>
              <li className="flex gap-2"><span className="text-[#C67D4A] mt-1">•</span>İade kargo ücreti, ürün hasarı veya hatalı gönderim durumunda tarafımıza, diğer durumlarda alıcıya aittir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-3">Değişim</h2>
            <p className="text-sm text-[#8B5A2B] leading-relaxed">
              Farklı bir ürün veya boyut ile değişim yapmak isterseniz, iade sürecini başlatmanız ve yeni siparişinizi ayrıca oluşturmanız gerekmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-3">Hasarlı Ürün</h2>
            <p className="text-sm text-[#8B5A2B] leading-relaxed">
              Kargo sürecinde hasar görmüş ürünler için teslim tarihinden itibaren <strong>48 saat</strong> içinde fotoğraflı bildirim yapmanız gerekmektedir. Onay sonrası ücretsiz değişim veya tam iade yapılır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-3">İade Ödemesi</h2>
            <p className="text-sm text-[#8B5A2B] leading-relaxed">
              İade onaylanan ürünlerin ödemesi, ürünün depomıza ulaşmasından itibaren <strong>5 iş günü</strong> içerisinde orijinal ödeme yöntemine iade edilir. Kredi kartına iade süresi bankanıza göre değişiklik gösterebilir.
            </p>
          </section>

          <div className="bg-[#FFF8F0] border border-[#E8D5C4] rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#C67D4A] shrink-0 mt-0.5" />
            <p className="text-sm text-[#8B5A2B]">
              Sorularınız için <Link to="/contact" className="text-[#C67D4A] font-medium hover:underline">iletişim sayfamızdan</Link> veya <strong>info@poiwood.com</strong> adresinden bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
