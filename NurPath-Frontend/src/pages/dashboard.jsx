import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { PrayerRing, PrayerCard } from '../components/prayer/PrayerComponents';
import { Card, StatCard, Skeleton } from '../components/ui';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Flame, Star, Calendar, ArrowRight } from 'lucide-react';

const QUOTES = [
  { text: 'Indeed, prayer prohibits immorality and wrongdoing.', source: 'Quran 29:45' },
  { text: 'Prayer is the pillar of the religion.', source: 'Hadith — Bayhaqi' },
  { text: 'The first thing a servant will be held accountable for on the Day of Resurrection is prayer.', source: 'Abu Dawud' },
  { text: 'Guard strictly the prayers, especially the middle prayer.', source: 'Quran 2:238' },
  { text: 'Whoever guards their prayers will have light, proof and salvation on the Day of Judgment.', source: 'Ahmad' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPrayer, setUpdatingPrayer] = useState(null);
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const fetchData = async () => {
    try {
      const [todayRes, statsRes, eventsRes] = await Promise.all([
        api.get('/prayers/today'),
        api.get('/prayers/stats'),
        api.get('/events?upcoming=true'),
      ]);
      setPrayers(todayRes.data.data.prayers);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data.slice(0, 3));
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePrayerUpdate = async (name, status) => {
    setUpdatingPrayer(name);
    try {
      const res = await api.put(`/prayers/today/${name}`, { status });
      setPrayers(res.data.data.prayers);
      const msgs = { done: '✓ Prayed — الحمد لله', missed: '✗ Missed — أستغفر الله', pending: '↺ Reset' };
      toast.success(msgs[status] || status, { icon: null });
    } catch {
      toast.error('Failed to update prayer.');
    } finally {
      setUpdatingPrayer(null);
    }
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="font-amiri text-base mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>وَعَلَيْكُمُ السَّلَام</p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>
          {format(now, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quote bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-8 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(45,212,191,0.04) 100%)', border: '1px solid rgba(201,168,76,0.12)' }}>
        <p className="font-amiri text-lg italic" style={{ color: '#E8C97A' }}>"{quote.text}"</p>
        <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: '#3A4A60' }}>— {quote.source}</p>
      </motion.div>

      {/* Progress Ring Card */}
      <Card className="mb-8 overflow-hidden" glow>
        {loading ? (
          <div className="p-7 flex gap-8 items-center">
            <Skeleton style={{ width: 120, height: 120, borderRadius: '50%' }} />
            <div className="flex-1 space-y-3">
              <Skeleton style={{ height: 24, width: '50%' }} />
              <Skeleton style={{ height: 16, width: '75%' }} />
            </div>
          </div>
        ) : (
          <PrayerRing prayers={prayers} />
        )}
      </Card>

      {/* Prayer Cards */}
      <div className="mb-8">
        <div className="section-label">Daily Salah — tap to mark</div>
        <div className="grid grid-cols-5 gap-3">
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 160, borderRadius: 16 }} />)
            : prayers.map((prayer) => (
              <PrayerCard
                key={prayer.name}
                prayer={prayer}
                onUpdate={handlePrayerUpdate}
                loading={updatingPrayer === prayer.name}
              />
            ))
          }
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: '#3A4A60' }}>
          Tap once = Done · Twice = Missed · Third tap = Reset · Right-click for Qaḍā
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 100, borderRadius: 16 }} />)
        ) : (
          <>
            <StatCard icon="🔥" label="Current Streak" value={stats?.streak?.current || 0} sub="consecutive perfect days" color="#F59E0B" />
            <StatCard icon="✅" label="Total Prayed" value={stats?.totalPrayed || 0} sub="all time" color="#22C55E" />
            <StatCard icon="⚡" label="Perfect Days" value={stats?.perfectDays || 0} sub="all 5 done" color="#2DD4BF" />
          </>
        )}
      </div>

      {/* Upcoming events */}
      {events.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label">Upcoming Events</div>
            <Link href="/events" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#C9A84C' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event._id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <Calendar size={16} style={{ color: '#C9A84C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: '#EDE8D8' }}>{event.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#7A8FA8' }}>{event.masjid} · {format(new Date(event.date), 'MMM d')}</p>
                </div>
                <Link href={`/events/${event._id}`} className="text-xs flex-shrink-0" style={{ color: '#C9A84C' }}>
                  View →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
