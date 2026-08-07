import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Clock, Minus } from 'lucide-react';

// ─── FARZ META ───────────────────────────────────────────────────────────────

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr',    timeLabel: 'Pre-dawn',  arabic: 'الفجر' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr',   timeLabel: 'Midday',    arabic: 'الظهر' },
  asr:     { icon: '🌤️', label: 'Asr',     timeLabel: 'Afternoon', arabic: 'العصر' },
  maghrib: { icon: '🌅', label: 'Maghrib', timeLabel: 'Sunset',    arabic: 'المغرب' },
  isha:    { icon: '🌙', label: 'Isha',    timeLabel: 'Night',     arabic: 'العشاء' },
};

// ─── SUNNAH META ─────────────────────────────────────────────────────────────

// isFriday: pass true on Fridays to swap Dhuhr sunnah for Jumu'ah
export const SUNNAH_META = {
  fajr_sunnah:    { icon: '🌙', label: 'Fajr',          arabic: 'سنة الفجر',   rakahs: 2,  note: '2 before Fajr' },
  dhuhr_before:   { icon: '☀️', label: 'Dhuhr (before)', arabic: 'سنة الظهر',   rakahs: 4,  note: '4 before Dhuhr' },
  dhuhr_after:    { icon: '☀️', label: 'Dhuhr (after)',  arabic: 'سنة الظهر',   rakahs: 2,  note: '2 after Dhuhr' },
  asr_sunnah:     { icon: '🌤️', label: 'Asr',           arabic: 'سنة العصر',   rakahs: 4,  note: '4 before Asr' },
  maghrib_sunnah: { icon: '🌅', label: 'Maghrib',        arabic: 'سنة المغرب',  rakahs: 2,  note: '2 after Maghrib' },
  isha_sunnah:    { icon: '🌙', label: 'Isha',           arabic: 'سنة العشاء',  rakahs: 2,  note: '2 after Isha' },
  isha_witr:      { icon: '✨', label: 'Witr',           arabic: 'صلاة الوتر', rakahs: null, note: '1, 3, or 5+ after Isha' },
  jumuah_after:   { icon: '🕌', label: "Jumu'ah",        arabic: 'سنة الجمعة',  rakahs: null, note: '4 (masjid) or 2 (home) after Jumu\'ah' },
};

// Rakah count for jumuah_after / isha_witr depends on the variant chosen
export function getSunnahRakahs(name, variant) {
  if (name === 'jumuah_after') {
    if (variant === 'masjid') return 4;
    if (variant === 'home') return 2;
    return null; // not chosen yet
  }
  if (name === 'isha_witr') {
    if (variant === '1') return 1;
    if (variant === '3') return 3;
    if (variant === '5plus') return null; // shown as "5+" label, not a fixed count
    return null;
  }
  return SUNNAH_META[name]?.rakahs ?? null;
}

