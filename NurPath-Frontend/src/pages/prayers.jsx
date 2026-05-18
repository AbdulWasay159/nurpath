import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { PrayerRing, PrayerCard, PrayerPill } from '../components/prayer/PrayerComponents';
import { Card, Skeleton } from '../components/ui';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr',    arabic: 'الفجر' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr',   arabic: 'الظهر' },
  asr:     { icon: '🌤️', label: 'Asr',     arabic: 'العصر' },
  maghrib: { icon: '🌅', label: 'Maghrib', arabic: 'المغرب' },
  isha:    { icon: '🌙', label: 'Isha',    arabic: 'العشاء' },
};



// ── Prayer Times Section ─────────────────────────────────────────────────
function PrayerTimesSection() {
  const {
    formattedTimes,
    nextPrayer,
    hijri,
    islamicOccasion,
    locationName,
    locationLoading,
    countdown,
  } = usePrayerTimes();

  const loading = locationLoading || !formattedTimes;

  const DISPLAY_PRAYERS = [
    { name: 'fajr',    key: 'fajr',    ...PRAYER_META.fajr },
    { name: 'sunrise', key: 'sunrise',  icon: '🌄', label: 'Sunrise', arabic: 'شروق' },
    { name: 'dhuhr',   key: 'dhuhr',   ...PRAYER_META.dhuhr },
    { name: 'asr',     key: 'asr',     ...PRAYER_META.asr },
    { name: 'maghrib', key: 'maghrib', ...PRAYER_META.maghrib },
    { name: 'isha',    key: 'isha',    ...PRAYER_META.isha },
  ];

  return (
    <div>
      {/* Location + Hijri header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <p className="text-sm flex items-center gap-1.5" style={{ color: '#7A8FA8' }}>
          <MapPin size={13} style={{ color: '#C9A84C' }} />
          {locationLoading ? 'Detecting location...' : locationName}
          <span className="text-xs px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
            Ahle Hadees (18°/17°)
          </span>
        </p>
        {hijri && (
          <div className="text-right">
            <p className="text-sm font-amiri" style={{ color: '#C9A84C' }}>{hijri.formatted}</p>
            {islamicOccasion && (
              <p className="text-xs mt-0.5" style={{ color: '#2DD4BF' }}>🌙 {islamicOccasion}</p>
            )}
          </div>
        )}
      </div>

      {/* Next prayer countdown banner */}
      {nextPrayer && countdown && !loading && (
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#7A6130' }}>Next Prayer</p>
            <p className="text-lg font-semibold" style={{ color: '#C9A84C' }}>
              {nextPrayer.label}
              <span className="font-amiri text-base ml-2" style={{ color: '#7A6130' }}>{nextPrayer.arabic}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#7A6130' }}>In</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: '#C9A84C' }}>{countdown}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      )}

      {/* Prayer times grid */}
      {!loading && formattedTimes && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {DISPLAY_PRAYERS.map(({ name, key, icon, label, arabic }) => {
              const isNext = nextPrayer?.name === name;
              const isSunrise = name === 'sunrise';
              return (
                <div key={name} className="rounded-2xl p-4 text-center transition"
                  style={{
                    background: isNext ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isNext ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <span className="block text-2xl mb-2">{icon}</span>
                  <span className="block text-xs font-semibold mb-1"
                    style={{ color: isNext ? '#C9A84C' : '#EDE8D8' }}>{label}</span>
                  <span className="block font-amiri text-xs mb-3" style={{ color: '#7A6130' }}>{arabic}</span>
                  <span className="block text-sm font-bold"
                    style={{ color: isNext ? '#C9A84C' : isSunrise ? '#F59E0B' : '#2DD4BF' }}>
                    {formattedTimes[key] || '—'}
                  </span>
                  {isNext && (
                    <span className="block text-xs mt-1.5 font-semibold" style={{ color: '#C9A84C' }}>Next ▸</span>
                  )}
                  {isSunrise && (
                    <span className="block text-xs mt-1" style={{ color: '#3A4A60' }}>no prayer</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center" style={{ color: '#3A4A60' }}>
            Calculated locally · Ahle Hadees method (Fajr 18° · Isha 17°) · Defaults to Hyderabad if location denied
          </p>
        </>
      )}
    </div>
  );
}

// ── Masjid Timings Section ────────────────────────────────────────────────
function MasjidTimingsSection({ masjids, loading }) {
  const [selected, setSelected] = useState(0);
  if (loading) return <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>;
  if (!masjids || masjids.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-3xl mb-3">🕌</p>
        <p className="text-sm" style={{ color: '#7A8FA8' }}>No masjid timings registered yet.</p>
        <p className="text-xs mt-1" style={{ color: '#3A4A60' }}>Ask your admin to add them.</p>
      </div>
    );
  }
  const masjid = masjids[selected];
  return (
    <div>
      {masjids.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {masjids.map((m, i) => (
            <button key={m._id} onClick={() => setSelected(i)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: selected === i ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selected === i ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, color: selected === i ? '#C9A84C' : '#7A8FA8' }}>
              {m.name}
            </button>
          ))}
        </div>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)' }}>
        <div className="px-6 py-4 flex items-start gap-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <span className="text-2xl">🕌</span>
          <div>
            <h3 className="font-semibold text-base" style={{ color: '#C9A84C' }}>{masjid.name}</h3>
            {masjid.address && <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#7A8FA8' }}><MapPin size={11} />{masjid.address}</p>}
            {masjid.phone && <p className="text-xs mt-0.5" style={{ color: '#3A4A60' }}>📞 {masjid.phone}</p>}
          </div>
        </div>
        <div className="grid grid-cols-5">
          {PRAYER_NAMES.map((name) => {
            const meta = PRAYER_META[name];
            const time = masjid.timings?.[name];
            return (
              <div key={name} className="px-3 py-4 text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="block text-xl mb-1">{meta.icon}</span>
                <span className="block text-xs font-semibold mb-1.5" style={{ color: '#EDE8D8' }}>{meta.label}</span>
                <span className="block font-amiri text-xs mb-2" style={{ color: '#7A6130' }}>{meta.arabic}</span>
                <span className="block text-sm font-bold" style={{ color: time ? '#C9A84C' : '#3A4A60' }}>{fmt12(time)}</span>
              </div>
            );
          })}
        </div>
        {masjid.jumuahTime && (
          <div className="px-6 py-3 flex items-center gap-2 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
            <Clock size={13} style={{ color: '#C9A84C' }} />
            Jumu'ah: <span className="font-semibold ml-1" style={{ color: '#C9A84C' }}>{fmt12(masjid.jumuahTime)}</span>
            {masjid.jumuahKhatib && <span style={{ color: '#3A4A60' }}>· {masjid.jumuahKhatib}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── History Row ───────────────────────────────────────────────────────────
function HistoryRow({ record, isExpanded, onToggle }) {
  const date = parseISO(record.date);
  const isToday = record.date === new Date().toLocaleDateString('en-CA');
  const done = record.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  const barColor = record.completionRate === 100 ? '#22C55E' : record.completionRate >= 60 ? '#C9A84C' : '#EF4444';
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: isExpanded ? 'rgba(201,168,76,0.04)' : 'transparent', border: `1px solid ${isExpanded ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition">
        <div className="flex-shrink-0 w-12 text-center">
          <div className="text-xs font-bold uppercase" style={{ color: '#7A8FA8' }}>{format(date, 'MMM')}</div>
          <div className="text-2xl font-bold leading-none" style={{ color: isToday ? '#C9A84C' : '#EDE8D8' }}>{format(date, 'd')}</div>
          {isToday && <div className="text-xs font-semibold" style={{ color: '#C9A84C' }}>Today</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#EDE8D8' }}>{format(date, 'EEEE')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${barColor}18`, color: barColor }}>{done}/5</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: barColor }} initial={{ width: 0 }} animate={{ width: `${record.completionRate}%` }} transition={{ duration: 0.6 }} />
            </div>
            <span className="text-xs font-medium w-8 text-right" style={{ color: barColor }}>{record.completionRate}%</span>
          </div>
        </div>
        <div className="hidden md:flex gap-1.5 flex-shrink-0">
          {record.prayers.map((p) => <PrayerPill key={p.name} name={p.name} status={p.status} />)}
        </div>
        <div className="flex-shrink-0 ml-2" style={{ color: '#3A4A60' }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 grid grid-cols-5 gap-3">
              {record.prayers.map((p) => {
                const meta = PRAYER_META[p.name];
                const col = { done: '#22C55E', missed: '#EF4444', pending: '#3A4A60', qada: '#F59E0B' }[p.status] || '#3A4A60';
                return (
                  <div key={p.name} className="rounded-xl p-3 text-center" style={{ background: `${col}10`, border: `1px solid ${col}30` }}>
                    <span className="block text-lg mb-1">{meta.icon}</span>
                    <span className="block text-xs font-semibold mb-1" style={{ color: col }}>{meta.label}</span>
                    <span className="block text-xs capitalize font-medium" style={{ color: col }}>{p.status === 'qada' ? 'Qaḍā' : p.status}</span>
                    {p.markedAt && <span className="block text-xs mt-1" style={{ color: '#3A4A60' }}>{format(new Date(p.markedAt), 'h:mm a')}</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PrayersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [prayers, setPrayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMasjids, setLoadingMasjids] = useState(true);
  const [updatingPrayer, setUpdatingPrayer] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [historyDays, setHistoryDays] = useState(30);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    api.get('/prayers/today').then((r) => setPrayers(r.data.data.prayers)).catch(() => toast.error('Could not load prayers.')).finally(() => setLoadingToday(false));
  }, []);

  useEffect(() => {
    setLoadingHistory(true);
    api.get(`/prayers/history?days=${historyDays}`).then((r) => setHistory(r.data.data || [])).catch(() => {}).finally(() => setLoadingHistory(false));
  }, [historyDays]);

  useEffect(() => {
    api.get('/masjids').then((r) => setMasjids(r.data.data || [])).catch(() => {}).finally(() => setLoadingMasjids(false));
  }, []);

  const handlePrayerUpdate = async (name, status) => {
    setUpdatingPrayer(name);
    try {
      const res = await api.put(`/prayers/today/${name}`, { status });
      setPrayers(res.data.data.prayers);
      const msgs = { done: '✓ Prayed — الحمد لله', missed: '✗ Missed — أستغفر الله', pending: '↺ Reset' };
      toast.success(msgs[status] || status, { icon: null });
    } catch { toast.error('Failed to update prayer.'); }
    finally { setUpdatingPrayer(null); }
  };

  const tabs = [
    { id: 'today',       label: "Today's Salah",  icon: '🤲' },
    { id: 'prayertimes', label: 'Prayer Times',   icon: '🕐' },
    { id: 'masjids',     label: 'Masjid Timings', icon: '🕌' },
    { id: 'history',     label: 'History',        icon: '📅' },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>أَقِمِ الصَّلَاةَ</p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Prayer Tracker</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>Track your Salah, view prayer times, and find masjid timings.</p>
      </div>

      <div className="flex gap-2 mb-8 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            style={{ background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent', border: `1px solid ${activeTab === tab.id ? 'rgba(201,168,76,0.35)' : 'transparent'}`, color: activeTab === tab.id ? '#C9A84C' : '#7A8FA8' }}>
            <span>{tab.icon}</span><span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'today' && !isAdmin && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 overflow-hidden" glow>
            {loadingToday ? (
              <div className="p-7 flex gap-8 items-center">
                <Skeleton style={{ width: 120, height: 120, borderRadius: '50%' }} />
                <div className="flex-1 space-y-3"><Skeleton style={{ height: 24, width: '50%' }} /><Skeleton style={{ height: 16, width: '75%' }} /></div>
              </div>
            ) : <PrayerRing prayers={prayers} />}
          </Card>
          <div className="section-label mb-3">Daily Salah — tap to mark</div>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {loadingToday ? Array(5).fill(0).map((_, i) => <Skeleton key={i} style={{ height: 160, borderRadius: 16 }} />)
              : prayers.map((prayer) => <PrayerCard key={prayer.name} prayer={prayer} onUpdate={handlePrayerUpdate} loading={updatingPrayer === prayer.name} />)}
          </div>
          <p className="text-xs text-center mb-8" style={{ color: '#3A4A60' }}>Tap once = Done · Twice = Missed · Third tap = Reset</p>
        </motion.div>
      )}

      {activeTab === 'prayertimes' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: '#EDE8D8' }}>Prayer Times</h2>
            <p className="text-xs" style={{ color: '#3A4A60' }}>AlAdhan API · Free · No account needed</p>
          </div>
          <PrayerTimesSection />
        </motion.div>
      )}

      {activeTab === 'masjids' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: '#EDE8D8' }}>Masjid Timings</h2>
            <p className="text-xs" style={{ color: '#3A4A60' }}>Managed by admin</p>
          </div>
          <MasjidTimingsSection masjids={masjids} loading={loadingMasjids} />
        </motion.div>
      )}

      {activeTab === 'history' && !isAdmin && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: '#EDE8D8' }}>Recent History</h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button key={d} onClick={() => setHistoryDays(d)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  style={{ background: historyDays === d ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${historyDays === d ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, color: historyDays === d ? '#C9A84C' : '#7A8FA8' }}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {loadingHistory ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">📿</p>
              <p className="text-sm" style={{ color: '#7A8FA8' }}>No records yet. Start tracking today!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <HistoryRow key={record._id} record={record} isExpanded={expandedDay === record._id} onToggle={() => setExpandedDay(expandedDay === record._id ? null : record._id)} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AppLayout>
  );
}
