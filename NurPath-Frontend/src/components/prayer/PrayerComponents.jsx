import { motion } from 'framer-motion';
import { Check, X, RotateCcw, Clock } from 'lucide-react';

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr',    timeLabel: 'Pre-dawn',  arabic: 'الفجر' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr',   timeLabel: 'Midday',    arabic: 'الظهر' },
  asr:     { icon: '🌤️', label: 'Asr',     timeLabel: 'Afternoon', arabic: 'العصر' },
  maghrib: { icon: '🌅', label: 'Maghrib', timeLabel: 'Sunset',    arabic: 'المغرب' },
  isha:    { icon: '🌙', label: 'Isha',    timeLabel: 'Night',     arabic: 'العشاء' },
};

// Animated SVG ring
export function PrayerRing({ prayers = [] }) {
  const done = prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  const missed = prayers.filter((p) => p.status === 'missed').length;
  const pct = Math.round((done / 5) * 100);
  const CIRC = 283;
  const offset = CIRC - (pct / 100) * CIRC;

  const msg = done === 5 ? 'MashAllah! All 5 Complete 🎉' : done === 0 ? "Today's Salah" : `${done} of 5 Prayed`;

  return (
    <div className="flex items-center gap-6 sm:gap-8 p-6 sm:p-7 flex-wrap sm:flex-nowrap"
      style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.04) 0%, rgba(45,212,191,0.03) 100%)' }}>
      {/* Ring */}
      <div className="relative flex-shrink-0 mx-auto sm:mx-0" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="45" fill="none" stroke="#0F2030" strokeWidth="10" />
          {missed > 0 && (
            <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="10"
              strokeDasharray={CIRC} strokeDashoffset={CIRC - (missed / 5) * CIRC} strokeLinecap="round" />
          )}
          <motion.circle cx="60" cy="60" r="45" fill="none"
            stroke={done === 5 ? '#22C55E' : '#2DD4BF'} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: done === 5 ? '#22C55E' : '#2DD4BF' }}>{pct}%</span>
          <span className="text-xs" style={{ color: '#3A4A60' }}>today</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold mb-1" style={{ color: done === 5 ? '#22C55E' : '#EDE8D8' }}>{msg}</h2>
        <p className="text-sm mb-4" style={{ color: '#7A8FA8' }}>
          {done === 5
            ? 'جَزَاكَ اللَّهُ خَيْرًا — May Allah reward you'
            : 'Tap a prayer card to mark it as prayed or missed.'}
        </p>
        <div className="flex gap-3 flex-wrap">
          {prayers.map((p) => {
            const color = p.status === 'done' || p.status === 'qada' ? '#22C55E'
                        : p.status === 'missed' ? '#EF4444' : '#3A4A60';
            return (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full transition-all" style={{ background: color }} />
                <span className="text-xs" style={{ color: '#7A8FA8' }}>{PRAYER_META[p.name]?.label}</span>
              </div>
            );
          })}
        </div>
        {/* Mini stats */}
        <div className="flex gap-4 mt-3">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
            {done} done
          </span>
          {missed > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
              {missed} missed
            </span>
          )}
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(58,74,96,0.3)', color: '#7A8FA8' }}>
            {5 - done - missed} pending
          </span>
        </div>
      </div>
    </div>
  );
}

// Individual prayer card — shows prayer time, status, tap to cycle
export function PrayerCard({ prayer, onUpdate, loading, prayerTime }) {
  const meta = PRAYER_META[prayer.name];
  const status = prayer.status;

  const styles = {
    pending: { border: 'rgba(201,168,76,0.1)',   bg: '#0F1620',                   nameColor: '#EDE8D8', accent: '#3A4A60',  glow: 'none' },
    done:    { border: 'rgba(34,197,94,0.35)',   bg: 'rgba(34,197,94,0.06)',      nameColor: '#22C55E', accent: '#22C55E',  glow: '0 4px 20px rgba(34,197,94,0.1)' },
    missed:  { border: 'rgba(239,68,68,0.35)',   bg: 'rgba(239,68,68,0.06)',      nameColor: '#EF4444', accent: '#EF4444',  glow: '0 4px 20px rgba(239,68,68,0.1)' },
    qada:    { border: 'rgba(245,158,11,0.35)',  bg: 'rgba(245,158,11,0.06)',     nameColor: '#F59E0B', accent: '#F59E0B',  glow: '0 4px 20px rgba(245,158,11,0.1)' },
  };
  const s = styles[status] || styles.pending;

  const cycle = () => {
    const map = { pending: 'done', done: 'missed', missed: 'pending', qada: 'pending' };
    onUpdate(prayer.name, map[status] || 'done');
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      whileTap={{ scale: 0.96 }}
      onClick={!loading ? cycle : undefined}
      className="rounded-2xl p-4 text-center cursor-pointer relative overflow-hidden select-none"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        opacity: loading ? 0.65 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Shimmer on loading */}
      {loading && (
        <div className="absolute inset-0 skeleton rounded-2xl" />
      )}

      {/* Status colored top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all"
        style={{ background: status !== 'pending' ? s.accent : 'transparent' }} />

      <span className="block text-xl mb-1.5">{meta?.icon}</span>
      <span className="block text-xs font-bold mb-0.5" style={{ color: s.nameColor, letterSpacing: '0.5px' }}>
        {meta?.label}
      </span>
      <span className="block font-amiri text-xs mb-1" style={{ color: '#7A6130' }}>{meta?.arabic}</span>

      {/* Prayer time */}
      {prayerTime && (
        <span className="block text-xs mb-2 flex items-center justify-center gap-1" style={{ color: '#3A4A60' }}>
          <Clock size={9} />
          {prayerTime}
        </span>
      )}

      {/* Status circle */}
      <div className="flex items-center justify-center mt-1">
        <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: status !== 'pending' ? `${s.accent}20` : 'rgba(58,74,96,0.2)', border: `1.5px solid ${s.accent}` }}>
          {status === 'done'   && <Check     size={13} style={{ color: '#22C55E' }} />}
          {status === 'missed' && <X         size={13} style={{ color: '#EF4444' }} />}
          {status === 'qada'   && <RotateCcw size={11} style={{ color: '#F59E0B' }} />}
        </div>
      </div>

      <div className="mt-1.5 text-xs font-semibold capitalize" style={{ color: s.accent }}>
        {status === 'qada' ? 'Qaḍā' : status}
      </div>
    </motion.div>
  );
}

// History pill
export function PrayerPill({ name, status }) {
  const colors = {
    done:    { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
    missed:  { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    pending: { bg: 'rgba(58,74,96,0.25)',  color: '#7A8FA8' },
    qada:    { bg: 'rgba(245,158,11,0.12)',color: '#F59E0B' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {PRAYER_META[name]?.label || name}
    </span>
  );
}