// ─── FARZ: Animated SVG ring ──────────────────────────────────────────────────

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
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>today</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold mb-1" style={{ color: done === 5 ? '#22C55E' : '#EDE8D8' }}>{msg}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {done === 5
            ? 'جَزَاكَ اللَّهُ خَيْرًا — May Allah reward you'
            : 'Tap a prayer card to choose Done, Missed, or Qaḍā.'}
        </p>
        <div className="flex gap-3 flex-wrap">
          {prayers.map((p) => {
            const color = p.status === 'done' || p.status === 'qada' ? '#22C55E'
                        : p.status === 'missed' ? '#EF4444' : '#3A4A60';
            return (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full transition-all" style={{ background: color }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{PRAYER_META[p.name]?.label}</span>
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
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(58,74,96,0.3)', color: 'var(--text-secondary)' }}>
            {5 - done - missed} pending
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── FARZ: Status picker modal ────────────────────────────────────────────────

function PrayerStatusModal({ prayer, onChoose, onClose }) {
  const meta = PRAYER_META[prayer.name];

  const options = [
    {
      status: 'done',
      label: 'Done',
      arabic: 'أَدَّيْتُ',
      sub: 'Alhamdulillah — I prayed',
      icon: <Check size={20} />,
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.35)',
    },
    {
      status: 'missed',
      label: 'Missed',
      arabic: 'فَاتَتْنِي',
      sub: 'Astaghfirullah — I missed it',
      icon: <X size={20} />,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.3)',
    },
    {
      status: 'qada',
      label: 'Qaḍā',
      arabic: 'قَضَاء',
      sub: 'Making up a missed prayer',
      icon: <RotateCcw size={18} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.3)',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full max-w-sm mx-4 mb-6 sm:mb-0 rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-3xl block mb-2">{meta?.icon}</span>
          <p className="font-amiri text-xl" style={{ color: 'var(--gold)' }}>{meta?.arabic}</p>
          <h3 className="text-base font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {meta?.label} Prayer
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>How did it go?</p>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2.5">
          {options.map((opt) => (
            <motion.button
              key={opt.status}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChoose(opt.status)}
              className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition"
              style={{
                background: opt.bg,
                border: `1px solid ${opt.border}`,
              }}
            >
              {/* Icon circle */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${opt.color}15`, border: `1.5px solid ${opt.color}40`, color: opt.color }}>
                {opt.icon}
              </div>
              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: opt.color }}>{opt.label}</span>
                  <span className="font-amiri text-sm" style={{ color: `${opt.color}80` }}>{opt.arabic}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{opt.sub}</p>
              </div>
              {/* Arrow */}
              <span className="text-sm flex-shrink-0" style={{ color: `${opt.color}60` }}>›</span>
            </motion.button>
          ))}
        </div>

        {/* Cancel */}
        <div className="px-4 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm transition"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── FARZ: Individual prayer card ─────────────────────────────────────────────

export function PrayerCard({ prayer, onUpdate, loading, prayerTime }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const meta = PRAYER_META[prayer.name];
  const status = prayer.status;

  const styles = {
    pending: { border: 'rgba(201,168,76,0.1)',  bg: '#0F1620',              nameColor: '#EDE8D8', accent: '#3A4A60',  glow: 'none' },
    done:    { border: 'rgba(34,197,94,0.35)',  bg: 'rgba(34,197,94,0.06)', nameColor: '#22C55E', accent: '#22C55E',  glow: '0 4px 20px rgba(34,197,94,0.1)' },
    missed:  { border: 'rgba(239,68,68,0.35)',  bg: 'rgba(239,68,68,0.06)', nameColor: '#EF4444', accent: '#EF4444',  glow: '0 4px 20px rgba(239,68,68,0.1)' },
    qada:    { border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.06)',nameColor: '#F59E0B', accent: '#F59E0B',  glow: '0 4px 20px rgba(245,158,11,0.1)' },
  };
  const s = styles[status] || styles.pending;

  const handleChoose = (newStatus) => {
    setPickerOpen(false);
    onUpdate(prayer.name, newStatus);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        whileTap={{ scale: 0.96 }}
        onClick={!loading ? () => setPickerOpen(true) : undefined}
        className="rounded-2xl p-4 text-center cursor-pointer relative overflow-hidden select-none"
        style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          boxShadow: s.glow,
          opacity: loading ? 0.65 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        {loading && <div className="absolute inset-0 skeleton rounded-2xl" />}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all"
          style={{ background: status !== 'pending' ? s.accent : 'transparent' }} />

        <span className="block text-xl mb-1.5">{meta?.icon}</span>
        <span className="block text-xs font-bold mb-0.5" style={{ color: s.nameColor, letterSpacing: '0.5px' }}>
          {meta?.label}
        </span>
        <span className="block font-amiri text-xs mb-1" style={{ color: 'var(--gold-dim)' }}>{meta?.arabic}</span>

        {prayerTime && (
          <span className="block text-xs mb-2 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={9} />
            {prayerTime}
          </span>
        )}

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

      {/* Status picker modal */}
      <AnimatePresence>
        {pickerOpen && (
          <PrayerStatusModal
            prayer={prayer}
            onChoose={handleChoose}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── SUNNAH: Status picker modal ─────────────────────────────────────────────

function SunnahStatusModal({ sunnah, onChoose, onClose }) {
  const meta = SUNNAH_META[sunnah.name];
  const isJumuah = sunnah.name === 'jumuah_after';
  const isWitr = sunnah.name === 'isha_witr';
  const needsVariantPicker = isJumuah || isWitr;

  const options = [
    {
      status: 'done',
      label: 'Done',
      arabic: 'أَدَّيْتُهَا',
      sub: isJumuah ? 'I prayed sunnah after Jumu\'ah' : isWitr ? 'I prayed Witr' : 'Alhamdulillah — I prayed it',
      color: '#A78BFA',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.35)',
      icon: <Check size={18} />,
    },
    {
      status: 'skipped',
      label: 'Skipped',
      arabic: 'تَرَكْتُهَا',
      sub: 'I did not pray this sunnah',
      color: '#6B7280',
      bg: 'rgba(107,114,128,0.08)',
      border: 'rgba(107,114,128,0.25)',
      icon: <Minus size={18} />,
    },
    {
      status: 'pending',
      label: 'Reset',
      arabic: 'إِعَادَةٌ',
      sub: 'Mark as not yet decided',
      color: 'var(--text-muted)',
      bg: 'rgba(58,74,96,0.08)',
      border: 'rgba(58,74,96,0.3)',
      icon: <RotateCcw size={16} />,
    },
  ];

  // For jumuah_after / isha_witr, "done" triggers a variant picker in parent — pass sentinel
  const handleClick = (status) => {
    if (needsVariantPicker && status === 'done') {
      onClose();
      // small delay so modal closes before variant picker opens
      setTimeout(() => onChoose(status, null, true), 120);
      return;
    }
    onChoose(status);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full max-w-sm mx-4 mb-6 sm:mb-0 rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-3xl block mb-2">{meta?.icon}</span>
          <p className="font-amiri text-lg" style={{ color: '#A78BFA' }}>{meta?.arabic}</p>
          <h3 className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {meta?.label} Sunnah
          </h3>
          {meta?.note && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{meta.note}</p>
          )}
        </div>

        {/* Options */}
        <div className="p-4 space-y-2.5">
          {options.map((opt) => (
            <motion.button
              key={opt.status}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(opt.status)}
              className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition"
              style={{ background: opt.bg, border: `1px solid ${opt.border}` }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${opt.color}18`, border: `1.5px solid ${opt.color}40`, color: opt.color }}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: opt.color }}>{opt.label}</span>
                  <span className="font-amiri text-sm" style={{ color: `${opt.color}70` }}>{opt.arabic}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{opt.sub}</p>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: `${opt.color}50` }}>›</span>
            </motion.button>
          ))}
        </div>

        <div className="px-4 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm transition"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SUNNAH: Individual sunnah card ──────────────────────────────────────────

