import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../lib/firebase';
import { authAPI } from '../../api/auth';
import { login, logout } from '../../store/slices/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await authAPI.syncMe();
          dispatch(login({
            user: data.user,
            token: await firebaseUser.getIdToken(),
            emailVerified: firebaseUser.emailVerified,
          }));
        } catch {
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#C67D4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
};

export default AuthProvider;
