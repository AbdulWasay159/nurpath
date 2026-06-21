import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot — must stay empty
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    // Honeypot tripped — pretend success, do nothing
    if (company) {
      setSent(true);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: 'rgba(12, 20, 32, 0.95)', border: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 0 80px rgba(201,168,76,0.07), 0 20px 60px rgba(0,0,0,0.5)' }}>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />

          {sent ? (
            <div className="text-center relative">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle size={28} style={{ color: '#22C55E' }} />
              </motion.div>
              <h1 className="font-amiri text-3xl mb-3" style={{ color: '#C9A84C' }}>Check Your Email</h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#7A8FA8' }}>
                If an account exists for <strong style={{ color: '#EDE8D8' }}>{email}</strong>, we've sent a link to reset your password. It expires in 1 hour.
              </p>
              <Link href="/login" className="btn-gold inline-block px-8 py-3">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-9 relative">
                <span className="block text-6xl mb-4" style={{ filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.6))' }}>☽</span>
                <h1 className="font-amiri text-4xl mb-1" style={{ color: '#C9A84C' }}>Forgot Password?</h1>
                <p className="text-sm mt-2" style={{ color: '#7A8FA8' }}>
                  No worries — enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot — hidden from real users, catches bots */}
                <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text" id="company" name="company" tabIndex={-1} autoComplete="off"
                    value={company} onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#3A4A60' }} />
                    <input
                      type="email" className="input-field pl-11"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {error && <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>{error}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-1">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm mt-7" style={{ color: '#3A4A60' }}>
                Remembered it?{' '}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center mt-5 text-xs">
          <Link href="/login" style={{ color: '#3A4A60' }} className="hover:text-gold-dim flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
