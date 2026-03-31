import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { login as loginAction } from '../../store/slices/authSlice';
import { clearGuestCart } from '../../store/slices/cartSlice';
import { authAPI } from '../../api/auth';
import { syncGuestCartToServer } from '../../utils/syncGuestCart';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Mail } from 'lucide-react';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor.",
  path: ["confirmPassword"],
});

export default function Register() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const afterAuth = async (res) => {
    dispatch(loginAction({ user: res.user, token: res.token, emailVerified: res.emailVerified }));
    await syncGuestCartToServer();
    dispatch(clearGuestCart());
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError('');

      const res = await authAPI.register(values.email, values.password, values.displayName);
      await afterAuth(res);
      setRegistered(true);
    } catch (err) {
      console.error(err);
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda.');
      } else {
        setError(err.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      const res = await authAPI.loginWithGoogle();
      await afterAuth(res);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google ile giriş sırasında bir hata oluştu.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Sol panel (desktop'ta görünür)
  const BrandPanel = () => (
    <div className="hidden lg:flex lg:w-1/2 relative bg-[#3D2914] items-center justify-center overflow-hidden">
      <img
        src="/images/about-hero.jpg"
        alt="Poiwood"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#3D2914]/80 via-[#3D2914]/60 to-[#C67D4A]/30" />
      <div className="relative z-10 max-w-md px-12 text-white">
        <div className="text-4xl font-heading font-bold mb-6">
          Poi<span className="text-[#D4A574]">wood</span>
        </div>
        <h2 className="text-2xl font-heading font-semibold mb-4 leading-snug">
          Topluluğumuza katılın
        </h2>
        <p className="text-white/70 leading-relaxed mb-8">
          Hesap oluşturarak favori ürünlerinizi kaydedin, siparişlerinizi takip edin ve özel kampanyalardan ilk siz haberdar olun.
        </p>
        <div className="flex gap-6 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            Ücretsiz Üyelik
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            Özel Fırsatlar
          </div>
        </div>
      </div>
    </div>
  );

  // Kayıt başarılı — doğrulama ekranı
  if (registered) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] w-full bg-[#FAF6F0]">
        <BrandPanel />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-md border-0 shadow-none lg:shadow-lg lg:border bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#4A5D23]/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-[#4A5D23]" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[#3D2914] mb-1">E-postanızı Doğrulayın</h2>
                <p className="text-sm text-[#8B5A2B]">
                  <strong>{form.getValues('email')}</strong> adresine bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin.
                </p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full bg-[#C67D4A] hover:bg-[#C67D4A]/90">
                Ana Sayfaya Git
              </Button>
              <p className="text-xs text-muted-foreground">
                E-posta gelmedi mi? Spam klasörünüzü kontrol edin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full bg-[#FAF6F0]">
      <BrandPanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-0 shadow-none lg:shadow-lg lg:border bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading font-bold text-[#3D2914]">Hesap Oluştur</CardTitle>
            <CardDescription>
              Yeni bir hesap oluşturmak için bilgilerinizi giriniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google ile Kayıt */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                'Bağlanıyor...'
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google ile Kayıt Ol
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adınız Soyadınız</FormLabel>
                      <FormControl>
                        <Input placeholder="Ahmet Yılmaz" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input placeholder="ornek@posta.com" type="email" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre (Tekrar)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && <div className="text-sm font-medium text-destructive">{error}</div>}

                <Button type="submit" className="w-full bg-[#C67D4A] hover:bg-[#C67D4A]/90" disabled={isLoading}>
                  {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center text-muted-foreground w-full">
              Zaten bir hesabınız var mı?{' '}
              <Link to="/login" className="text-[#C67D4A] font-medium hover:underline">
                Giriş Yap
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
