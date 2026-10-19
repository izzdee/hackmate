import { Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Only ADMIN users get through; students are sent back to the dashboard
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const denied = isAuthenticated && !isAdmin;

  useEffect(() => {
    if (denied) toast.error('Admins only', { id: 'admin-only' });
  }, [denied]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
