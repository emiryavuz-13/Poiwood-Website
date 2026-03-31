import api from './axios';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();

export const authAPI = {
  // Kullanıcı Kayıt
  register: async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });

    // Token'ı yenile — displayName claim'i güncellensin
    await userCredential.user.getIdToken(true);

    // E-posta doğrulama maili gönder
    await sendEmailVerification(userCredential.user);

    const { data } = await api.post('/auth/sync');
    return { ...data, emailVerified: false };
  },

  // Kullanıcı Giriş
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { data } = await api.post('/auth/sync');
    return { ...data, emailVerified: userCredential.user.emailVerified };
  },

  // Google ile Giriş/Kayıt
  loginWithGoogle: async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const { data } = await api.post('/auth/sync');
    return { ...data, emailVerified: userCredential.user.emailVerified };
  },

  // Doğrulama maili tekrar gönder
  resendVerification: async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  // Şifre sıfırlama maili gönder
  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
  },

  // Çıkış Yap
  logout: async () => {
    await signOut(auth);
  },

  // Mevcut Oturumu Senkronize Et
  syncMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
