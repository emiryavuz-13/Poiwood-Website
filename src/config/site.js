/**
 * Kurumsal bilgiler — tek kaynak.
 * Telefon, adres, e-posta gibi bilgiler sitenin birden çok yerinde (footer,
 * iletişim sayfası, sözleşme metinleri) geçtiği için burada tutulur.
 * Değişiklik gerektiğinde yalnızca bu dosya güncellenir.
 */

export const COMPANY = {
  name: 'Panelistan',
  // Sektördeki deneyim yılı — kuruluş yılından türetilir, elle güncellenmez.
  foundedYear: 2018,
  get experienceYears() {
    return new Date().getFullYear() - this.foundedYear;
  },

  phone: {
    display: '0545 473 90 62',
    href: 'tel:+905454739062',
  },
  email: {
    display: 'info@panelistan.com',
    href: 'mailto:info@panelistan.com',
  },
  address: {
    // Kısa gösterim (footer gibi dar alanlar için)
    short: 'Başakşehir, İstanbul',
    // Tam adres (iletişim sayfası, sözleşmeler)
    line1: 'Keresteciler Sanayi Sitesi 5. Blok No: 30',
    district: 'Başakşehir / İstanbul',
    postalCode: '34490',
    get full() {
      return `${this.line1}, ${this.postalCode} ${this.district}`;
    },
  },
  workingHours: 'Pazartesi - Cumartesi: 09:00 - 18:00',

  social: {
    instagram: 'https://www.instagram.com/panelistann/',
  },
};

// Google Maps gömme adresi — API anahtarı gerektirmeyen sorgu tabanlı embed.
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${COMPANY.address.line1}, ${COMPANY.address.postalCode} ${COMPANY.address.district}`
)}&hl=tr&z=16&output=embed`;
