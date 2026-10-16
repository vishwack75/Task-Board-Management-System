import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/store';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
