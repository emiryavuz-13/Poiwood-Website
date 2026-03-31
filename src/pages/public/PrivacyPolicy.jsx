const sections = [
  {
    title: 'Toplanan Veriler',
    content: `Poiwood olarak, hizmetlerimizi sunabilmek için aşağıdaki kişisel verileri topluyoruz:

• Ad, soyad ve iletişim bilgileri (e-posta, telefon)
• Teslimat adresi bilgileri
• Sipariş geçmişi ve alışveriş tercihleri
• Hesap oluşturma sırasında sağlanan bilgiler
• Web sitemizi ziyaret ettiğinizde toplanan çerez verileri ve IP adresi`,
  },
  {
    title: 'Verilerin Kullanım Amacı',
    content: `Topladığımız kişisel veriler aşağıdaki amaçlarla kullanılmaktadır:

• Siparişlerinizi işleme almak ve teslimatı gerçekleştirmek
• Hesabınızı yönetmek ve güvenliğini sağlamak
• Müşteri destek taleplerini karşılamak
• Yasal yükümlülüklerimizi yerine getirmek
• Hizmet kalitemizi iyileştirmek
• Onayınız doğrultusunda kampanya ve bülten göndermek`,
  },
  {
    title: 'Verilerin Paylaşımı',
    content: `Kişisel verileriniz yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:

• Kargo şirketleri ile teslimat bilgileriniz (ad, adres, telefon)
• Ödeme altyapı sağlayıcısı (PayTR) ile ödeme işlemi için gerekli bilgiler
• Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları

Kişisel verileriniz hiçbir koşulda reklam veya pazarlama amacıyla üçüncü taraflara satılmaz.`,
  },
  {
    title: 'Veri Güvenliği',
    content: `Verilerinizin güvenliği için aşağıdaki önlemleri almaktayız:

• SSL/TLS şifreleme ile güvenli veri iletimi
• Ödeme bilgileri sistemimizde saklanmaz; PayTR PCI-DSS uyumlu altyapı kullanır
• Erişim yetkilendirme ve düzenli güvenlik denetimleri
• Veritabanı şifreleme ve güvenli yedekleme`,
  },
  {
    title: 'Çerezler',
    content: `Web sitemizde kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanılmaktadır. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz. Detaylı bilgi için Çerez Politikası sayfamızı inceleyebilirsiniz.`,
  },
  {
    title: 'Haklarınız',
    content: `6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmiş ise buna ilişkin bilgi talep etme
• Verilerinizin düzeltilmesini veya silinmesini isteme
• İşlemenin kısıtlanmasını talep etme
• Verilerinizin aktarıldığı üçüncü tarafları öğrenme

Bu haklarınızı kullanmak için info@poiwood.com adresine başvurabilirsiniz.`,
  },
  {
    title: 'Politika Güncellemeleri',
    content: `Bu gizlilik politikası en son 1 Mart 2026 tarihinde güncellenmiştir. Politikamızda yapılacak değişiklikler bu sayfada yayımlanacaktır. Önemli değişikliklerde kayıtlı e-posta adresinize bilgilendirme yapılacaktır.`,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      <div className="bg-[#3D2914] py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
          Gizlilik Politikası
        </h1>
        <p className="text-white/70 max-w-md mx-auto px-4">
          Kişisel verilerinizin korunması bizim için önemlidir.
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

export default PrivacyPolicy;
