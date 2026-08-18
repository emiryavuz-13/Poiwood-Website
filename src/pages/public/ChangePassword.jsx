import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { setUser } from '../../store/slices/authSlice';

export default function ChangePassword() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Şifre değişimi sonrası kullanıcı kendi paneline döner; hedef role göre belirlenir.
  const panelPath = { brand_manager: '/brand-panel', marketer: '/marketer-panel', platform_admin: '/admin' };
  const homePath = panelPath[user?.role] || '/';

  if (!user?.must_change_password) return <Navigate to={homePath} replace />;

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError('Yeni şifre en az 8 karakter olmalıdır.');
    if (password !== confirm) return setError('Şifreler eşleşmiyor.');
    try {
      setLoading(true); setError('');
      const result = await authAPI.changeTemporaryPassword(password);
      dispatch(setUser(result.user));
      navigate(panelPath[result.user?.role] || homePath, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Şifre değiştirilemedi. Lütfen tekrar giriş yapın.');
    } finally { setLoading(false); }
  };

  return <div className="flex min-h-screen items-center justify-center bg-cream p-5"><form onSubmit={submit} className="w-full max-w-md rounded-xl border border-light-wood bg-white p-6 shadow-sm"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/10 text-terracotta"><KeyRound className="h-5 w-5" /></div><h1 className="font-heading text-2xl font-bold text-walnut">Yeni şifrenizi belirleyin</h1><p className="mt-1 text-sm text-coffee">Geçici şifreniz yalnızca ilk giriş içindi.</p><label className="mt-5 block text-sm font-medium text-walnut">Yeni şifre</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2" autoComplete="new-password" /><label className="mt-4 block text-sm font-medium text-walnut">Yeni şifre tekrar</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-light-wood px-3 py-2" autoComplete="new-password" />{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<button disabled={loading} className="mt-5 w-full rounded-lg bg-terracotta px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? 'Kaydediliyor...' : 'Şifreyi kaydet'}</button></form></div>;
}
