const sections = [
  {
    title: 'Genel Hükümler',
    content: `Bu web sitesi Poiwood tarafından işletilmektedir. Siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız siteyi kullanmamanızı rica ederiz.

Poiwood, bu kullanım koşullarını önceden bildirimde bulunmaksızın güncelleme hakkını saklı tutar. Güncellenmiş koşullar sitede yayımlandığı tarihten itibaren geçerlidir.`,
  },
  {
    title: 'Hesap Oluşturma',
    content: `• Hesap oluşturmak için 18 yaşını doldurmuş olmanız gerekmektedir.
• Hesap bilgilerinizin doğruluğundan ve güncelliğinden siz sorumlusunuz.
• Hesap güvenliğinizi korumak sizin sorumluluğunuzdadır; şifrenizi kimseyle paylaşmayın.
• Hesabınızda şüpheli bir aktivite fark etmeniz halinde derhal bizimle iletişime geçin.`,
  },
  {
    title: 'Sipariş ve Ödeme',
    content: `• Sipariş verdiğinizde sunulan fiyat ve koşulları kabul etmiş sayılırsınız.
• Ödeme işlemleri PayTR güvenli ödeme altyapısı üzerinden gerçekleştirilir.
• Poiwood, stok durumuna göre siparişi iptal etme veya kısmi gönderim yapma hakkını saklı tutar. Bu durumda müşteri bilgilendirilir ve ödeme iade edilir.
• Fiyatlar ve kampanyalar önceden bildirimde bulunmaksızın değiştirilebilir.`,
  },
  {
    title: 'Teslimat',
    content: `• Siparişler belirtilen tahmini sürede kargoya verilir; bu süre garanti niteliğinde değildir.
• Teslimat sırasında adres bilgilerinin eksiksiz ve doğru olması müşterinin sorumluluğundadır.
• Kargo sürecinde oluşabilecek hasarlar için teslimat anında tutanak tutulmalıdır.`,
  },
  {
    title: 'Fikri Mülkiyet',
    content: `Bu sitedeki tüm içerikler (metin, görsel, logo, tasarım, yazılım) Poiwood'un fikri mülkiyetindedir. İzin alınmadan kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.

Ürün fotoğrafları temsilidir; doğal ahşap ürünlerin renk ve doku farklılıkları olağandır ve iade gerekçesi oluşturmaz.`,
  },
  {
    title: 'Sorumluluk Sınırlaması',
    content: `• Poiwood, web sitesinin kesintisiz veya hatasız çalışacağını garanti etmez.
• Kullanıcıların site üzerinden eriştiği üçüncü taraf bağlantılarından sorumlu değildir.
• Mücbir sebepler (doğal afet, salgın, yasal düzenleme vb.) nedeniyle oluşan gecikme veya aksamalardan sorumluluk kabul edilmez.`,
  },
  {
    title: 'Uyuşmazlık Çözümü',
    content: `Bu koşullardan doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti kanunları geçerlidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
  },
  {
    title: 'İletişim',
    content: `Bu koşullarla ilgili sorularınız için info@poiwood.com adresinden bize ulaşabilirsiniz.

Son güncelleme: 1 Mart 2026`,
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      <div className="bg-[#3D2914] py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
          Kullanım Koşulları
        </h1>
        <p className="text-white/70 max-w-md mx-auto px-4">
          Poiwood web sitesini kullanım şartları.
        </p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-8 space-y-8">
          {sections.map((section, i) => (
            <section key={section.title}>
              <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-3">
                {i + 1}. {section.title}
              </h2>
              <p className="text-sm text-[#8B5A2B] leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Terms;
