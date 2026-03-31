const sections = [
  {
    title: 'Çerez Nedir?',
    content: `Çerezler, web sitelerinin tarayıcınıza kaydettiği küçük metin dosyalarıdır. Bu dosyalar, siteyi tekrar ziyaret ettiğinizde sizi tanımamıza ve deneyiminizi kişiselleştirmemize yardımcı olur.`,
  },
  {
    title: 'Kullandığımız Çerez Türleri',
    content: `Zorunlu Çerezler
Sitenin düzgün çalışması için gerekli olan çerezlerdir. Sepet bilgileriniz, oturum durumunuz ve güvenlik ayarlarınız bu çerezler aracılığıyla yönetilir. Bu çerezler olmadan site düzgün çalışamaz.

Analitik Çerezler
Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olan çerezlerdir. Google Analytics aracılığıyla anonim ziyaret istatistikleri toplarız. Bu veriler siteyi iyileştirmek için kullanılır.

İşlevsel Çerezler
Dil tercihi, bölge seçimi ve görünüm ayarlarınız gibi tercihlerinizi hatırlamamızı sağlar. Bu sayede her ziyaretinizde tercihlerinizi yeniden ayarlamanız gerekmez.`,
  },
  {
    title: 'Üçüncü Taraf Çerezleri',
    content: `Sitemizde aşağıdaki üçüncü taraf hizmetlerinin çerezleri kullanılabilir:

• Firebase Authentication — Oturum yönetimi için
• Google Analytics — Anonim site kullanım istatistikleri için
• PayTR — Ödeme işlemi sırasında güvenlik için

Bu hizmetlerin kendi gizlilik politikaları bulunmaktadır.`,
  },
  {
    title: 'Çerez Yönetimi',
    content: `Tarayıcı ayarlarınızdan çerezleri yönetebilir veya tamamen engelleyebilirsiniz. Ancak zorunlu çerezlerin engellenmesi sitenin bazı özelliklerinin çalışmamasına neden olabilir.

Yaygın tarayıcılarda çerez ayarları:
• Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler
• Firefox: Ayarlar → Gizlilik ve Güvenlik
• Safari: Tercihler → Gizlilik
• Edge: Ayarlar → Çerezler ve Site İzinleri`,
  },
  {
    title: 'Veri Saklama Süresi',
    content: `Oturum çerezleri tarayıcınızı kapattığınızda otomatik olarak silinir. Kalıcı çerezler ise türüne göre 30 gün ile 12 ay arasında saklanır. Analitik çerezleri 26 ay süreyle saklanır.`,
  },
  {
    title: 'Politika Güncellemeleri',
    content: `Bu çerez politikası en son 1 Mart 2026 tarihinde güncellenmiştir. Değişiklik yapılması halinde güncel politika bu sayfada yayımlanacaktır.

Sorularınız için info@poiwood.com adresinden bize ulaşabilirsiniz.`,
  },
];

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      <div className="bg-[#3D2914] py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
          Çerez Politikası
        </h1>
        <p className="text-white/70 max-w-md mx-auto px-4">
          Web sitemizde çerezlerin nasıl kullanıldığını öğrenin.
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

export default CookiePolicy;
