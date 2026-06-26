import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import { PrayerPill, SunnahPill, SUNNAH_META, getSunnahRakahs } from '../components/prayer/PrayerComponents';
import api from '../lib/api';
import { ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';

// ─── FARZ META ───────────────────────────────────────────────────────────────

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr' },
  asr:     { icon: '🌤️', label: 'Asr' },
  maghrib: { icon: '🌅', label: 'Maghrib' },
  isha:    { icon: '🌙', label: 'Isha' },
};

const STATUS_OPTS = ['pending', 'done', 'missed', 'qada'];
const SUNNAH_STATUS_OPTS = ['pending', 'done', 'skipped'];

const STATUS_COLORS = {
  done:    '#22C55E',
  missed:  '#EF4444',
  pending: '#3A4A60',
  qada:    '#F59E0B',
};
const SUNNAH_STATUS_COLORS = {
  done:    '#A78BFA',
  skipped: '#3A4A60',
  pending: '#2A3A50',
};

// ─── FARZ EDIT MODAL ─────────────────────────────────────────────────────────

function EditPrayerModal({ date, prayer, onSave, onClose }) {
  const [status, setStatus] = useState(prayer.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/prayers/${date}/${prayer.name}`, { status });
      onSave();
    } catch {
      // silent — parent reloads
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-6 w-full max-w-xs mx-4"
        style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.2)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm capitalize" style={{ color: '#EDE8D8' }}>
            {PRAYER_META[prayer.name]?.icon} Edit {PRAYER_META[prayer.name]?.label}
          </h3>
          <button onClick={onClose} style={{ color: '#3A4A60' }}><X size={16} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: '#7A8FA8' }}>{date}</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {STATUS_OPTS.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className="py-2.5 rounded-xl text-sm font-semibold capitalize transition"
              style={{
                background: status === s ? `${STATUS_COLORS[s]}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${status === s ? STATUS_COLORS[s] : 'rgba(255,255,255,0.07)'}`,
                color: status === s ? STATUS_COLORS[s] : '#7A8FA8',
              }}>
              {s === 'qada' ? 'Qaḍā' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving || status === prayer.status}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
          style={{
            background: saving || status === prayer.status ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: saving || status === prayer.status ? '#7A6130' : '#C9A84C',
          }}>
          <Check size={14} />{saving ? 'Saving…' : 'Save'}
        </button>
      </motion.div>
    </div>
  );
}

// ─── SUNNAH EDIT MODAL ───────────────────────────────────────────────────────

function EditSunnahModal({ date, sunnah, onSave, onClose }) {
  const [status, setStatus] = useState(sunnah.status);
  const [variant, setVariant] = useState(sunnah.variant || null);
  const [saving, setSaving] = useState(false);
  const meta = SUNNAH_META[sunnah.name];
  const isJumuah = sunnah.name === 'jumuah_after';

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { status };
      if (isJumuah) body.variant = variant;
      await api.put(`/prayers/${date}/sunnah/${sunnah.name}`, body);
      onSave();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const unchanged = status === sunnah.status && (!isJumuah || variant === sunnah.variant);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-6 w-full max-w-xs mx-4"
        style={{ background: '#0F1620', border: '1px solid rgba(139,92,246,0.25)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: '#EDE8D8' }}>
            {meta?.icon} Edit Sunnah — {meta?.label}
          </h3>
          <button onClick={onClose} style={{ color: '#3A4A60' }}><X size={16} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: '#7A8FA8' }}>{date} · {meta?.note}</p>

        {/* Status options */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SUNNAH_STATUS_OPTS.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className="py-2.5 rounded-xl text-xs font-semibold capitalize transition"
              style={{
                background: status === s ? `${SUNNAH_STATUS_COLORS[s]}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${status === s ? SUNNAH_STATUS_COLORS[s] : 'rgba(255,255,255,0.07)'}`,
                color: status === s ? SUNNAH_STATUS_COLORS[s] : '#7A8FA8',
              }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Jumu'ah variant picker */}
        {isJumuah && status === 'done' && (
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: '#7A8FA8' }}>Where did you pray?</p>
            <div className="grid grid-cols-2 gap-2">
              {['masjid', 'home'].map((v) => (
                <button key={v} onClick={() => setVariant(v)}
                  className="py-2.5 rounded-xl text-sm font-semibold capitalize transition"
                  style={{
                    background: variant === v ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${variant === v ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    color: variant === v ? '#A78BFA' : '#7A8FA8',
                  }}>
                  {v === 'masjid' ? '🕌 Masjid (4)' : '🏠 Home (2)'}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving || unchanged}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
          style={{
            background: saving || unchanged ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: saving || unchanged ? '#5A4A8A' : '#A78BFA',
          }}>
          <Check size={14} />{saving ? 'Saving…' : 'Save'}
        </button>
      </motion.div>
    </div>
  );
}

// ─── HISTORY ROW ─────────────────────────────────────────────────────────────

function HistoryRow({ record, isExpanded, onToggle, onRecordUpdated }) {
  const date = parseISO(record.date);
  const isToday = record.date === new Date().toLocaleDateString('en-CA');

  // Farz
  const done   = record.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  const missed = record.prayers.filter((p) => p.status === 'missed').length;
  const barColor = record.completionRate === 100 ? '#22C55E' : record.completionRate >= 60 ? '#C9A84C' : '#EF4444';

  // Sunnah
  const sunnah        = record.sunnahPrayers || [];
  const sunnahDone    = sunnah.filter((s) => s.status === 'done').length;
  const sunnahTotal   = sunnah.length;
  const sunnahPct     = sunnahTotal ? Math.round((sunnahDone / sunnahTotal) * 100) : 0;

  const [editingPrayer, setEditingPrayer]   = useState(null);
  const [editingSunnah, setEditingSunnah]   = useState(null);

  const handleEditSave = () => {
    setEditingPrayer(null);
    setEditingSunnah(null);
    onRecordUpdated();
  };

  return (
    <>
      {editingPrayer && !isToday && (
        <EditPrayerModal date={record.date} prayer={editingPrayer}
          onSave={handleEditSave} onClose={() => setEditingPrayer(null)} />
      )}
      {editingSunnah && !isToday && (
        <EditSunnahModal date={record.date} sunnah={editingSunnah}
          onSave={handleEditSave} onClose={() => setEditingSunnah(null)} />
      )}

      <div className="rounded-2xl overflow-hidden transition-all"
        style={{ background: isExpanded ? 'rgba(201,168,76,0.04)' : 'transparent', border: `1px solid ${isExpanded ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}` }}>

        {/* ── Summary row (always visible) ── */}
        <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition">
          {/* Date block */}
          <div className="flex-shrink-0 w-14 text-center">
            <div className="text-xs font-bold uppercase" style={{ color: '#7A8FA8' }}>{format(date, 'EEE')}</div>
            <div className="text-2xl font-bold leading-none mt-0.5" style={{ color: isToday ? '#C9A84C' : '#EDE8D8' }}>{format(date, 'd')}</div>
            <div className="text-xs" style={{ color: '#3A4A60' }}>{format(date, 'MMM')}</div>
            {isToday && <div className="text-xs font-semibold mt-0.5" style={{ color: '#C9A84C' }}>Today</div>}
          </div>

          {/* Farz progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-sm font-medium" style={{ color: '#EDE8D8' }}>
                {done === 5 ? 'MashAllah! All 5 prayed ✓' : done === 0 ? 'No prayers recorded' : `${done} of 5 prayed`}
              </span>
              {missed > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                  {missed} missed
                </span>
              )}
            </div>
            {/* Farz bar */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full" style={{ background: barColor }}
                  initial={{ width: 0 }} animate={{ width: `${record.completionRate}%` }} transition={{ duration: 0.6 }} />
              </div>
              <span className="text-xs font-semibold w-9 text-right" style={{ color: barColor }}>{record.completionRate}%</span>
            </div>
            {/* Sunnah mini bar */}
            {sunnahTotal > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs w-12 flex-shrink-0" style={{ color: '#5A4A8A' }}>Sunnah</span>
                <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: 'rgba(139,92,246,0.5)' }}
                    initial={{ width: 0 }} animate={{ width: `${sunnahPct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
                </div>
                <span className="text-xs font-semibold w-9 text-right" style={{ color: '#7C5FBF' }}>{sunnahDone}/{sunnahTotal}</span>
              </div>
            )}
          </div>

          {/* Farz pills — md+ */}
          <div className="hidden md:flex gap-1.5 flex-shrink-0">
            {record.prayers.map((p) => <PrayerPill key={p.name} name={p.name} status={p.status} />)}
          </div>

          <div className="flex-shrink-0" style={{ color: '#3A4A60' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* ── Expanded detail ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="px-5 pb-5">

                {/* Mobile farz pills */}
                <div className="flex gap-2 flex-wrap mb-4 md:hidden">
                  {record.prayers.map((p) => <PrayerPill key={p.name} name={p.name} status={p.status} />)}
                </div>

                {/* ── Farz grid ── */}
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: '#C9A84C' }}>Farz</p>
                <div className="grid grid-cols-5 gap-3 mb-5">
                  {record.prayers.map((p) => {
                    const meta = PRAYER_META[p.name];
                    const col = STATUS_COLORS[p.status] || '#3A4A60';
                    return (
                      <div key={p.name} className="rounded-xl p-3 text-center relative group" style={{ background: `${col}10`, border: `1px solid ${col}30` }}>
                        <span className="block text-lg mb-1">{meta.icon}</span>
                        <span className="block text-xs font-semibold mb-1" style={{ color: col }}>{meta.label}</span>
                        <span className="block text-xs capitalize font-medium" style={{ color: col }}>{p.status === 'qada' ? 'Qaḍā' : p.status}</span>
                        {p.markedAt && (
                          <span className="block text-xs mt-1" style={{ color: '#3A4A60' }}>
                            {format(new Date(p.markedAt), 'h:mm a')}
                          </span>
                        )}
                        {p.method && (
                          <span className="block text-xs mt-1 capitalize" style={{ color: '#3A4A60' }}>{p.method}</span>
                        )}
                        {!isToday && (
                          <button onClick={() => setEditingPrayer(p)}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition p-0.5 rounded"
                            style={{ color: '#7A8FA8', background: 'rgba(0,0,0,0.4)' }} title="Edit">
                            <Edit2 size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Sunnah grid ── */}
                {sunnah.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A78BFA' }}>Sunnah</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.1)', color: '#7C5FBF' }}>
                        {sunnahDone}/{sunnahTotal} done
                      </span>
                    </div>
                    <div className={`grid gap-2.5 mb-3 ${sunnah.length === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                      {sunnah.map((s) => {
                        const meta = SUNNAH_META[s.name];
                        const col = SUNNAH_STATUS_COLORS[s.status] || '#2A3A50';
                        const rakahs = getSunnahRakahs(s.name, s.variant);
                        return (
                          <div key={s.name} className="rounded-xl p-2.5 text-center relative group" style={{ background: `${col}12`, border: `1px solid ${col}30` }}>
                            <span className="block text-base mb-0.5">{meta?.icon}</span>
                            <span className="block font-semibold leading-tight mb-0.5" style={{ color: col, fontSize: '0.62rem' }}>{meta?.label}</span>
                            <span className="block mb-1" style={{ color: '#3A4A60', fontSize: '0.58rem' }}>
                              {rakahs ? `${rakahs} rak` : s.name === 'jumuah_after' ? '?' : ''}
                            </span>
                            <span className="block font-medium capitalize" style={{ color: col, fontSize: '0.6rem' }}>
                              {s.status === 'skipped' ? 'skipped' : s.status}
                            </span>
                            {/* Jumuah variant */}
                            {s.name === 'jumuah_after' && s.variant && (
                              <span className="block mt-0.5" style={{ color: '#7C5FBF', fontSize: '0.55rem' }}>
                                {s.variant === 'masjid' ? '🕌' : '🏠'} {s.variant}
                              </span>
                            )}
                            {s.markedAt && (
                              <span className="block mt-0.5" style={{ color: '#2A3A50', fontSize: '0.55rem' }}>
                                {format(new Date(s.markedAt), 'h:mm a')}
                              </span>
                            )}
                            {!isToday && (
                              <button onClick={() => setEditingSunnah(s)}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition p-0.5 rounded"
                                style={{ color: '#7A8FA8', background: 'rgba(0,0,0,0.4)' }} title="Edit">
                                <Edit2 size={10} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Tips */}
                {!isToday && (
                  <p className="text-xs mt-1" style={{ color: '#3A4A60' }}>
                    💡 Hover a card and click the pencil to correct a past record.
                  </p>
                )}

                {record.notes && (
                  <p className="text-sm italic mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#7A8FA8' }}>
                    📝 {record.notes}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [days, setDays]             = useState(30);
  const [expandedDay, setExpandedDay] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/prayers/history?days=${days}`)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [days]);

  // Farz summary
  const totalDone    = history.reduce((a, r) => a + r.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length, 0);
  const totalMissed  = history.reduce((a, r) => a + r.prayers.filter((p) => p.status === 'missed').length, 0);
  const perfectDays  = history.filter((r) => r.completionRate === 100).length;
  const avgCompletion = history.length ? Math.round(history.reduce((a, r) => a + r.completionRate, 0) / history.length) : 0;

  // Sunnah summary
  const sunnahTotalDone    = history.reduce((a, r) => a + (r.sunnahPrayers || []).filter((s) => s.status === 'done').length, 0);
  const sunnahTotalSkipped = history.reduce((a, r) => a + (r.sunnahPrayers || []).filter((s) => s.status === 'skipped').length, 0);
  const sunnahTotalEntries = history.reduce((a, r) => a + (r.sunnahPrayers || []).length, 0);
  const sunnahAvgPct = sunnahTotalEntries ? Math.round((sunnahTotalDone / sunnahTotalEntries) * 100) : 0;

  // Per-farz breakdown
  const byPrayer = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((name) => {
    const done   = history.reduce((a, r) => a + ((r.prayers.find((p) => p.name === name)?.status === 'done' || r.prayers.find((p) => p.name === name)?.status === 'qada') ? 1 : 0), 0);
    const missed = history.reduce((a, r) => a + (r.prayers.find((p) => p.name === name)?.status === 'missed' ? 1 : 0), 0);
    const pct    = history.length ? Math.round((done / history.length) * 100) : 0;
    return { name, done, missed, pct };
  });

  // Per-sunnah breakdown (weekday only — exclude jumuah from weekday names)
  const WEEKDAY_SUNNAH = ['fajr_sunnah', 'dhuhr_before', 'dhuhr_after', 'asr_sunnah', 'maghrib_sunnah', 'isha_sunnah'];
  const bySunnah = WEEKDAY_SUNNAH.map((name) => {
    const total = history.reduce((a, r) => a + ((r.sunnahPrayers || []).some((s) => s.name === name) ? 1 : 0), 0);
    const done  = history.reduce((a, r) => a + ((r.sunnahPrayers || []).find((s) => s.name === name)?.status === 'done' ? 1 : 0), 0);
    const pct   = total ? Math.round((done / total) * 100) : 0;
    return { name, done, total, pct };
  });
  // Jumu'ah summary (Fridays only)
  const jumuahDays  = history.filter((r) => (r.sunnahPrayers || []).some((s) => s.name === 'jumuah_after'));
  const jumuahDone  = jumuahDays.filter((r) => (r.sunnahPrayers || []).find((s) => s.name === 'jumuah_after')?.status === 'done').length;
  const jumuahPct   = jumuahDays.length ? Math.round((jumuahDone / jumuahDays.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>وَأَقِيمُوا الصَّلَاةَ</p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Prayer History</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>A record of your daily Salah — accountability with yourself and Allah.</p>
      </div>

      {/* Range selector */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          {[7, 14, 30, 60].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ background: days === d ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${days === d ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, color: days === d ? '#C9A84C' : '#7A8FA8' }}>
              {d} days
            </button>
          ))}
        </div>
        {!loading && <span className="text-sm" style={{ color: '#3A4A60' }}>{history.length} records</span>}
      </div>

      {/* Summary cards */}
      {!loading && history.length > 0 && (
        <>
          {/* Farz summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { icon: '✅', label: 'Total Prayed',    value: totalDone,       color: '#22C55E' },
              { icon: '❌', label: 'Total Missed',    value: totalMissed,     color: '#EF4444' },
              { icon: '⭐', label: 'Perfect Days',    value: perfectDays,     color: '#2DD4BF' },
              { icon: '📊', label: 'Avg Completion',  value: `${avgCompletion}%`, color: '#C9A84C' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sunnah summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: '🌟', label: 'Sunnah Done',    value: sunnahTotalDone,    color: '#A78BFA' },
              { icon: '➖', label: 'Sunnah Skipped', value: sunnahTotalSkipped, color: '#3A4A60' },
              { icon: '📈', label: 'Sunnah Rate',    value: `${sunnahAvgPct}%`, color: '#8B5CF6' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Farz per-prayer breakdown */}
          <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#C9A84C' }}>Farz Breakdown — last {days} days</h2>
            <div className="space-y-3">
              {byPrayer.map(({ name, done, missed, pct }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm w-16 font-medium capitalize" style={{ color: '#EDE8D8' }}>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: pct === 100 ? '#22C55E' : pct >= 60 ? '#C9A84C' : '#EF4444' }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.05 }} />
                  </div>
                  <span className="text-xs font-semibold w-9 text-right" style={{ color: '#7A8FA8' }}>{pct}%</span>
                  <span className="text-xs w-20 text-right" style={{ color: '#3A4A60' }}>
                    {done}✓ {missed > 0 ? `${missed}✗` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sunnah per-prayer breakdown */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#A78BFA' }}>Sunnah Breakdown — last {days} days</h2>
            <div className="space-y-3">
              {bySunnah.map(({ name, done, total, pct }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs w-24 font-medium" style={{ color: '#C0B0E8', fontSize: '0.7rem' }}>
                    {SUNNAH_META[name]?.label} ({SUNNAH_META[name]?.rakahs}r)
                  </span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: pct >= 80 ? '#A78BFA' : pct >= 50 ? '#7C5FBF' : '#3A2A60' }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.05 }} />
                  </div>
                  <span className="text-xs font-semibold w-9 text-right" style={{ color: '#7C5FBF' }}>{pct}%</span>
                  <span className="text-xs w-16 text-right" style={{ color: '#3A4A60' }}>
                    {done}/{total}
                  </span>
                </div>
              ))}
              {/* Jumu'ah row */}
              {jumuahDays.length > 0 && (
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
                  <span className="text-xs w-24 font-medium" style={{ color: '#C0B0E8', fontSize: '0.7rem' }}>
                    🕌 Jumu'ah
                  </span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: jumuahPct >= 80 ? '#A78BFA' : '#7C5FBF' }}
                      initial={{ width: 0 }} animate={{ width: `${jumuahPct}%` }} transition={{ duration: 0.7 }} />
                  </div>
                  <span className="text-xs font-semibold w-9 text-right" style={{ color: '#7C5FBF' }}>{jumuahPct}%</span>
                  <span className="text-xs w-16 text-right" style={{ color: '#3A4A60' }}>{jumuahDone}/{jumuahDays.length}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* History list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-5xl mb-4">📿</p>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#EDE8D8' }}>No records yet</h2>
          <p className="text-sm" style={{ color: '#7A8FA8' }}>Start marking your prayers today and they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <HistoryRow key={record._id} record={record}
              isExpanded={expandedDay === record._id}
              onToggle={() => setExpandedDay(expandedDay === record._id ? null : record._id)}
              onRecordUpdated={load}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
