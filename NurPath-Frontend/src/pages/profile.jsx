import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { Card, PageHeader, Button, Input } from '../components/ui';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Bell, BellOff, Flame, Star, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', city: '', notificationsEnabled: true });

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user]);

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        const data = res.data.data;
        setProfile(data);
        setForm({
          name: data.name || '',
          city: data.city || '',
          notificationsEnabled: data.notificationsEnabled !== false,
        });
      })
      .catch(() => toast.error('Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      setProfile(res.data.data);
      updateUser(res.data.data);
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading || !profile) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-amiri text-4xl" style={{ color: 'var(--gold)' }}>Profile</h1>
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </AppLayout>
    );
  }

  const statCards = [
    { icon: <Flame size={20} />, label: 'Current Streak', value: profile.streak?.current ?? 0, color: '#F59E0B' },
    { icon: <Star size={20} />, label: 'Longest Streak', value: profile.streak?.longest ?? 0, color: '#2DD4BF' },
    { icon: <CheckCircle size={20} />, label: 'Total Prayed', value: profile.totalPrayed ?? 0, color: '#22C55E' },
    { icon: <XCircle size={20} />, label: 'Total Missed', value: profile.totalMissed ?? 0, color: '#EF4444' },
  ];

  return (
    <AppLayout>
      <PageHeader title="Profile" subtitle="Manage your account details and preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: avatar + identity card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-7 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1))', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}>
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
            <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={13} /> {profile.email}
            </p>
            {profile.city && (
              <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={13} /> {profile.city}
              </p>
            )}
            {profile.role === 'admin' && (
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}>
                <ShieldCheck size={12} /> Admin
              </span>
            )}
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center"
                style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
                <div className="mb-1.5 flex justify-center" style={{ color: s.color }}>{s.icon}</div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: edit form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="lg:col-span-2">
          <Card className="p-7">
            <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <User size={16} /> Edit Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={50} />
              <Input label="City" name="city" placeholder="e.g. Hyderabad" value={form.city} onChange={handleChange} />

              {/* Notifications toggle */}
              <div className="flex items-center justify-between rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  {form.notificationsEnabled
                    ? <Bell size={17} style={{ color: 'var(--gold)' }} />
                    : <BellOff size={17} style={{ color: 'var(--text-muted)' }} />}
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Prayer Notifications</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Get reminded for upcoming prayer times</div>
                  </div>
                </div>
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))}
                  className="w-12 h-7 rounded-full relative transition-all flex-shrink-0"
                  style={{ background: form.notificationsEnabled ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: form.notificationsEnabled ? '26px' : '4px' }} />
                </button>
              </div>

              <Button type="submit" loading={saving} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
