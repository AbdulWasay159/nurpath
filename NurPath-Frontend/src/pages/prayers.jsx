import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { PrayerRing, PrayerCard, PrayerPill } from '../components/prayer/PrayerComponents';
import { Card, Skeleton } from '../components/ui';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr',    arabic: 'الفجر' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr',   arabic: 'الظهر' },
  asr:     { icon: '🌤️', label: 'Asr',     arabic: 'العصر' },
  maghrib: { icon: '🌅', label: 'Maghrib', arabic: 'المغرب' },
  isha:    { icon: '🌙', label: 'Isha',    arabic: 'العشاء' },
};

// ── Completion bar for history rows ─────────────────────────────────────
function CompletionBar({ rate }) {
  const color = rate === 100 ? '#22C55E' : rate >= 60 ? '#C9A84C' : '#EF4444';
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color }}>{rate}%</span>
    </div>
  );
}

// ── History Item (single day row) ────────────────────────────────────────
function HistoryRow({ record, isExpanded, onToggle }) {
  const date = parseISO(record.date);
  const isToday = record.date === new Date().toLocaleDateString('en-CA');
  const done = record.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: isExpanded ? 'rgba(201,168,76,0.04)' : 'transparent',
        border: `1px solid ${isExpanded ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {/* Row header — click to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition"
      >
        {/* Date block */}
        <div className="flex-shrink-0 w-12 text-center">
          <div className="text-xs font-bold uppercase" style={{ color: '#7A8FA8' }}>
            {format(date, 'MMM')}
          </div>
          <div className="text-2xl font-bold leading-none" style={{ color: isToday ? '#C9A84C' : '#EDE8D8' }}>
            {format(date, 'd')}
          </div>
          {isToday && (
            <div className="text-xs mt-0.5 font-semibold" style={{ color: '#C9A84C' }}>Today</div>
          )}
        </div>

        {/* Completion info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#EDE8D8' }}>
              {format(date, 'EEEE')}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: done === 5 ? 'rgba(34,197,94,0.12)' : done === 0 ? 'rgba(239,68,68,0.12)' : 'rgba(201,168,76,0.12)',
                color: done === 5 ? '#22C55E' : done === 0 ? '#EF4444' : '#C9A84C',
              }}
            >
              {done}/5
            </span>
          </div>
          <CompletionBar rate={record.completionRate} />
        </div>

        {/* Prayer pills (hidden on mobile, visible md+) */}
        <div className="hidden md:flex gap-1.5 flex-shrink-0">
          {record.prayers.map((p) => (
            <PrayerPill key={p.name} name={p.name} status={p.status} />
          ))}
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 ml-2" style={{ color: '#3A4A60' }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 grid grid-cols-5 gap-3">
              {record.prayers.map((p) => {
                const meta = PRAYER_META[p.name];
                const statusColor = {
                  done: '#22C55E', missed: '#EF4444', pending: '#3A4A60', qada: '#F59E0B',
                }[p.status] || '#3A4A60';

                return (
                  <div
                    key={p.name}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: `${statusColor}10`,
                      border: `1px solid ${statusColor}30`,
                    }}
                  >
                    <span className="block text-lg mb-1">{meta.icon}</span>
                    <span className="block text-xs font-semibold mb-1" style={{ color: statusColor }}>
                      {meta.label}
                    </span>
                    <span className="block text-xs capitalize font-medium" style={{ color: statusColor }}>
                      {p.status === 'qada' ? 'Qaḍā' : p.status}
                    </span>
                    {p.markedAt && (
                      <span className="block text-xs mt-1" style={{ color: '#3A4A60' }}>
                        {format(new Date(p.markedAt), 'h:mm a')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {record.notes && (
              <p className="px-5 pb-4 text-sm italic" style={{ color: '#7A8FA8' }}>
                Note: {record.notes}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Masjid Timings Card ──────────────────────────────────────────────────
function MasjidTimingsSection({ masjids, loading }) {
  const [selected, setSelected] = useState(0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} style={{ height: 80, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (!masjids || masjids.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-3xl mb-2">🕌</p>
        <p className="text-sm" style={{ color: '#7A8FA8' }}>
          No masjid timings registered yet. Ask your admin to add them.
        </p>
      </div>
    );
  }

  const masjid = masjids[selected];

  return (
    <div>
      {/* Masjid selector tabs */}
      {masjids.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {masjids.map((m, i) => (
            <button
              key={m._id}
              onClick={() => setSelected(i)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{
                background: selected === i ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected === i ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: selected === i ? '#C9A84C' : '#7A8FA8',
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected masjid detail */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)' }}>

        {/* Masjid header */}
        <div className="px-6 py-4 flex items-start gap-3"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <span className="text-2xl">🕌</span>
          <div>
            <h3 className="font-semibold text-base" style={{ color: '#C9A84C' }}>{masjid.name}</h3>
            {masjid.address && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#7A8FA8' }}>
                <MapPin size={11} /> {masjid.address}
              </p>
            )}
            {masjid.phone && (
              <p className="text-xs mt-0.5" style={{ color: '#3A4A60' }}>📞 {masjid.phone}</p>
            )}
          </div>
        </div>

        {/* Timings grid */}
        <div className="grid grid-cols-5 divide-x"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {PRAYER_NAMES.map((name) => {
            const meta = PRAYER_META[name];
            const time = masjid.timings?.[name];
            return (
              <div key={name} className="px-3 py-4 text-center">
                <span className="block text-xl mb-1">{meta.icon}</span>
                <span className="block text-xs font-semibold mb-2" style={{ color: '#EDE8D8' }}>
                  {meta.label}
                </span>
                <span className="block font-amiri text-xs mb-2" style={{ color: '#7A6130' }}>
                  {meta.arabic}
                </span>
                <span
                  className="block text-sm font-bold"
                  style={{ color: time ? '#C9A84C' : '#3A4A60' }}
                >
                  {time || '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Jumu'ah time if exists */}
        {masjid.jumuahTime && (
          <div className="px-6 py-3 flex items-center gap-2 text-sm"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
            <Clock size={13} style={{ color: '#C9A84C' }} />
            <span>Jumu'ah: </span>
            <span className="font-semibold" style={{ color: '#C9A84C' }}>{masjid.jumuahTime}</span>
            {masjid.jumuahKhatib && (
              <span style={{ color: '#3A4A60' }}>· Khatib: {masjid.jumuahKhatib}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function PrayersPage() {
  const { user } = useAuth();

  const [prayers, setPrayers]             = useState([]);
  const [history, setHistory]             = useState([]);
  const [masjids, setMasjids]             = useState([]);
  const [loadingToday, setLoadingToday]   = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMasjids, setLoadingMasjids] = useState(true);
  const [updatingPrayer, setUpdatingPrayer] = useState(null);
  const [expandedDay, setExpandedDay]     = useState(null);
  const [historyDays, setHistoryDays]     = useState(30);
  const [activeTab, setActiveTab]         = useState('today'); // 'today' | 'history' | 'masjids'

  // ── Fetch today ──
  useEffect(() => {
    api.get('/prayers/today')
      .then((res) => setPrayers(res.data.data.prayers))
      .catch(() => toast.error('Could not load today\'s prayers.'))
      .finally(() => setLoadingToday(false));
  }, []);

  // ── Fetch history ──
  useEffect(() => {
    setLoadingHistory(true);
    api.get(`/prayers/history?days=${historyDays}`)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => toast.error('Could not load history.'))
      .finally(() => setLoadingHistory(false));
  }, [historyDays]);

  // ── Fetch masjids ──
  useEffect(() => {
    api.get('/masjids')
      .then((res) => setMasjids(res.data.data || []))
      .catch(() => {}) // non-critical — fail silently
      .finally(() => setLoadingMasjids(false));
  }, []);

  // ── Update prayer ──
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

  const tabs = [
    { id: 'today',   label: "Today's Salah", icon: '🤲' },
    { id: 'history', label: 'Prayer History', icon: '📅' },
    { id: 'masjids', label: 'Masjid Timings', icon: '🕌' },
  ];

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>
          أَقِمِ الصَّلَاةَ
        </p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Prayer Tracker</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>
          Track your daily Salah, review history, and find masjid timings.
        </p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 mb-8 p-1 rounded-2xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'rgba(201,168,76,0.35)' : 'transparent'}`,
              color: activeTab === tab.id ? '#C9A84C' : '#7A8FA8',
            }}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: TODAY
      ══════════════════════════════════════ */}
      {activeTab === 'today' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Progress ring */}
          <Card className="mb-6 overflow-hidden" glow>
            {loadingToday ? (
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

          {/* Prayer cards */}
          <div className="section-label mb-3">Daily Salah — tap to mark</div>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {loadingToday
              ? Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} style={{ height: 160, borderRadius: 16 }} />
                ))
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
          <p className="text-xs text-center mb-8" style={{ color: '#3A4A60' }}>
            Tap once = Done · Twice = Missed · Third tap = Reset
          </p>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          TAB: HISTORY
      ══════════════════════════════════════ */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

          {/* Range selector */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: '#EDE8D8' }}>
              Prayer History
            </h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setHistoryDays(d)}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold transition"
                  style={{
                    background: historyDays === d ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${historyDays === d ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    color: historyDays === d ? '#C9A84C' : '#7A8FA8',
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Summary strip */}
          {!loadingHistory && history.length > 0 && (() => {
            const totalDone = history.reduce((acc, r) => acc + r.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length, 0);
            const perfect = history.filter((r) => r.completionRate === 100).length;
            const avgPct = Math.round(history.reduce((a, r) => a + r.completionRate, 0) / history.length);
            return (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Total Prayed', value: totalDone, color: '#22C55E', icon: '✅' },
                  { label: 'Perfect Days', value: perfect,   color: '#2DD4BF', icon: '⭐' },
                  { label: 'Avg Completion', value: `${avgPct}%`, color: '#C9A84C', icon: '📊' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-4 text-center"
                    style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* History list */}
          {loadingHistory ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} style={{ height: 72, borderRadius: 16 }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">📿</p>
              <p className="text-sm" style={{ color: '#7A8FA8' }}>
                No prayer records yet for this period.<br />Start tracking today!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <HistoryRow
                  key={record._id}
                  record={record}
                  isExpanded={expandedDay === record._id}
                  onToggle={() => setExpandedDay(expandedDay === record._id ? null : record._id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          TAB: MASJID TIMINGS
      ══════════════════════════════════════ */}
      {activeTab === 'masjids' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: '#EDE8D8' }}>Masjid Prayer Timings</h2>
            <p className="text-xs" style={{ color: '#3A4A60' }}>Managed by admin</p>
          </div>
          <MasjidTimingsSection masjids={masjids} loading={loadingMasjids} />
        </motion.div>
      )}

    </AppLayout>
  );
}
