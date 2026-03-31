import axios from 'axios';
import { auth } from '../lib/firebase';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Her istekten önce çalışır ve token ekler
api.interceptors.request.use(
  async (config) => {
    // Firebase kullanıcısı var mı diye bak
    const user = auth.currentUser;
    if (user) {
      // Token'i al (forceRefresh false çünkü firebase kendi yönetiyor)
      const token = await user.getIdToken();

      // Token'i Headers'a ekle! İşte sihirli taşıyıcı :)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (import.meta.env.DEV) {
      console.log(`📤 [API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.params || '');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Gelen cevaplarda genel hata yönetimi (örn: 401 Unauthorized ise logout yap)
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 [API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.status, response.data);
    }
    return response;
  },
  async (error) => {
    // Eğer backend "Yetkin yok (401)" veya "Token geçersiz" derse
    if (error.response && error.response.status === 401) {
      // Firebase'den de çıkış yapmasını sağlayabiliriz.
      // await auth.signOut();
      // Yönlendirme mantığı App seviyesinde olacak.
      if (import.meta.env.DEV) {
        console.warn('Oturum süresi dolmuş veya geçersiz! Lütfen tekrar giriş yapın.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
