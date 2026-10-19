import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/errorHandler';
import { USE_MOCK } from '../config';

const DEMO_ACCOUNTS = [
  { email: 'aryan@example.com', password: 'password123' },
  { email: 'deeksha@example.com', password: 'password123' },
  { email: 'admin@hackmate.com', password: 'admin123' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setServerError(errorMessage(err)); // toast already shown by the error handler
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back! Log in to continue building your team."
      footer={<>New to HackMate? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={update('email')} placeholder="you@college.edu" />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input" value={form.password} onChange={update('password')} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner size={16} />} {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {USE_MOCK && (
        <div className="mt-6 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 p-3 text-xs text-slate-600">
          <p className="mb-1 font-semibold text-indigo-700">Mock mode demo accounts (click to fill)</p>
          {DEMO_ACCOUNTS.map(({ email, password }) => (
            <button key={email} type="button" className="mr-3 text-indigo-600 hover:underline"
              onClick={() => setForm({ email, password })}>
              {email}
            </button>
          ))}
        </div>
      )}
    </AuthShell>
  );
}
