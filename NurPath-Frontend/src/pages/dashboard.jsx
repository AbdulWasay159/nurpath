import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import {
  PrayerRing, PrayerCard,
  SunnahCard, JumuahVariantModal,
  SUNNAH_META,
} from '../components/prayer/PrayerComponents';
import AzkarModal from '../components/prayer/AzkarModal';
import { Card, StatCard, Skeleton } from '../components/ui';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Calendar, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

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
    hijri, islamicOccasion, locationName,
  } = usePrayerTimes();

  const [prayers, setPrayers]               = useState([]);
  const [sunnahPrayers, setSunnahPrayers]   = useState([]);
  const [stats, setStats]                   = useState(null);
  const [events, setEvents]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [updatingPrayer, setUpdatingPrayer] = useState(null);
  const [updatingSunnah, setUpdatingSunnah] = useState(null);
  const [azkarPrayer, setAzkarPrayer]       = useState(null);
  const [sunnahOpen, setSunnahOpen]         = useState(true);
  const [jumuahPicker, setJumuahPicker]     = useState(false); // show variant modal

  const isFriday = new Date().getDay() === 5;

  const fetchData = async () => {
    try {
      const [todayRes, statsRes, eventsRes] = await Promise.all([
        api.get('/prayers/today'),
        api.get('/prayers/stats'),
        api.get('/events?upcoming=true'),
      ]);
      setPrayers(todayRes.data.data.prayers);
      setSunnahPrayers(todayRes.data.data.sunnahPrayers || []);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data.slice(0, 3));
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Farz update ──────────────────────────────────────────────────────────────
  const handlePrayerUpdate = async (name, status) => {
    setUpdatingPrayer(name);
    try {
      const res = await api.put(`/prayers/today/${name}`, { status });
      setPrayers(res.data.data.prayers);
      setSunnahPrayers(res.data.data.sunnahPrayers || []);
      if (status === 'done') {
        toast.success('الحمد لله — Prayed ✓', { icon: null });
        setAzkarPrayer(name);
      }
      if (status === 'missed') toast.error('أستغفر الله — Missed', { icon: null });
      if (status === 'pending') toast('Reset ↺', { icon: null });
    } catch {
      toast.error('Failed to update prayer.');
    } finally {
      setUpdatingPrayer(null);
    }
  };

  // ── Sunnah update ─────────────────────────────────────────────────────────────
  const handleSunnahUpdate = async (name, status, variant, openPicker) => {
    // For jumuah_after pending→done, open the variant picker first
    if (openPicker) {
      setJumuahPicker(true);
      return;
    }
    setUpdatingSunnah(name);
    try {
      const body = { status };
      if (name === 'jumuah_after' && variant) body.variant = variant;
      const res = await api.put(`/prayers/today/sunnah/${name}`, body);
      setSunnahPrayers(res.data.data.sunnahPrayers || []);
      if (status === 'done')    toast.success('بارك الله — Sunnah ✓', { icon: null });
      if (status === 'skipped') toast('Sunnah skipped', { icon: null });
      if (status === 'pending') toast('Reset ↺', { icon: null });
    } catch {
      toast.error('Failed to update sunnah.');
    } finally {
      setUpdatingSunnah(null);
    }
  };

  const handleJumuahVariant = async (variant) => {
    setJumuahPicker(false);
    await handleSunnahUpdate('jumuah_after', 'done', variant, false);
  };

  // Sunnah summary counts
  const sunnahDone    = sunnahPrayers.filter((s) => s.status === 'done').length;
  const sunnahSkipped = sunnahPrayers.filter((s) => s.status === 'skipped').length;
  const sunnahTotal   = sunnahPrayers.length;

  const now = new Date();

  return (
    <AppLayout>
      {/* ══ Header with greeting ══ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-amiri text-xl mb-1 leading-relaxed" style={{ color: '#C9A84C', direction: 'rtl' }}>
          ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّهِ وَبَرَكَاتُهُ
        </p>
        <h1 className="font-amiri text-4xl leading-tight" style={{ color: '#EDE8D8' }}>
          Assalāmu ʿAlaykum Waraḥmatullāhi Wabarakātuh,{' '}
          <span style={{ color: '#C9A84C' }}>{user?.name?.split(' ')[0]}</span>
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
          {isFriday && (
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
              🕌 Jumu'ah Mubarak
            </span>
          )}
        </div>
        <p className="text-sm mt-2" style={{ color: '#3A4A60' }}>
          May Allah accept your prayers and bless your day.
        </p>
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

      {/* ══ Farz prayer cards ══ */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label mb-0">Daily Salah — tap to mark</p>
          <span className="text-xs" style={{ color: '#3A4A60' }}>Tap a card to mark</span>
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

      {/* ══ Sunnah panel ══ */}
      <div className="mb-7">
        {/* Header row — collapsible */}
        <button
          onClick={() => setSunnahOpen((o) => !o)}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <div className="flex items-center gap-2">
            <p className="section-label mb-0">Sunnah Prayers</p>
            {!loading && sunnahTotal > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>
                {sunnahDone}/{sunnahTotal}
              </span>
            )}
            {isFriday && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.08)', color: '#7C6FBF' }}>
                Jumu'ah
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#3A4A60' }}>Pending → Done → Skipped</span>
            <span style={{ color: '#3A4A60' }}>
              {sunnahOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {sunnahOpen && (
            <motion.div
              key="sunnah-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Sunnah grid */}
              <div className={`grid gap-2.5 ${sunnahTotal === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                {loading
                  ? Array(6).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 110, borderRadius: 12 }} />)
                  : sunnahPrayers.map((s) => (
                      <SunnahCard key={s.name} sunnah={s}
                        onUpdate={handleSunnahUpdate}
                        loading={updatingSunnah === s.name}
                      />
                    ))
                }
              </div>

              {/* Sunnah summary bar */}
              {!loading && sunnahTotal > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: sunnahDone === sunnahTotal ? '#A78BFA' : 'rgba(139,92,246,0.5)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((sunnahDone / sunnahTotal) * 100)}%` }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
                      {sunnahDone} done
                    </span>
                    {sunnahSkipped > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(58,74,96,0.2)', color: '#7A8FA8' }}>
                        {sunnahSkipped} skipped
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Friday tip */}
              {!loading && isFriday && (
                <p className="text-xs mt-2" style={{ color: '#3A4A60' }}>
                  🕌 Friday: no fixed sunnah before Jumu'ah. Tap the Jumu'ah card to log 4 (masjid) or 2 (home) rak'ah after.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ Quick access: Adhkar + Qibla + Quran ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        <Link href="/adhkar"
          className="flex items-center justify-between rounded-2xl px-5 py-4 transition group"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(201,168,76,0.2)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <span className="text-lg">📿</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#EDE8D8' }}>Adhkar</p>
              <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>
                {new Date().getHours() < 15 ? '🌅 Morning' : '🌙 Evening'} azkaar
              </p>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: '#C9A84C' }}
            className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </Link>

        <Link href="/qibla"
          className="flex items-center justify-between rounded-2xl px-5 py-4 transition group"
          style={{
            background: 'linear-gradient(135deg, rgba(45,212,191,0.06) 0%, rgba(59,130,246,0.06) 100%)',
            border: '1px solid rgba(45,212,191,0.18)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.18)' }}>
              <span className="text-lg">🧭</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#EDE8D8' }}>Qibla Finder</p>
              <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>Direction to Kaaba</p>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: '#2DD4BF' }}
            className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </Link>
        {/* Quran */}
        <Link href="/quran"
          className="flex items-center justify-between rounded-2xl px-5 py-4 transition group"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(59,130,246,0.05) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <span className="text-lg">📖</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#EDE8D8' }}>Al-Quran</p>
              <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>114 Surahs · Reader</p>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: '#8B5CF6' }}
            className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </Link>
      </div>

      {/* ══ Stats row ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {loading
          ? Array(3).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 104, borderRadius: 16 }} />)
          : <>
              <StatCard icon="🔥" label="Current Streak" value={stats?.streak?.current || 0} sub="consecutive perfect days" color="#F59E0B" />
              <StatCard icon="✅" label="Total Prayed"   value={stats?.totalPrayed || 0}     sub="prayers recorded all time" color="#22C55E" />
              <StatCard icon="⭐" label="Perfect Days"   value={stats?.perfectDays || 0}     sub="all 5 prayers done"        color="#2DD4BF" />
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
                    {ev.masjid} · {format(new Date(ev.date), 'EEE, MMM d')} at {ev.time && /[AaPp][Mm]/.test(ev.time) ? ev.time : ev.time ? (() => { try { return new Date(`2000-01-01T${ev.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); } catch { return ev.time; } })() : ''}
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

      {/* ══ Modals ══ */}
      <AzkarModal
        open={!!azkarPrayer}
        prayerName={azkarPrayer}
        onClose={() => setAzkarPrayer(null)}
      />
      <JumuahVariantModal
        open={jumuahPicker}
        onChoose={handleJumuahVariant}
        onClose={() => setJumuahPicker(false)}
      />
    </AppLayout>
  );
}
