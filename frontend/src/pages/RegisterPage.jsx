import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/errorHandler';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created! Now add your skills.');
      navigate('/profile', { replace: true });
    } catch (err) {
      setServerError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const fields = [
    { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Your name' },
    { id: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@college.edu' },
    { id: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', placeholder: 'At least 6 characters' },
    { id: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
  ];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join HackMate and start forming your dream team."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
        {fields.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="label">{f.label}</label>
            <input id={f.id} type={f.type} autoComplete={f.autoComplete} placeholder={f.placeholder}
              className="input" value={form[f.id]} onChange={update(f.id)} />
            {errors[f.id] && <p className="field-error">{errors[f.id]}</p>}
          </div>
        ))}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner size={16} />} {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
