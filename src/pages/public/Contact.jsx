import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Instagram, Facebook, Twitter, CheckCircle2 } from 'lucide-react';

const contactInfo = [
  { icon: Phone, label: 'Telefon', value: '+90 212 123 45 67', href: 'tel:+902121234567' },
  { icon: Mail, label: 'E-posta', value: 'info@poiwood.com', href: 'mailto:info@poiwood.com' },
  { icon: MapPin, label: 'Adres', value: 'Caferağa Mah. Moda Cad. No:42, Kadıköy / İstanbul' },
  { icon: Clock, label: 'Çalışma Saatleri', value: 'Pzt - Cmt: 09:00 - 18:00' },
];

const socials = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simüle — gerçek backend entegrasyonu eklenebilir
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#3D2914] mb-3">
            Bize Ulaşın
          </h1>
          <p className="text-[#8B5A2B] max-w-[500px] mx-auto">
            Sorularınız, önerileriniz veya özel sipariş talepleriniz için bizimle iletişime geçin.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-5 gap-6">
          {/* İletişim bilgileri */}
          <div className="md:col-span-2 space-y-4">
            {/* Info cards */}
            <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
              <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-4">İletişim Bilgileri</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const Wrapper = item.href ? 'a' : 'div';
                  return (
                    <Wrapper
                      key={item.label}
                      {...(item.href ? { href: item.href } : {})}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#C67D4A]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#C67D4A]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#8B5A2B]/70">{item.label}</p>
                        <p className={`text-sm font-medium text-[#3D2914] ${item.href ? 'group-hover:text-[#C67D4A] transition-colors' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>

            {/* Sosyal medya */}
            <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
              <h3 className="text-sm font-bold text-[#3D2914] mb-3">Sosyal Medya</h3>
              <div className="flex gap-2">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      className="w-10 h-10 rounded-xl bg-[#E8D5C4]/40 flex items-center justify-center text-[#8B5A2B] hover:bg-[#C67D4A] hover:text-white transition-colors"
                      title={s.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Harita */}
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <iframe
                title="Poiwood Konum"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6504900397395!2d29.02517!3d40.98178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9e7a7777c43%3A0x4c76cf3dcc8b330b!2sKad%C4%B1k%C3%B6y%2C%20Istanbul!5e0!3m2!1str!2str!4v1"
                className="w-full h-[200px]"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
              <h2 className="text-lg font-heading font-bold text-[#3D2914] mb-5">Mesaj Gönderin</h2>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#4A5D23]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-[#4A5D23]" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-[#3D2914] mb-2">Mesajınız İletildi</h3>
                  <p className="text-sm text-[#8B5A2B] mb-4">En kısa sürede size dönüş yapacağız.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-[#C67D4A] font-semibold hover:underline"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3D2914] mb-1.5">Adınız Soyadınız</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Ahmet Yılmaz"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8D5C4] text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3D2914] mb-1.5">E-posta</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="ornek@posta.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8D5C4] text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3D2914] mb-1.5">Konu</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A] transition-colors bg-white"
                    >
                      <option value="">Konu seçiniz</option>
                      <option value="siparis">Sipariş Hakkında</option>
                      <option value="urun">Ürün Bilgisi</option>
                      <option value="ozel-siparis">Özel Sipariş</option>
                      <option value="iade">İade / Değişim</option>
                      <option value="oneri">Öneri / Şikayet</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3D2914] mb-1.5">Mesajınız</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Mesajınızı buraya yazabilirsiniz..."
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D5C4] text-sm text-[#3D2914] placeholder:text-[#8B5A2B]/40 focus:outline-none focus:border-[#C67D4A] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sending ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
