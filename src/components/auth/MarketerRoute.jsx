import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function MarketerRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Hesap admin tarafından geçici şifreyle açılır; değiştirilmeden panele girilemez.
  if (user?.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Marka panelinden farkı: seçilecek bir varlık yok, pazarlamacı kullanıcının kendisi.
  if (user?.role !== 'marketer') return <Navigate to="/" replace />;

  return <Outlet />;
}
