import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { PrayerRing, PrayerCard } from '../components/prayer/PrayerComponents';
import { Card, StatCard, Skeleton } from '../components/ui';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Calendar, ArrowRight, MapPin, Clock, Flame, Star, BookOpen } from 'lucide-react';

// Prayer time display names & icons
const PRAYER_DISPLAY = [
  { key: 'fajr',    label: 'Fajr',    arabic: 'الفجر',  icon: '🌙' },
  { key: 'sunrise', label: 'Sunrise', arabic: 'شروق',   icon: '🌅', isSunrise: true },
  { key: 'dhuhr',   label: 'Dhuhr',   arabic: 'الظهر',  icon: '☀️' },
  { key: 'asr',     label: 'Asr',     arabic: 'العصر',  icon: '🌤️' },
  { key: 'maghrib', label: 'Maghrib', arabic: 'المغرب', icon: '🌆' },
  { key: 'isha',    label: 'Isha',    arabic: 'العشاء', icon: '🌙' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    formattedTimes, nextPrayer, greeting, hadith,
    hijri, islamicOccasion, locationName, countdown, locationLoading,
  } = usePrayerTimes();

  const [prayers, setPrayers]           = useState([]);
  const [stats, setStats]               = useState(null);
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [updatingPrayer, setUpdatingPrayer] = useState(null);

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
      toast.error('Failed to load data.');
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
      if (status === 'done')   toast.success('الحمد لله — Prayed ✓', { icon: null });
      if (status === 'missed') toast.error('أستغفر الله — Missed', { icon: null });
      if (status === 'pending') toast('Reset ↺', { icon: null });
    } catch {
      toast.error('Failed to update prayer.');
    } finally {
      setUpdatingPrayer(null);
    }
  };

  const now = new Date();

  return (
    <AppLayout>
      {/* ══ Header with greeting ══ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-amiri text-base mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>
          {greeting?.arabic || 'وَعَلَيْكُمُ السَّلَام'}
        </p>
        <h1 className="font-amiri text-4xl leading-tight" style={{ color: '#C9A84C' }}>
          {greeting?.text || 'Welcome'}, {user?.name?.split(' ')[0]}
        </h1>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-sm" style={{ color: '#7A8FA8' }}>
            {format(now, 'EEEE, MMMM d, yyyy')}
          </span>
          {hijri && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
              {hijri.formattedShort} AH
            </span>
          )}
          {islamicOccasion && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
              ✨ {islamicOccasion}
            </span>
          )}
        </div>
        {greeting?.sub && (
          <p className="text-sm mt-1" style={{ color: '#3A4A60' }}>{greeting.sub}</p>
        )}
      </motion.div>

      {/* ══ Next Prayer Countdown Banner ══ */}
      {nextPrayer && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap"
          style={{
            background: 'linear-gradient(135deg, rgba(45,212,191,0.08) 0%, rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(45,212,191,0.2)',
          }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(45,212,191,0.12)' }}>
              {nextPrayer.isTomorrow ? '🌙' : '⏱️'}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#3A4A60' }}>
                {nextPrayer.isTomorrow ? 'Tomorrow' : 'Next Prayer'}
              </p>
              <p className="text-lg font-semibold" style={{ color: '#EDE8D8' }}>
                {nextPrayer.label}
                <span className="font-amiri ml-2 text-base" style={{ color: '#7A6130' }}>{nextPrayer.arabic}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            {countdown && !nextPrayer.isTomorrow && (
              <p className="text-3xl font-bold font-amiri" style={{ color: '#2DD4BF' }}>{countdown}</p>
            )}
            {nextPrayer.time && !nextPrayer.isTomorrow && (
              <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>
                at {nextPrayer.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            )}
            {nextPrayer.isTomorrow && (
              <p className="text-sm" style={{ color: '#7A8FA8' }}>Isha done — rest well</p>
            )}
          </div>
        </motion.div>
      )}

      {/* ══ Prayer Times Grid ══ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: '#EDE8D8' }}>Today's Prayer Times</h3>
            <p className="text-xs mt-0.5" style={{ color: '#3A4A60' }}>
              {locationLoading ? 'Detecting location…' : (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {locationName} · Ahle Hadees (18°/17°)
                </span>
              )}
            </p>
          </div>
          <Link href="/prayers" className="text-xs" style={{ color: '#C9A84C' }}>Full schedule →</Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRAYER_DISPLAY.map(({ key, label, arabic, icon, isSunrise }) => {
            const t = formattedTimes?.[key];
            const isNext = nextPrayer?.name === key && !nextPrayer?.isTomorrow;
            return (
              <div key={key}
                className="rounded-xl p-3 text-center transition-all"
                style={{
                  background: isNext ? 'rgba(45,212,191,0.1)' : 'rgba(22,32,48,0.8)',
                  border: `1px solid ${isNext ? 'rgba(45,212,191,0.25)' : 'rgba(201,168,76,0.06)'}`,
                }}>
                <span className="block text-lg mb-1">{icon}</span>
                <span className="block text-xs font-semibold mb-0.5" style={{ color: isNext ? '#2DD4BF' : '#EDE8D8' }}>{label}</span>
                <span className="block font-amiri text-xs mb-1" style={{ color: '#7A6130' }}>{arabic}</span>
                <span className="block text-xs font-medium" style={{ color: isNext ? '#2DD4BF' : '#C9A84C' }}>
                  {locationLoading ? '—' : (t || '—')}
                </span>
                {isSunrise && (
                  <span className="block text-xs mt-0.5" style={{ color: '#3A4A60' }}>no prayer</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ══ Hadith of the moment ══ */}
      {hadith && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(45,212,191,0.03) 100%)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <p className="font-amiri text-base italic leading-relaxed mb-2" style={{ color: '#E8C97A' }}>
            "{hadith.text}"
          </p>
          {hadith.arabic && (
            <p className="font-amiri text-base mb-2" style={{ color: '#7A6130', direction: 'rtl' }}>{hadith.arabic}</p>
          )}
          <p className="text-xs uppercase tracking-widest" style={{ color: '#3A4A60' }}>— {hadith.source}</p>
        </motion.div>
      )}

      {/* ══ Completion Ring + Prayer Cards ══ */}
      <Card className="mb-6 overflow-hidden" glow>
        {loading
          ? <div className="p-7 flex gap-6 items-center"><Skeleton style={{ width: 120, height: 120, borderRadius: '50%' }} /><div className="flex-1 space-y-3"><Skeleton style={{ height: 24, width: '50%' }} /><Skeleton style={{ height: 16, width: '70%' }} /></div></div>
          : <PrayerRing prayers={prayers} />
        }
      </Card>

      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label mb-0">Daily Salah — tap to mark</p>
          <span className="text-xs" style={{ color: '#3A4A60' }}>Pending → Done → Missed</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 168, borderRadius: 16 }} />)
            : prayers.map((p) => (
                <PrayerCard key={p.name} prayer={p}
                  onUpdate={handlePrayerUpdate}
                  loading={updatingPrayer === p.name}
                  prayerTime={formattedTimes?.[p.name]}
                />
              ))
          }
        </div>
      </div>

      {/* ══ Stats row ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {loading
          ? Array(3).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 104, borderRadius: 16 }} />)
          : <>
              <StatCard icon="🔥" label="Current Streak" value={stats?.streak?.current || 0} sub="consecutive perfect days" color="#F59E0B" />
              <StatCard icon="✅" label="Total Prayed" value={stats?.totalPrayed || 0} sub="prayers recorded all time" color="#22C55E" />
              <StatCard icon="⭐" label="Perfect Days" value={stats?.perfectDays || 0} sub="all 5 prayers done" color="#2DD4BF" />
            </>
        }
      </div>

      {/* ══ Upcoming events preview ══ */}
      {events.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label mb-0">Upcoming Events</p>
            <Link href="/events" className="text-xs font-medium flex items-center gap-1" style={{ color: '#C9A84C' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {events.map((ev) => (
              <Card key={ev._id} className="p-4 flex items-center gap-4 hover:border-gold-dim transition-all">
                <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.08)' }}>
                  <Calendar size={15} style={{ color: '#C9A84C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: '#EDE8D8' }}>{ev.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#7A8FA8' }}>
                    {ev.masjid} · {format(new Date(ev.date), 'EEE, MMM d')} at {ev.time}
                  </p>
                </div>
                <Link href={`/events/${ev._id}`} className="text-xs font-medium flex-shrink-0" style={{ color: '#C9A84C' }}>
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
