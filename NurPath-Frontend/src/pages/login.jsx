import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Assalamualaikum, ${user.name.split(' ')[0]}! 🌙`);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Decorative orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: 'rgba(12, 20, 32, 0.95)', border: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 0 80px rgba(201,168,76,0.07), 0 20px 60px rgba(0,0,0,0.5)' }}>

          {/* Top shine */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />

          {/* Brand */}
          <div className="text-center mb-9 relative">
            <motion.span className="block text-6xl mb-4"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.6))' }}>
              ☽
            </motion.span>
            <h1 className="font-amiri text-4xl mb-1" style={{ color: '#C9A84C' }}>Welcome Back</h1>
            <p className="font-amiri text-lg" style={{ color: '#7A6130', direction: 'rtl' }}>
              أَهْلاً وَسَهْلاً
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
                Email Address
              </label>
              <input
                type="email" className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#3A4A60' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-1">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                : 'Sign In — بِسْمِ اللَّه'
              }
            </button>
          </form>

          <p className="text-center text-sm mt-7" style={{ color: '#3A4A60' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center mt-5 text-xs">
          <Link href="/" style={{ color: '#3A4A60' }} className="hover:text-gold-dim">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
