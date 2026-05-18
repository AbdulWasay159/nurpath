import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', city: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'At least 6 characters required';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password, form.city);
      toast.success('Account created! Welcome to NurPath 🌙');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = pwStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthColor = ['', '#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E'][strength] || '#3A4A60';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="fixed top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: 'rgba(12, 20, 32, 0.95)', border: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 0 80px rgba(201,168,76,0.07), 0 20px 60px rgba(0,0,0,0.5)' }}>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />

          <div className="text-center mb-8 relative">
            <motion.span className="block text-5xl mb-3"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.5))' }}>☽</motion.span>
            <h1 className="font-amiri text-3xl mb-1" style={{ color: '#C9A84C' }}>Join NurPath</h1>
            <p className="font-amiri" style={{ color: '#7A6130', direction: 'rtl' }}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>Full Name</label>
              <input className="input-field" placeholder="Abdul Wasay" value={form.name} onChange={set('name')} />
              {errors.name && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
                City <span style={{ color: '#3A4A60', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(for prayer times)</span>
              </label>
              <input className="input-field" placeholder="Hyderabad, India" value={form.city} onChange={set('city')} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#3A4A60' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : '#1C2A40' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>Confirm Password</label>
              <div className="relative">
                <input type="password" className="input-field pr-12"
                  placeholder="••••••••" value={form.confirm} onChange={set('confirm')} />
                {form.confirm && form.confirm === form.password && (
                  <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#22C55E' }} />
                )}
              </div>
              {errors.confirm && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account…
                  </span>
                : 'Create Account — إِنْ شَاءَ اللَّه'
              }
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#3A4A60' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>Sign in</Link>
          </p>
        </div>
        <p className="text-center mt-4 text-xs">
          <Link href="/" style={{ color: '#3A4A60' }} className="hover:underline">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
