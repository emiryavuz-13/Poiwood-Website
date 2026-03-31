import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Giriş yapmamış kullanıcıyı login sayfasına yönlendir.
    // Başarılı girişten sonra geldiği yere dönebilmesi için durumu state'ye at.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Giriş yapmışsa gitmek istediği sayfaya (çocuk rotalara / Outlet) izin ver.
  return <Outlet />;
};

export default ProtectedRoute;