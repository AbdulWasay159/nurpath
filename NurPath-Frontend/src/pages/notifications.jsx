import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import {
  getSalahPreReminders,
  saveSalahPreReminders,
  getCustomReminders,
  addCustomReminder,
  toggleCustomReminder,
  deleteCustomReminder,
  getCustomPrayerTimes,
  saveCustomPrayerTimes,
  PRE_REMINDER_OFFSETS,
  REMINDER_CATEGORIES,
  ADHAN_SOUND_OPTIONS,
  DEFAULT_CUSTOM_TIMES,
} from '../lib/reminderStorage';
import { isNativePlatform, scheduleAllSalahAlarms } from '../lib/nativeBridge';
import {
  Bell, BellOff, Plus, Clock, Sparkles, Trash2, Play, Square,
  Check, ChevronDown, Volume2, Music, AlertCircle,
} from 'lucide-react';

const SALAH_LABELS = {
  fajr:    { label: 'Fajr',    arabic: 'الفجر',    icon: '🌙' },
  dhuhr:   { label: 'Dhuhr',   arabic: 'الظهر',    icon: '☀️' },
  asr:     { label: 'Asr',     arabic: 'العصر',    icon: '🌤️' },
  maghrib: { label: 'Maghrib', arabic: 'المغرب',   icon: '🌅' },
  isha:    { label: 'Isha',    arabic: 'العشاء',   icon: '🌙' },
};

