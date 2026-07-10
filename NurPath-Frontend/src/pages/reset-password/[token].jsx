import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { token } = router.query;

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

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

  const validate = () => {
    const e = {};
    if (!form.password || form.password.length < 6) e.password = 'At least 6 characters required';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate() || !token) return;
    setLoading(true);
    try {
      const user = await resetPassword(token, form.password);
      toast.success(`Password reset! Welcome back, ${user.name.split(' ')[0]} 🌙`);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: 'rgba(12, 20, 32, 0.95)', border: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 0 80px rgba(201,168,76,0.07), 0 20px 60px rgba(0,0,0,0.5)' }}>

          <div className="text-center mb-9 relative">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <ShieldCheck size={24} style={{ color: '#C9A84C' }} />
            </div>
            <h1 className="font-amiri text-3xl mb-1" style={{ color: '#C9A84C' }}>Set a New Password</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Choose something strong you haven't used before.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : '#1C2A40' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password" className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.confirm} onChange={set('confirm')}
                  autoComplete="new-password"
                />
                {form.confirm && form.confirm === form.password && (
                  <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#22C55E' }} />
                )}
              </div>
              {errors.confirm && <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-1">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-xs">
          <Link href="/login" style={{ color: 'var(--text-muted)' }} className="hover:text-gold-dim">← Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
