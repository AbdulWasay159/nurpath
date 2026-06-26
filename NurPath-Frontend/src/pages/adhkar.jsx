import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { getMorningAdhkar, getEveningAdhkar } from '../lib/adhkar';
import { Sun, Moon, ChevronDown, ChevronUp, RotateCcw, CheckCircle2, Info } from 'lucide-react';

// ── Storage helpers ──────────────────────────────────────────────────────────
function storageKey(tab) {
  const date = new Date().toLocaleDateString('en-CA');
  return `adhkar-progress-${tab}-${date}`;
}
function loadProgress(tab) {
  try {
    const raw = sessionStorage.getItem(storageKey(tab));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveProgress(tab, data) {
  try { sessionStorage.setItem(storageKey(tab), JSON.stringify(data)); } catch { /* silent */ }
}

// ── Tab default ──────────────────────────────────────────────────────────────
function getDefaultTab() {
  const h = new Date().getHours();
  return h >= 15 || h < 4 ? 'evening' : 'morning';
}

// ── Single Dhikr Card ────────────────────────────────────────────────────────
function DhikrCard({ dhikr, index, tab, done, onDone, onUndo }) {
  const [expanded, setExpanded] = useState(false);
  const [showVirtue, setShowVirtue] = useState(false);

  const countLabel =
    dhikr.count === 1 ? 'Once' :
    dhikr.count === 3 ? 'Thrice' :
    dhikr.count === 7 ? '7 times' :
    `${dhikr.count}×`;

  const timingLabel =
    dhikr.timing.length === 2 ? 'Morning & Evening' :
    dhikr.timing[0] === 'morning' ? 'Morning' : 'Evening';

  const accentColor = tab === 'morning' ? '#C9A84C' : '#A78BFA';
  const accentBg    = tab === 'morning' ? 'rgba(201,168,76,0.15)' : 'rgba(139,92,246,0.15)';
  const accentBorder= tab === 'morning' ? 'rgba(201,168,76,0.35)' : 'rgba(139,92,246,0.35)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: done ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'border-color 0.35s, background 0.35s',
      }}>

      {/* ── Top row: badges + action icons ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: accentBg, color: accentColor }}>
            {countLabel}
          </span>
          <span className="text-xs" style={{ color: '#3A4A60' }}>{timingLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {dhikr.virtue && (
            <button onClick={() => setShowVirtue(!showVirtue)}
              className="p-1.5 rounded-lg transition hover:bg-white/10"
              style={{ color: showVirtue ? accentColor : '#3A4A60' }}
              title="Hadith virtue">
              <Info size={13} />
            </button>
          )}
          {done
            ? (
              <button onClick={onUndo}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition hover:bg-white/10"
                style={{ color: '#3A4A60' }}
                title="Mark as not done">
                <RotateCcw size={12} /> Undo
              </button>
            )
            : null
          }
          {done && <CheckCircle2 size={16} style={{ color: '#22C55E', flexShrink: 0 }} />}
        </div>
      </div>

      {/* ── Arabic text (read-only display) ── */}
      <div className="px-5 py-3 text-right" style={{ direction: 'rtl' }}>
        <p className="font-amiri leading-loose select-text"
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            color: done ? '#22C55E' : '#EDE8D8',
            lineHeight: 2,
            transition: 'color 0.35s',
          }}>
          {dhikr.arabic}
        </p>
      </div>

      {/* ── Done button (only when not done) ── */}
      {!done && (
        <div className="px-5 pb-4 pt-1">
          <button
            onClick={onDone}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95"
            style={{
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              color: accentColor,
            }}>
            <CheckCircle2 size={15} />
            Done{dhikr.count > 1 ? ` (read ${countLabel})` : ''}
          </button>
        </div>
      )}

      {/* ── Transliteration + Translation toggle ── */}
      <button
        className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-left transition hover:bg-white/[0.02]"
        onClick={() => setExpanded(!expanded)}
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color: '#7A8FA8' }}>Transliteration &amp; Translation</span>
        {expanded
          ? <ChevronUp size={14} style={{ color: '#3A4A60' }} />
          : <ChevronDown size={14} style={{ color: '#3A4A60' }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden">
            <div className="px-5 pb-4 space-y-3">
              <p className="text-sm italic leading-relaxed"
                style={{ color: accentColor, fontFamily: 'serif' }}>
                {dhikr.transliteration}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#7A8FA8' }}>
                {dhikr.translation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Virtue / Hadith ── */}
      <AnimatePresence>
        {showVirtue && dhikr.virtue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden">
            <div className="px-5 pb-4 pt-1"
              style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
              <p className="text-xs leading-relaxed italic" style={{ color: '#7A6130' }}>
                📖 {dhikr.virtue}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdhkarPage() {
  const [tab, setTab] = useState(getDefaultTab);

  // Single source of truth for completion — lives in parent so the
  // progress bar always reflects live state immediately.
  const [doneMap, setDoneMap] = useState(() => loadProgress(getDefaultTab()));

  const adhkar = tab === 'morning' ? getMorningAdhkar() : getEveningAdhkar();

  // When switching tabs, reload persisted progress for that tab
  const switchTab = (newTab) => {
    setTab(newTab);
    setDoneMap(loadProgress(newTab));
  };

  const markDone = useCallback((dhikrId) => {
    setDoneMap((prev) => {
      const next = { ...prev, [dhikrId]: true };
      saveProgress(tab, next);
      return next;
    });
  }, [tab]);

  const markUndo = useCallback((dhikrId) => {
    setDoneMap((prev) => {
      const next = { ...prev };
      delete next[dhikrId];
      saveProgress(tab, next);
      return next;
    });
  }, [tab]);

  const handleResetAll = () => {
    const empty = {};
    saveProgress(tab, empty);
    setDoneMap(empty);
  };

  // Progress derived directly from live doneMap — updates instantly on every mark
  const completed = adhkar.filter((d) => doneMap[d.id]).length;
  const total = adhkar.length;
  const allDone = completed === total;

  const accentColor = tab === 'morning' ? '#C9A84C' : '#A78BFA';

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>
          {tab === 'morning' ? 'أَذْكَارُ الصَّبَاحِ' : 'أَذْكَارُ الْمَسَاءِ'}
        </p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>
          {tab === 'morning' ? 'Morning Adhkar' : 'Evening Adhkar'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>
          {tab === 'morning'
            ? 'Recite after Fajr prayer until before Dhuhr.'
            : 'Recite after Asr prayer until before Maghrib.'}
        </p>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-3 mb-6">
        {[
          { key: 'morning', label: 'Morning', Icon: Sun, color: '#C9A84C', bg: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.35)' },
          { key: 'evening', label: 'Evening', Icon: Moon, color: '#A78BFA', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)' },
        ].map(({ key, label, Icon, color, bg, border }) => (
          <button key={key} onClick={() => switchTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{
              background: tab === key ? bg : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === key ? border : 'rgba(255,255,255,0.07)'}`,
              color: tab === key ? color : '#7A8FA8',
            }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* ── Progress summary bar — updates live on every completion ── */}
      <div className="rounded-2xl p-4 mb-6"
        style={{
          background: allDone ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${allDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
          transition: 'all 0.4s',
        }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: allDone ? '#22C55E' : '#EDE8D8' }}>
            {allDone
              ? 'MashAllah! All adhkar completed ✓'
              : `${completed} of ${total} adhkar completed`}
          </span>
          <button onClick={handleResetAll}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition hover:bg-white/10"
            style={{ color: '#3A4A60' }}>
            <RotateCcw size={11} /> Reset all
          </button>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            transition={{ duration: 0.35 }}
            style={{ background: allDone ? '#22C55E' : accentColor }}
          />
        </div>
      </div>

      {/* ── Instruction note ── */}
      <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
        style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.08)' }}>
        <Info size={14} style={{ color: '#7A6130', flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#7A6130' }}>
          Read the dhikr on your fingers, then tap <strong style={{ color: '#C9A84C' }}>Done</strong> to mark it complete.
          Tap <strong style={{ color: '#C9A84C' }}>ℹ</strong> on any card for the Hadith virtue.
          Progress resets automatically the next day.
        </p>
      </div>

      {/* ── Adhkar list ── */}
      <div className="space-y-3">
        {adhkar.map((d, i) => (
          <DhikrCard
            key={`${tab}-${d.id}`}
            dhikr={d}
            index={i}
            tab={tab}
            done={!!doneMap[d.id]}
            onDone={() => markDone(d.id)}
            onUndo={() => markUndo(d.id)}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 pt-6 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="font-amiri text-lg mb-1" style={{ color: '#7A6130' }}>
          وَذَكَرَ اللَّهَ كَثِيرًا
        </p>
        <p className="text-xs" style={{ color: '#3A4A60' }}>
          Source: Subah Shaam ke Azkaar — all adhkar are from authentic hadith (Ṣaḥīḥ Bukhārī, Muslim, Abu Dāwūd, Tirmiẕī & others)
        </p>
      </div>
    </AppLayout>
  );
}
