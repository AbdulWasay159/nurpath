import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { Flame, Star, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr' },
  asr:     { icon: '🌤️', label: 'Asr' },
  maghrib: { icon: '🌅', label: 'Maghrib' },
  isha:    { icon: '🌙', label: 'Isha' },
};

// ── Animated number ──────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) return;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

// ── Circular progress ────────────────────────────────────────────────────
function CircleProgress({ pct, color = '#C9A84C', size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }} />
    </svg>
  );
}

// ── Heatmap (last 10 weeks) ──────────────────────────────────────────────
function PrayerHeatmap({ history }) {
  const today = new Date();
  const cells = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-CA');
    const record = history.find((r) => r.date === key);
    const pct = record ? record.completionRate : null;
    cells.push({ date: key, pct, label: format(d, 'MMM d') });
  }

  const getColor = (pct) => {
    if (pct === null) return 'rgba(255,255,255,0.05)';
    if (pct === 100) return '#22C55E';
    if (pct >= 80) return '#4ADE80';
    if (pct >= 60) return '#C9A84C';
    if (pct >= 40) return '#F59E0B';
    if (pct > 0)   return '#EF4444';
    return 'rgba(239,68,68,0.2)';
  };

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {cells.map((cell) => (
          <div key={cell.date} title={`${cell.label}: ${cell.pct !== null ? cell.pct + '%' : 'No data'}`}
            className="w-3.5 h-3.5 rounded-sm transition-opacity hover:opacity-80 cursor-default"
            style={{ background: getColor(cell.pct) }} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#3A4A60' }}>
        <span>Less</span>
        {['rgba(255,255,255,0.05)', 'rgba(239,68,68,0.3)', '#F59E0B', '#C9A84C', '#22C55E'].map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/prayers/stats'),
      api.get('/prayers/history?days=70'),
      api.get('/events'),
    ]).then(([statsRes, histRes, eventsRes]) => {
      setStats(statsRes.data.data);
      setHistory(histRes.data.data || []);
      setEvents(eventsRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Statistics</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
        <div className="h-48 rounded-2xl animate-pulse mb-6" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </AppLayout>
    );
  }

  const totalDays = history.length;
  const totalPossible = totalDays * 5;
  const overallPct = totalPossible ? Math.round(((stats?.totalPrayed || 0) / totalPossible) * 100) : 0;
  const fajrConsistency = totalDays ? Math.round((stats?.byPrayer?.fajr?.done || 0) / totalDays * 100) : 0;
  const eventCount = events.length;

  // Best streak from history
  let longestStreak = 0, cur = 0;
  [...history].reverse().forEach((r) => {
    if (r.completionRate === 100) { cur++; longestStreak = Math.max(longestStreak, cur); }
    else cur = 0;
  });

  const topStats = [
    { icon: <Flame size={22} />, label: 'Current Streak', value: stats?.streak?.current || 0, suffix: ' days', color: '#F59E0B', sub: 'consecutive perfect days' },
    { icon: <Star size={22} />, label: 'Longest Streak', value: stats?.streak?.longest || longestStreak, suffix: ' days', color: '#2DD4BF', sub: 'personal best' },
    { icon: <CheckCircle size={22} />, label: 'Total Prayed', value: stats?.totalPrayed || 0, suffix: '', color: '#22C55E', sub: 'all time' },
    { icon: <XCircle size={22} />, label: 'Total Missed', value: stats?.totalMissed || 0, suffix: '', color: '#EF4444', sub: 'all time' },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا</p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Statistics</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>Your prayer performance at a glance.</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {topStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 flex flex-col items-center text-center"
            style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
            <div className="mb-2" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
            <div className="text-sm font-medium mb-0.5" style={{ color: '#EDE8D8' }}>{s.label}</div>
            <div className="text-xs" style={{ color: '#3A4A60' }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Overall + Fajr + Perfect days ring row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Overall Adherence', pct: overallPct, color: '#C9A84C', sub: `${stats?.totalPrayed || 0} of ${totalPossible} prayers` },
          { label: 'Fajr Consistency', pct: fajrConsistency, color: '#2DD4BF', sub: `Hardest prayer to keep` },
          { label: 'Perfect Days', pct: totalDays ? Math.round((stats?.perfectDays || 0) / totalDays * 100) : 0, color: '#22C55E', sub: `${stats?.perfectDays || 0} of ${totalDays} days` },
        ].map((ring, i) => (
          <motion.div key={ring.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-2xl p-6 flex flex-col items-center text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="relative mb-3">
              <CircleProgress pct={ring.pct} color={ring.color} size={88} stroke={8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: ring.color }}>{ring.pct}%</span>
              </div>
            </div>
            <div className="text-sm font-semibold mb-1" style={{ color: '#EDE8D8' }}>{ring.label}</div>
            <div className="text-xs" style={{ color: '#3A4A60' }}>{ring.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Per-prayer breakdown */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
        <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: '#C9A84C' }}>
          <TrendingUp size={16} /> Per-Prayer Breakdown
        </h2>
        <div className="space-y-4">
          {PRAYER_NAMES.map((name) => {
            const meta = PRAYER_META[name];
            const d = stats?.byPrayer?.[name]?.done || 0;
            const m = stats?.byPrayer?.[name]?.missed || 0;
            const total = d + m + (stats?.byPrayer?.[name]?.pending || 0);
            const pct = total ? Math.round((d / total) * 100) : 0;
            const col = pct === 100 ? '#22C55E' : pct >= 70 ? '#C9A84C' : pct >= 40 ? '#F59E0B' : '#EF4444';
            return (
              <div key={name} className="flex items-center gap-4">
                <span className="text-lg w-7 flex-shrink-0">{meta.icon}</span>
                <span className="text-sm font-medium w-16 flex-shrink-0" style={{ color: '#EDE8D8' }}>{meta.label}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: col }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                </div>
                <span className="text-sm font-bold w-10 text-right" style={{ color: col }}>{pct}%</span>
                <span className="text-xs w-24 text-right" style={{ color: '#3A4A60' }}>
                  {d} prayed{m > 0 ? ` · ${m} missed` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events section */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(45,212,191,0.03)', border: '1px solid rgba(45,212,191,0.1)' }}>
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ color: '#2DD4BF' }}>
          <Calendar size={16} /> Islamic Events
        </h2>
        <p className="text-xs mb-5" style={{ color: '#3A4A60' }}>Events registered in the system</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Events', value: eventCount, color: '#2DD4BF', icon: '🕌' },
            { label: 'Upcoming', value: events.filter((e) => new Date(e.date) >= new Date()).length, color: '#C9A84C', icon: '📅' },
            { label: 'Past Events', value: events.filter((e) => new Date(e.date) < new Date()).length, color: '#7A8FA8', icon: '✅' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}><AnimatedNumber value={s.value} /></div>
              <div className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Category breakdown */}
        {eventCount > 0 && (() => {
          const cats = {};
          events.forEach((e) => { cats[e.category] = (cats[e.category] || 0) + 1; });
          return (
            <div className="flex flex-wrap gap-2">
              {Object.entries(cats).map(([cat, count]) => (
                <span key={cat} className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                  style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2DD4BF' }}>
                  {cat}: {count}
                </span>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Activity heatmap */}
      {history.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#EDE8D8' }}>Activity Heatmap</h2>
          <p className="text-xs mb-5" style={{ color: '#3A4A60' }}>Last 70 days — darker = more prayers completed</p>
          <PrayerHeatmap history={history} />
        </div>
      )}
    </AppLayout>
  );
}