export function SunnahCard({ sunnah, onUpdate, loading }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const meta = SUNNAH_META[sunnah.name];
  const status = sunnah.status;
  const rakahs = getSunnahRakahs(sunnah.name, sunnah.variant);
  const isJumuah = sunnah.name === 'jumuah_after';
  const isWitr = sunnah.name === 'isha_witr';

  const styles = {
    pending: { border: 'rgba(201,168,76,0.08)', bg: 'rgba(255,255,255,0.02)', nameColor: '#7A8FA8', accent: '#3A4A60' },
    done:    { border: 'rgba(139,92,246,0.35)',  bg: 'rgba(139,92,246,0.06)', nameColor: '#A78BFA', accent: '#A78BFA' },
    skipped: { border: 'rgba(58,74,96,0.3)',     bg: 'rgba(58,74,96,0.08)',   nameColor: '#3A4A60', accent: '#3A4A60' },
  };
  const s = styles[status] || styles.pending;

  const handleChoose = (newStatus, variant, openVariantPicker) => {
    setPickerOpen(false);
    onUpdate(sunnah.name, newStatus, variant, openVariantPicker);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -3, boxShadow: '0 6px 24px rgba(0,0,0,0.25)' }}
        whileTap={{ scale: 0.96 }}
        onClick={!loading ? () => setPickerOpen(true) : undefined}
        className="rounded-xl p-3 text-center cursor-pointer relative overflow-hidden select-none"
        style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          opacity: loading ? 0.65 : 1,
          transition: 'all 0.2s ease',
          minHeight: 110,
        }}
      >
        {loading && <div className="absolute inset-0 skeleton rounded-xl" />}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-all"
          style={{ background: status !== 'pending' ? s.accent : 'transparent' }} />

        <span className="block text-base mb-1">{meta?.icon}</span>
        <span className="block text-xs font-bold leading-tight mb-0.5" style={{ color: s.nameColor, fontSize: '0.65rem', letterSpacing: '0.3px' }}>
          {meta?.label}
        </span>

        {/* Rakah badge */}
        <span className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          {isJumuah
            ? (sunnah.variant === 'masjid' ? '4 rak'
             : sunnah.variant === 'home'   ? '2 rak'
             : '?')
            : isWitr
            ? (sunnah.variant === '1'     ? '1 rak'
             : sunnah.variant === '3'     ? '3 rak'
             : sunnah.variant === '5plus' ? '5+ rak'
             : '?')
            : `${rakahs} rak`}
        </span>

        {/* Status icon */}
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
            style={{ background: status !== 'pending' ? `${s.accent}20` : 'rgba(58,74,96,0.15)', border: `1.5px solid ${s.accent}` }}>
            {status === 'done'    && <Check  size={11} style={{ color: '#A78BFA' }} />}
            {status === 'skipped' && <Minus  size={11} style={{ color: 'var(--text-muted)' }} />}
          </div>
        </div>

        <div className="mt-1 text-xs font-semibold capitalize" style={{ color: s.accent, fontSize: '0.6rem' }}>
          {status === 'skipped' ? 'skipped' : status}
        </div>

        {/* Variant badge for jumuah done */}
        {isJumuah && status === 'done' && sunnah.variant && (
          <div className="mt-0.5 text-xs" style={{ color: '#A78BFA', fontSize: '0.58rem' }}>
            {sunnah.variant === 'masjid' ? '🕌 masjid' : '🏠 home'}
          </div>
        )}

        {/* Variant badge for witr done */}
        {isWitr && status === 'done' && sunnah.variant && (
          <div className="mt-0.5 text-xs" style={{ color: '#A78BFA', fontSize: '0.58rem' }}>
            {sunnah.variant === '1' ? '1 rak\'ah' : sunnah.variant === '3' ? '3 rak\'ah' : '5+ rak\'ah'}
          </div>
        )}
      </motion.div>

      {/* Status picker modal */}
      <AnimatePresence>
        {pickerOpen && (
          <SunnahStatusModal
            sunnah={sunnah}
            onChoose={handleChoose}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── SUNNAH: Jumu'ah variant picker modal ────────────────────────────────────

export function JumuahVariantModal({ open, onChoose, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl p-6 w-full max-w-xs mx-4 mb-4 sm:mb-0"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.3)' }}
        onClick={(e) => e.stopPropagation()}>
        <p className="font-amiri text-lg mb-1 text-center" style={{ color: 'var(--gold)' }}>سنة الجمعة</p>
        <h3 className="text-sm font-semibold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          Where did you pray Jumu'ah?
        </h3>
        <p className="text-xs text-center mb-5" style={{ color: 'var(--text-secondary)' }}>
          This determines how many sunnah rak'ah to log.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onChoose('masjid')}
            className="rounded-xl py-4 flex flex-col items-center gap-2 transition"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <span className="text-2xl">🕌</span>
            <span className="text-sm font-semibold" style={{ color: '#A78BFA' }}>Masjid</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>4 rak'ah</span>
          </button>
          <button onClick={() => onChoose('home')}
            className="rounded-xl py-4 flex flex-col items-center gap-2 transition"
            style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)' }}>
            <span className="text-2xl">🏠</span>
            <span className="text-sm font-semibold" style={{ color: '#2DD4BF' }}>Home</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>2 rak'ah</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-4 text-xs py-2" style={{ color: 'var(--text-muted)' }}>
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

// ─── SUNNAH: Witr rak'ah picker modal ────────────────────────────────────────

export function WitrVariantModal({ open, onChoose, onClose }) {
  if (!open) return null;
  const options = [
    { key: '1', icon: '✨', label: '1 Rak\'ah', color: '#A78BFA', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.3)' },
    { key: '3', icon: '✨', label: '3 Rak\'ah', color: '#2DD4BF', bg: 'rgba(45,212,191,0.06)', border: 'rgba(45,212,191,0.2)' },
    { key: '5plus', icon: '✨', label: '5+ Rak\'ah', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl p-6 w-full max-w-xs mx-4 mb-4 sm:mb-0"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.3)' }}
        onClick={(e) => e.stopPropagation()}>
        <p className="font-amiri text-lg mb-1 text-center" style={{ color: 'var(--gold)' }}>صلاة الوتر</p>
        <h3 className="text-sm font-semibold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          How many rak'ah of Witr?
        </h3>
        <p className="text-xs text-center mb-5" style={{ color: 'var(--text-secondary)' }}>
          Witr is prayed in an odd number of rak'ah.
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {options.map((opt) => (
            <button key={opt.key} onClick={() => onChoose(opt.key)}
              className="rounded-xl py-4 flex flex-col items-center gap-2 transition"
              style={{ background: opt.bg, border: `1px solid ${opt.border}` }}>
              <span className="text-xl">{opt.icon}</span>
              <span className="text-xs font-semibold text-center leading-tight" style={{ color: opt.color }}>{opt.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-4 text-xs py-2" style={{ color: 'var(--text-muted)' }}>
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

// ─── SUNNAH: Row of mini pills (for history expanded view) ───────────────────

export function SunnahPill({ name, status, variant }) {
  const meta = SUNNAH_META[name];
  const colors = {
    done:    { bg: 'rgba(139,92,246,0.12)', color: '#A78BFA' },
    skipped: { bg: 'rgba(58,74,96,0.2)',    color: 'var(--text-muted)' },
    pending: { bg: 'rgba(58,74,96,0.12)',   color: 'var(--text-muted)' },
  };
  const c = colors[status] || colors.pending;
  const rakahs = getSunnahRakahs(name, variant);
  const rakahLabel = name === 'isha_witr' && variant === '5plus' ? '5+' : rakahs;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{ background: c.bg, color: c.color }}>
      {meta?.label}{rakahLabel ? ` (${rakahLabel})` : ''}
    </span>
  );
}

// ─── FARZ: History pill (unchanged) ──────────────────────────────────────────

export function PrayerPill({ name, status }) {
  const colors = {
    done:    { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
    missed:  { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    pending: { bg: 'rgba(58,74,96,0.25)',  color: 'var(--text-secondary)' },
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
