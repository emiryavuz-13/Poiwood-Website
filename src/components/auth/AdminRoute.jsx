import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Giriş yapmamış kişiyi login ekranına gönder.
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    // Giriş yapmış ama "admin" değilse anasayfaya postalayıp engelle.
    return <Navigate to="/" replace />;
  }

  // Hem giriş yapmış hem de adminse yönetim paneline girişine izin ver.
  return <Outlet />;
};

export default AdminRoute;