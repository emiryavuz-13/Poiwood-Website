import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    category: 'Sipariş & Teslimat',
    questions: [
      {
        q: 'Siparişim ne kadar sürede teslim edilir?',
        a: 'Siparişleriniz, onaylandıktan sonra 3-7 iş günü içerisinde kargoya verilir. Özel üretim ürünlerde bu süre 10-15 iş gününe kadar uzayabilir.',
      },
      {
        q: 'Kargo ücreti ne kadar?',
        a: '500 TL ve üzeri siparişlerde kargo ücretsizdir. Altındaki siparişlerde sabit 49,90 TL kargo ücreti uygulanır.',
      },
      {
        q: 'Siparişimi nasıl takip edebilirim?',
        a: 'Sipariş takibi için üst menüdeki "Sipariş Takibi" sayfasını kullanabilirsiniz. Sipariş numaranız ve e-posta adresinizle durumunuzu öğrenebilirsiniz.',
      },
      {
        q: 'Kapıda ödeme seçeneği var mı?',
        a: 'Şu an için sadece online ödeme (kredi kartı / banka kartı) ile sipariş kabul etmekteyiz.',
      },
    ],
  },
  {
    category: 'Ürünler',
    questions: [
      {
        q: 'Ürünler gerçekten el yapımı mı?',
        a: 'Evet, tüm ürünlerimiz ustalarımız tarafından elle işlenerek üretilmektedir. Her parça benzersizdir ve doğal ahşabın eşsiz dokusunu taşır.',
      },
      {
        q: 'Ürünlerin boyutlarını özelleştirebilir miyim?',
        a: 'Evet, birçok ürünümüz için özel boyut seçeneği sunuyoruz. Ürün sayfasındaki boyut seçeneklerinden istediğiniz ölçüleri belirleyebilirsiniz.',
      },
      {
        q: 'Hangi ahşap türleri kullanılıyor?',
        a: 'Ürünlerimizde başlıca ceviz, meşe, çam ve kayın ağacı kullanmaktayız. Tüm ahşaplar FSC sertifikalı ve sürdürülebilir kaynaklardan temin edilmektedir.',
      },
    ],
  },
  {
    category: 'İade & Değişim',
    questions: [
      {
        q: 'İade koşulları nelerdir?',
        a: 'Ürünü teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve orijinal ambalajında olmak kaydıyla iade edebilirsiniz. Detaylar için İade Politikası sayfamızı inceleyebilirsiniz.',
      },
      {
        q: 'Hasarlı ürün teslim aldım, ne yapmalıyım?',
        a: 'Hasarlı ürün durumunda lütfen 48 saat içinde bizimle iletişime geçin. Fotoğraflı bildirim sonrası ücretsiz değişim veya iade işlemi başlatılacaktır.',
      },
      {
        q: 'İade kargo ücreti kime ait?',
        a: 'Ürün hasarı veya hatalı gönderim durumunda kargo ücreti bize aittir. Müşteri kaynaklı iadelerde kargo ücreti alıcıya aittir.',
      },
    ],
  },
  {
    category: 'Hesap & Güvenlik',
    questions: [
      {
        q: 'Hesap oluşturmadan alışveriş yapabilir miyim?',
        a: 'Evet, misafir olarak sipariş verebilirsiniz. Ancak hesap oluşturarak sipariş geçmişinizi takip edebilir ve favori ürünlerinizi kaydedebilirsiniz.',
      },
      {
        q: 'Ödeme bilgilerim güvende mi?',
        a: 'Ödeme işlemleriniz PayTR altyapısı üzerinden 256-bit SSL şifreleme ile güvenli şekilde gerçekleştirilir. Kart bilgileriniz hiçbir şekilde sistemimizde saklanmaz.',
      },
    ],
  },
];

const AccordionItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#E8D5C4] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm sm:text-base font-medium text-[#3D2914] group-hover:text-[#C67D4A] transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#C67D4A] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 pb-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-[#8B5A2B] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      <div className="bg-[#3D2914] py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-white/70 max-w-md mx-auto px-4">
          Merak ettiğiniz her şeyin cevabı burada.
        </p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
        {faqData.map((section) => (
          <div key={section.category} className="mb-8">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#3D2914] mb-4">
              {section.category}
            </h2>
            <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
              {section.questions.map((item) => (
                <AccordionItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
