import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Assalamualaikum, ${user.name}! 🌙`);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 0 60px rgba(201,168,76,0.06)' }}>

          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />

          {/* Brand */}
          <div className="text-center mb-8">
            <motion.span
              className="block text-5xl mb-3"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.5))' }}>
              ☽
            </motion.span>
            <h1 className="font-amiri text-3xl" style={{ color: '#C9A84C' }}>Welcome Back</h1>
            <p className="font-amiri text-base mt-1" style={{ color: '#7A6130', direction: 'rtl' }}>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In — بسم الله'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#3A4A60' }}>
            No account?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: '#C9A84C' }}>
              Create one
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 p-3 rounded-xl text-center" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.1)' }}>
            <p className="text-xs" style={{ color: '#7A8FA8' }}>
              Admin demo: <strong style={{ color: '#2DD4BF' }}>admin@nurpath.app</strong> / <strong style={{ color: '#2DD4BF' }}>Admin@123</strong>
            </p>
          </div>
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: '#3A4A60' }}>
          <Link href="/" style={{ color: '#7A6130' }}>← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
