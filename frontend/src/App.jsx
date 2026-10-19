import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function Placeholder({ title }) {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-slate-600">Logged in as {user?.name} ({user?.role})</p>
      <button className="btn-secondary mt-4" onClick={logout}>Log out</button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Placeholder title="Dashboard" />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/hackathons" element={<Placeholder title="Admin" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
