import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import { PrayerPill } from '../components/prayer/PrayerComponents';
import api from '../lib/api';
import { ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr' },
  asr:     { icon: '🌤️', label: 'Asr' },
  maghrib: { icon: '🌅', label: 'Maghrib' },
  isha:    { icon: '🌙', label: 'Isha' },
};

const STATUS_OPTS = ['pending', 'done', 'missed', 'qada'];
const STATUS_COLORS = {
  done:    '#22C55E',
  missed:  '#EF4444',
  pending: '#3A4A60',
  qada:    '#F59E0B',
};

function EditPrayerModal({ date, prayer, onSave, onClose }) {
  const [status, setStatus] = useState(prayer.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/prayers/${date}/${prayer.name}`, { status });
      onSave();
    } catch {
      // silent — parent will still reload
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

function HistoryRow({ record, isExpanded, onToggle, onRecordUpdated }) {
  const date = parseISO(record.date);
  const isToday = record.date === new Date().toLocaleDateString('en-CA');
  const done = record.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  const missed = record.prayers.filter((p) => p.status === 'missed').length;
  const barColor = record.completionRate === 100 ? '#22C55E' : record.completionRate >= 60 ? '#C9A84C' : '#EF4444';
  const [editingPrayer, setEditingPrayer] = useState(null);

  const handleEditSave = () => {
    setEditingPrayer(null);
    onRecordUpdated();
  };

  return (
    <>
      {editingPrayer && !isToday && (
        <EditPrayerModal
          date={record.date}
          prayer={editingPrayer}
          onSave={handleEditSave}
          onClose={() => setEditingPrayer(null)}
        />
      )}
      <div className="rounded-2xl overflow-hidden transition-all"
        style={{ background: isExpanded ? 'rgba(201,168,76,0.04)' : 'transparent', border: `1px solid ${isExpanded ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
        <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition">
          {/* Date block */}
          <div className="flex-shrink-0 w-14 text-center">
            <div className="text-xs font-bold uppercase" style={{ color: '#7A8FA8' }}>{format(date, 'EEE')}</div>
            <div className="text-2xl font-bold leading-none mt-0.5" style={{ color: isToday ? '#C9A84C' : '#EDE8D8' }}>{format(date, 'd')}</div>
            <div className="text-xs" style={{ color: '#3A4A60' }}>{format(date, 'MMM')}</div>
            {isToday && <div className="text-xs font-semibold mt-0.5" style={{ color: '#C9A84C' }}>Today</div>}
          </div>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium" style={{ color: '#EDE8D8' }}>
                {done === 5 ? 'MashAllah! All 5 prayed ✓' : done === 0 ? 'No prayers recorded' : `${done} of 5 prayed`}
              </span>
              {missed > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                  {missed} missed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full" style={{ background: barColor }}
                  initial={{ width: 0 }} animate={{ width: `${record.completionRate}%` }} transition={{ duration: 0.6 }} />
              </div>
              <span className="text-xs font-semibold w-9 text-right" style={{ color: barColor }}>{record.completionRate}%</span>
            </div>
          </div>

          {/* Pills — md+ */}
          <div className="hidden md:flex gap-1.5 flex-shrink-0">
            {record.prayers.map((p) => <PrayerPill key={p.name} name={p.name} status={p.status} />)}
          </div>

          <div className="flex-shrink-0" style={{ color: '#3A4A60' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Expanded detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="px-5 pb-5">
                {/* Mobile pills */}
                <div className="flex gap-2 flex-wrap mb-4 md:hidden">
                  {record.prayers.map((p) => <PrayerPill key={p.name} name={p.name} status={p.status} />)}
                </div>
                {/* Detailed grid */}
                <div className="grid grid-cols-5 gap-3">
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
                        {/* Edit button — hidden for today since /today route handles that */}
                        {!isToday && (
                          <button
                            onClick={() => setEditingPrayer(p)}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition p-0.5 rounded"
                            style={{ color: '#7A8FA8', background: 'rgba(0,0,0,0.4)' }}
                            title="Edit">
                            <Edit2 size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!isToday && (
                  <p className="text-xs mt-3" style={{ color: '#3A4A60' }}>
                    💡 Hover a prayer card and click the pencil to correct a past record.
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

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/prayers/history?days=${days}`)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  // Summary stats from history
  const totalDone = history.reduce((a, r) => a + r.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length, 0);
  const totalMissed = history.reduce((a, r) => a + r.prayers.filter((p) => p.status === 'missed').length, 0);
  const perfectDays = history.filter((r) => r.completionRate === 100).length;
  const avgCompletion = history.length ? Math.round(history.reduce((a, r) => a + r.completionRate, 0) / history.length) : 0;

  // Per-prayer breakdown
  const byPrayer = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((name) => {
    const done = history.reduce((a, r) => a + (r.prayers.find((p) => p.name === name)?.status === 'done' || r.prayers.find((p) => p.name === name)?.status === 'qada' ? 1 : 0), 0);
    const missed = history.reduce((a, r) => a + (r.prayers.find((p) => p.name === name)?.status === 'missed' ? 1 : 0), 0);
    const pct = history.length ? Math.round((done / history.length) * 100) : 0;
    return { name, done, missed, pct };
  });

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: '✅', label: 'Total Prayed', value: totalDone, color: '#22C55E' },
              { icon: '❌', label: 'Total Missed', value: totalMissed, color: '#EF4444' },
              { icon: '⭐', label: 'Perfect Days', value: perfectDays, color: '#2DD4BF' },
              { icon: '📊', label: 'Avg Completion', value: `${avgCompletion}%`, color: '#C9A84C' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Per-prayer breakdown */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#C9A84C' }}>Prayer Breakdown — last {days} days</h2>
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
              onRecordUpdated={() => {
                setLoading(true);
                api.get(`/prayers/history?days=${days}`)
                  .then((res) => setHistory(res.data.data || []))
                  .catch(() => {})
                  .finally(() => setLoading(false));
              }} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