function AdhanPreviewButton({ audioUrl, soundId, currentlyPlaying, setCurrentlyPlaying }) {
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioUrl) {
      toast('No audio preview for this selection.', { icon: '🔕' });
      return;
    }
    if (currentlyPlaying === soundId) {
      audioRef.current?.pause();
      audioRef.current && (audioRef.current.currentTime = 0);
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentlyPlaying(soundId);
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setCurrentlyPlaying(null);
      }
      audioRef.current.play().catch(() => {
        toast.error('Audio preview unavailable. Will play on device.');
        setCurrentlyPlaying(null);
      });
    }
  };

  const isPlaying = currentlyPlaying === soundId;

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
      style={{
        background: isPlaying ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isPlaying ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`,
        color: isPlaying ? '#C9A84C' : '#7A8FA8',
      }}>
      {isPlaying ? <Square size={11} /> : <Play size={11} />}
      {isPlaying ? 'Stop' : 'Preview'}
    </button>
  );
}

// ── Adhan Sound Selector Dropdown ──
function AdhanSoundPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(null);
  const selected = ADHAN_SOUND_OPTIONS.find((s) => s.id === value) || ADHAN_SOUND_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full transition"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(201,168,76,0.25)',
          color: 'var(--text-primary)',
        }}>
        <Music size={13} style={{ color: '#C9A84C' }} />
        <span className="flex-1 text-left truncate">{selected.label}</span>
        <ChevronDown size={13} style={{ color: '#C9A84C', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.3)', minWidth: '340px' }}>
            {ADHAN_SOUND_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onClick={() => { onChange(opt.id); setOpen(false); }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: value === opt.id ? '#C9A84C' : 'var(--text-primary)' }}>
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.sublabel}</p>
                </div>
                {opt.id !== 'none' && (
                  <AdhanPreviewButton
                    audioUrl={opt.audioUrl}
                    soundId={opt.id}
                    currentlyPlaying={playing}
                    setCurrentlyPlaying={setPlaying}
                  />
                )}
                {value === opt.id && <Check size={14} style={{ color: '#22C55E', flexShrink: 0 }} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('salah');
  const [salahSettings, setSalahSettings] = useState(getSalahPreReminders);
  const [customTimes, setCustomTimes] = useState(getCustomPrayerTimes);
  const [customReminders, setCustomReminders] = useState(getCustomReminders);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Routine Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('hifz');
  const [newTime, setNewTime] = useState('06:00');
  const [newRepeat, setNewRepeat] = useState('daily');
  const [newSound, setNewSound] = useState('makkah_adhan');

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setSystemNotifications(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingSystem(false));
  }, []);

  // Helper: save + reschedule all native alarms atomically
  const saveAndReschedule = async (updatedSettings, updatedTimes) => {
    saveSalahPreReminders(updatedSettings);
    if (isNativePlatform()) {
      try {
        await scheduleAllSalahAlarms(updatedSettings, updatedTimes);
        toast.success('Alarms updated on device ✓', { icon: '🔔' });
      } catch (err) {
        console.warn('[Notifications] scheduleAllSalahAlarms error:', err);
      }
    }
  };

  // ── Prayer Time Update ──
  const handleTimeChange = async (salahId, newTime) => {
    const updatedTimes = { ...customTimes, [salahId]: newTime };
    setCustomTimes(updatedTimes);
    saveCustomPrayerTimes(updatedTimes);
    const updatedSettings = {
      ...salahSettings,
      [salahId]: { ...salahSettings[salahId], customTime: newTime },
    };
    setSalahSettings(updatedSettings);
    await saveAndReschedule(updatedSettings, updatedTimes);
    toast.success(`${SALAH_LABELS[salahId].label} time updated to ${newTime}.`);
  };

  // ── Offset Change ──
  const handleOffsetChange = async (salahId, offset) => {
    const updated = {
      ...salahSettings,
      [salahId]: { ...salahSettings[salahId], offsetMinutes: Number(offset) },
    };
    setSalahSettings(updated);
    await saveAndReschedule(updated, customTimes);
    toast.success(`${SALAH_LABELS[salahId].label}: reminder ${offset}m before.`);
  };

  // ── Toggle Enabled ──
  const handleToggle = async (salahId) => {
    const updated = {
      ...salahSettings,
      [salahId]: { ...salahSettings[salahId], enabled: !salahSettings[salahId].enabled },
    };
    setSalahSettings(updated);
    await saveAndReschedule(updated, customTimes);
  };

  // ── Adhan Sound Change ──
  const handleSoundChange = async (salahId, soundId) => {
    const updated = {
      ...salahSettings,
      [salahId]: { ...salahSettings[salahId], sound: soundId },
    };
    setSalahSettings(updated);
    await saveAndReschedule(updated, customTimes);
    toast.success(`${SALAH_LABELS[salahId].label} ringtone updated.`);
  };

  const handleResetTimes = async () => {
    setCustomTimes(DEFAULT_CUSTOM_TIMES);
    saveCustomPrayerTimes(DEFAULT_CUSTOM_TIMES);
    const updated = { ...salahSettings };
    Object.keys(SALAH_LABELS).forEach((id) => {
      updated[id] = { ...updated[id], customTime: DEFAULT_CUSTOM_TIMES[id] };
    });
    setSalahSettings(updated);
    await saveAndReschedule(updated, DEFAULT_CUSTOM_TIMES);
    toast.success('Prayer times reset to defaults.');
  };

  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { toast.error('Please enter a title.'); return; }
    const updated = await addCustomReminder({ title: newTitle.trim(), category: newCategory, time: newTime, repeat: newRepeat, sound: newSound, alertType: 'alarm' });
    setCustomReminders(updated);
    setShowAddModal(false);
    setNewTitle('');
    toast.success('Routine scheduled!');
  };

  const isNative = isNativePlatform();

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <p className="font-amiri text-sm mb-1" style={{ color: 'var(--gold-dim)', direction: 'rtl' }}>
          التذكيرات والإشعارات
        </p>
        <h1 className="font-amiri text-4xl" style={{ color: 'var(--gold)' }}>
          Salah &amp; Routine Reminders
        </h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Custom prayer times, Adhan ringtones &amp; offline alarms.
          </p>
          {isNative && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
              ⚡ Native Android
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-3 flex-wrap" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {[
          { id: 'salah', label: 'Salah Reminders', icon: Clock },
          { id: 'routines', label: `Custom Routines (${customReminders.length})`, icon: Sparkles },
          { id: 'system', label: 'System', icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{
              background: activeTab === id ? 'rgba(201,168,76,0.15)' : 'transparent',
              border: `1px solid ${activeTab === id ? 'rgba(201,168,76,0.4)' : 'transparent'}`,
              color: activeTab === id ? '#C9A84C' : '#7A8FA8',
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: SALAH REMINDERS ── */}
      {activeTab === 'salah' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#C9A84C' }}>Manual Prayer Times</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                These times are used for offline reminders. They are independent from the auto-calculated times on your Dashboard. Set your local mosque times here for accurate alarms.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleResetTimes} className="text-xs px-3 py-1.5 rounded-lg transition" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Reset to defaults
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(SALAH_LABELS).map(([salahId, meta]) => {
              const s = salahSettings[salahId] || {};
              const timeVal = customTimes[salahId] || DEFAULT_CUSTOM_TIMES[salahId];

              return (
                <div
                  key={salahId}
                  className="rounded-2xl overflow-hidden transition"
                  style={{
                    background: s.enabled ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${s.enabled ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  {/* Row 1: Name + Time input + Enable toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          {meta.label}
                          <span className="font-amiri text-sm" style={{ color: 'var(--gold-dim)' }}>{meta.arabic}</span>
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {s.enabled ? `Alarm ${s.offsetMinutes}m before Salah time` : 'Reminders off'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* ── TIME PICKER (editable!) ── */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Prayer Time:</label>
                        <input
                          type="time"
                          value={timeVal}
                          onChange={(e) => handleTimeChange(salahId, e.target.value)}
                          className="bg-black/50 border rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none transition"
                          style={{
                            color: '#C9A84C',
                            borderColor: 'rgba(201,168,76,0.4)',
                            background: 'rgba(0,0,0,0.4)',
                          }}
                        />
                      </div>

                      {/* Offset */}
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Remind:</span>
                        <select
                          value={s.offsetMinutes || 15}
                          onChange={(e) => handleOffsetChange(salahId, e.target.value)}
                          disabled={!s.enabled}
                          className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                          style={{ color: '#C9A84C' }}>
                          {PRE_REMINDER_OFFSETS.map((m) => (
                            <option key={m} value={m} className="bg-gray-900 text-white">{m}m before</option>
                          ))}
                        </select>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(salahId)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold transition"
                        style={{
                          background: s.enabled ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${s.enabled ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)'}`,
                          color: s.enabled ? '#22C55E' : '#7A8FA8',
                        }}>
                        {s.enabled ? 'On ✓' : 'Off'}
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Adhan Sound Picker */}
                  <div className="px-5 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 mt-3">
                      <Volume2 size={14} style={{ color: '#C9A84C', flexShrink: 0 }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Adhan / Ringtone:</span>
                      <div className="flex-1">
                        <AdhanSoundPicker
                          value={s.sound || 'makkah_adhan'}
                          onChange={(id) => handleSoundChange(salahId, id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TAB: CUSTOM ROUTINES ── */}
      {activeTab === 'routines' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Custom Islamic worship routines with Adhan ringtones.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95"
              style={{ background: '#C9A84C', color: '#1A1000' }}>
              <Plus size={15} /> Add Routine
            </button>
          </div>

          {customReminders.length === 0 ? (
            <div className="rounded-2xl p-14 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Sparkles size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>No routines yet</h3>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                Set offline alarms for Hifz, Ishraq, Tahajjud, Adhkar, and more.
              </p>
              <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
                + Add First Routine
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customReminders.map((r) => {
                const cat = REMINDER_CATEGORIES.find((c) => c.id === r.category) || REMINDER_CATEGORIES[8];
                const sound = ADHAN_SOUND_OPTIONS.find((s) => s.id === r.sound) || ADHAN_SOUND_OPTIONS[1];
                return (
                  <div key={r.id} className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${r.enabled ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}`, opacity: r.enabled ? 1 : 0.6 }}>
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.title}</h3>
                        <p className="text-xs mt-0.5 flex flex-wrap gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-mono font-bold" style={{ color: '#C9A84C' }}>{r.time}</span>
                          <span>· {r.repeat}</span>
                          <span style={{ color: 'var(--text-muted)' }}>🎵 {sound.label.split(' ')[0]} {sound.label.split(' ')[1]}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleCustomReminder(r.id).then(setCustomReminders)} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: r.enabled ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${r.enabled ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)'}`, color: r.enabled ? '#22C55E' : '#7A8FA8' }}>
                        {r.enabled ? 'On' : 'Off'}
                      </button>
                      <button onClick={() => deleteCustomReminder(r.id).then(setCustomReminders)} className="p-2 rounded-xl text-red-400 hover:bg-white/5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── TAB: SYSTEM ── */}
      {activeTab === 'system' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {loadingSystem ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)
          ) : systemNotifications.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <BellOff size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No system notifications.</p>
            </div>
          ) : systemNotifications.map((n) => (
            <div key={n._id} className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Bell size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title || n.message}</p>
                {n.title && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── ADD ROUTINE MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 30 }}
              className="w-full max-w-lg rounded-3xl p-6"
              style={{ background: '#0F1620', border: '1px solid rgba(201,168,76,0.35)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 className="font-amiri text-2xl mb-5" style={{ color: '#C9A84C' }}>
                Add Islamic Routine Reminder
              </h2>

              <form onSubmit={handleCreateRoutine} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs text-muted mb-1 uppercase font-semibold tracking-wide">Category</label>
                  <select value={newCategory} onChange={(e) => { setNewCategory(e.target.value); const c = REMINDER_CATEGORIES.find((x) => x.id === e.target.value); if (c && !newTitle) setNewTitle(c.label); }} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:outline-none">
                    {REMINDER_CATEGORIES.map((c) => <option key={c.id} value={c.id} className="bg-gray-900 text-white">{c.icon} {c.label}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs text-muted mb-1 uppercase font-semibold tracking-wide">Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder='e.g. "Morning Hifz — 2 Pages"' className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:outline-none" required />
                </div>

                {/* Time + Repeat */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1 uppercase font-semibold tracking-wide">Time</label>
                    <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1 uppercase font-semibold tracking-wide">Repeat</label>
                    <select value={newRepeat} onChange={(e) => setNewRepeat(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:outline-none">
                      <option value="daily" className="bg-gray-900 text-white">Every Day</option>
                      <option value="weekdays" className="bg-gray-900 text-white">Weekdays</option>
                      <option value="weekends" className="bg-gray-900 text-white">Weekends</option>
                      <option value="once" className="bg-gray-900 text-white">Once</option>
                    </select>
                  </div>
                </div>

                {/* Adhan Sound */}
                <div>
                  <label className="block text-xs text-muted mb-2 uppercase font-semibold tracking-wide flex items-center gap-1.5">
                    <Music size={12} /> Adhan / Ringtone
                  </label>
                  <AdhanSoundPicker value={newSound} onChange={setNewSound} />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-bold text-black" style={{ background: '#C9A84C' }}>
                    Save &amp; Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
