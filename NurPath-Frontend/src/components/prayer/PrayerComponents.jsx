import { motion } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr',    time: 'Pre-dawn',  arabic: 'الفجر' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr',   time: 'Midday',    arabic: 'الظهر' },
  asr:     { icon: '🌤️', label: 'Asr',     time: 'Afternoon', arabic: 'العصر' },
  maghrib: { icon: '🌅', label: 'Maghrib', time: 'Sunset',    arabic: 'المغرب' },
  isha:    { icon: '🌙', label: 'Isha',    time: 'Night',     arabic: 'العشاء' },
};

// Animated SVG ring showing today's completion %
export function PrayerRing({ prayers = [] }) {
  const done = prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  const pct = Math.round((done / 5) * 100);
  const CIRC = 283;
  const offset = CIRC - (pct / 100) * CIRC;

  const message =
    done === 5 ? 'MashAllah! All 5 Complete 🎉' :
    done === 0 ? "Today's Prayers" :
    `${done} of 5 Prayed`;

  return (
    <div className="flex items-center gap-8 p-7"
      style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(45,212,191,0.04) 100%)' }}>
      {/* Ring */}
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="45" fill="none" stroke="#162030" strokeWidth="9" />
          <motion.circle
            cx="60" cy="60" r="45"
            fill="none" stroke="#2DD4BF" strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: '#2DD4BF' }}>{pct}%</span>
          <span className="text-xs" style={{ color: '#7A8FA8' }}>today</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-1" style={{ color: done === 5 ? '#2DD4BF' : '#EDE8D8' }}>
          {message}
        </h2>
        <p className="text-sm mb-4" style={{ color: '#7A8FA8' }}>
          Click a prayer card to cycle through: Pending → Done → Missed
        </p>
        {/* Dot row */}
        <div className="flex gap-4 flex-wrap">
          {prayers.map((p) => {
            const meta = PRAYER_META[p.name];
            const color = p.status === 'done' || p.status === 'qada' ? '#22C55E' :
                          p.status === 'missed' ? '#EF4444' : '#3A4A60';
            return (
              <div key={p.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: color }} />
                <span className="text-xs" style={{ color: '#7A8FA8' }}>{meta?.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Individual prayer tap card
export function PrayerCard({ prayer, onUpdate, loading }) {
  const meta = PRAYER_META[prayer.name];
  const status = prayer.status;

  const styles = {
    pending: { border: 'rgba(201,168,76,0.12)', bg: 'transparent', nameColor: '#EDE8D8', dot: '#3A4A60', glow: 'none' },
    done:    { border: 'rgba(34,197,94,0.3)',   bg: 'rgba(34,197,94,0.05)', nameColor: '#22C55E', dot: '#22C55E', glow: '0 0 20px rgba(34,197,94,0.1)' },
    missed:  { border: 'rgba(239,68,68,0.3)',   bg: 'rgba(239,68,68,0.05)', nameColor: '#EF4444', dot: '#EF4444', glow: '0 0 20px rgba(239,68,68,0.1)' },
    qada:    { border: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.05)', nameColor: '#F59E0B', dot: '#F59E0B', glow: '0 0 20px rgba(245,158,11,0.1)' },
  };
  const s = styles[status] || styles.pending;

  const cycleStatus = () => {
    const cycle = { pending: 'done', done: 'missed', missed: 'pending', qada: 'pending' };
    onUpdate(prayer.name, cycle[status] || 'done');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={!loading ? cycleStatus : undefined}
      className="rounded-2xl p-5 text-center cursor-pointer relative overflow-hidden transition-all"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(180deg, rgba(201,168,76,0.04) 0%, transparent 100%)' }} />

      <span className="block text-2xl mb-2">{meta?.icon}</span>
      <span className="block text-sm font-semibold mb-1" style={{ color: s.nameColor }}>
        {meta?.label}
      </span>
      <span className="block text-xs mb-3" style={{ color: '#3A4A60' }}>{meta?.time}</span>
      <span className="block font-amiri text-xs mb-3" style={{ color: '#7A6130' }}>{meta?.arabic}</span>

      {/* Status indicator */}
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{ background: `${s.dot}20`, border: `1.5px solid ${s.dot}` }}>
          {status === 'done' && <Check size={12} style={{ color: '#22C55E' }} />}
          {status === 'missed' && <X size={12} style={{ color: '#EF4444' }} />}
          {status === 'qada' && <RotateCcw size={12} style={{ color: '#F59E0B' }} />}
        </div>
      </div>

      <div className="mt-2 text-xs font-medium capitalize" style={{ color: s.dot }}>
        {status === 'qada' ? 'Qaḍā' : status}
      </div>
    </motion.div>
  );
}

// Prayer history pill
export function PrayerPill({ name, status }) {
  const colors = {
    done:    { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
    missed:  { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    pending: { bg: 'rgba(58,74,96,0.3)',   color: '#7A8FA8' },
    qada:    { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {PRAYER_META[name]?.label || name}
    </span>
  );
}
