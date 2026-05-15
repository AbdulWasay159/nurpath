import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', city: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.city);
      toast.success('Account created! Welcome to NurPath 🌙');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7A8FA8' }}>
        {label}
      </label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {errors[key] && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 0 60px rgba(201,168,76,0.06)' }}>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />

          <div className="text-center mb-8">
            <motion.span className="block text-5xl mb-3"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.5))' }}>☽</motion.span>
            <h1 className="font-amiri text-3xl" style={{ color: '#C9A84C' }}>Join NurPath</h1>
            <p className="font-amiri mt-1" style={{ color: '#7A6130', direction: 'rtl' }}>
              أَهْلاً وَسَهْلاً
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', 'Full Name', 'text', 'Abdul Wasay')}
            {field('email', 'Email Address', 'email', 'you@example.com')}
            {field('city', 'City (optional)', 'text', 'Hyderabad, IN')}
            {field('password', 'Password', 'password', '••••••••')}
            {field('confirm', 'Confirm Password', 'password', '••••••••')}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? 'Creating account...' : 'Create Account — إن شاء الله'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#3A4A60' }}>
            Already registered?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#C9A84C' }}>Sign in</Link>
          </p>
        </div>

        <p className="text-center mt-5 text-xs">
          <Link href="/" style={{ color: '#7A6130' }}>← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
