/**
 * NurPath Routine & Salah Reminder Storage & Scheduler Service
 * Supports:
 * - Custom Manual Prayer Times Overrides (Fajr, Dhuhr, Asr, Maghrib, Isha)
 * - Authentic Adhan Sound Selection (Fajr "Assalatu Khairum Minan Naum", Makkah "Hayya Alas Salah", Madinah)
 * - Offline-first Capacitor Native Alarms & Local Notifications
 */
import { schedulePrayerAlarm } from './nativeBridge';

const STORAGE_KEY_SALAH_PRE = 'nurpath_salah_pre_reminders';
const STORAGE_KEY_CUSTOM_REMINDERS = 'nurpath_custom_reminders';
const STORAGE_KEY_CUSTOM_TIMES = 'nurpath_custom_prayer_times';

export const ADHAN_SOUND_OPTIONS = [
  {
    id: 'fajr_adhan',
    label: '🕌 Fajr Adhan (Assalātu Khayrum Minan-Nawm)',
    sublabel: 'Includes "Prayer is better than sleep"',
    audioUrl: 'https://cdn.islamicfinder.org/adhan/fajr.mp3',
    file: 'fajr_adhan.wav',
  },
  {
    id: 'makkah_adhan',
    label: '📢 Makkah Adhan (Hayya \'alās-Salāh · Hayya \'alāl-Falāh)',
    sublabel: 'Full Makkah Al-Mukarramah Adhan call',
    audioUrl: 'https://cdn.islamicfinder.org/adhan/makkah.mp3',
    file: 'makkah_adhan.wav',
  },
  {
    id: 'madinah_adhan',
    label: '🌙 Madinah Soft Adhan',
    sublabel: 'Peaceful Al-Madinah Al-Munawwarah Adhan',
    audioUrl: 'https://cdn.islamicfinder.org/adhan/madinah.mp3',
    file: 'madinah_adhan.wav',
  },
  {
    id: 'default',
    label: '🔔 Standard System Tone',
    sublabel: 'Default notification chime',
    audioUrl: null,
    file: 'default',
  },
  {
    id: 'none',
    label: '🔕 Silent / Vibrate Only',
    sublabel: 'No audio, vibration only',
    audioUrl: null,
    file: 'none',
  },
];

export const REMINDER_CATEGORIES = [
  { id: 'hifz', label: 'Hifz Revision', icon: '📖' },
  { id: 'ishraq', label: 'Ishraq Prayer', icon: '☀️' },
  { id: 'quran', label: "Qur'an Recitation", icon: '📖' },
  { id: 'morningAdhkar', label: 'Morning Adhkar', icon: '🌅' },
  { id: 'eveningAdhkar', label: 'Evening Adhkar', icon: '<ctrl42>' },
  { id: 'tahajjud', label: 'Tahajjud / Qiyam', icon: '🌙' },
  { id: 'dua', label: "Du'a & Supplication", icon: '🤲' },
  { id: 'study', label: 'Islamic Study', icon: '📚' },
  { id: 'custom', label: 'Custom Routine', icon: '🔔' },
];

export const PRE_REMINDER_OFFSETS = [5, 10, 15, 20, 30, 45, 60];

// Default Custom Times if manually overridden
export const DEFAULT_CUSTOM_TIMES = {
  fajr: '05:15',
  dhuhr: '13:30',
  asr: '17:15',
  maghrib: '18:55',
  isha: '20:30',
};

// Default Salah Pre-Reminders
export const DEFAULT_SALAH_PRE = {
  fajr: { enabled: true, offsetMinutes: 15, atTimeAlert: true, customTime: '05:15', sound: 'fajr_adhan' },
  dhuhr: { enabled: true, offsetMinutes: 15, atTimeAlert: true, customTime: '13:30', sound: 'makkah_adhan' },
  asr: { enabled: true, offsetMinutes: 15, atTimeAlert: true, customTime: '17:15', sound: 'makkah_adhan' },
  maghrib: { enabled: true, offsetMinutes: 15, atTimeAlert: true, customTime: '18:55', sound: 'makkah_adhan' },
  isha: { enabled: true, offsetMinutes: 15, atTimeAlert: true, customTime: '20:30', sound: 'makkah_adhan' },
};

// ── Read / Write Custom Prayer Times Overrides ──
export function getCustomPrayerTimes() {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_TIMES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TIMES);
    return raw ? { ...DEFAULT_CUSTOM_TIMES, ...JSON.parse(raw) } : DEFAULT_CUSTOM_TIMES;
  } catch {
    return DEFAULT_CUSTOM_TIMES;
  }
}

export function saveCustomPrayerTimes(times) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TIMES, JSON.stringify(times));
  } catch (err) {
    console.error('[ReminderStorage] Custom times save error:', err);
  }
}

// ── Read / Write Salah Pre-reminders ──
export function getSalahPreReminders() {
  if (typeof window === 'undefined') return DEFAULT_SALAH_PRE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SALAH_PRE);
    return raw ? { ...DEFAULT_SALAH_PRE, ...JSON.parse(raw) } : DEFAULT_SALAH_PRE;
  } catch {
    return DEFAULT_SALAH_PRE;
  }
}

export function saveSalahPreReminders(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SALAH_PRE, JSON.stringify(settings));
  } catch (err) {
    console.error('[ReminderStorage] Pre-reminders save error:', err);
  }
}

// ── Read / Write Custom Routine Reminders ──
export function getCustomReminders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomReminders(reminders) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.error('[ReminderStorage] Custom reminders save error:', err);
  }
}

export async function addCustomReminder(reminder) {
  const current = getCustomReminders();
  const newEntry = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: reminder.title,
    category: reminder.category || 'custom',
    time: reminder.time, // "HH:mm"
    repeat: reminder.repeat || 'daily',
    sound: reminder.sound || 'makkah_adhan',
    alertType: reminder.alertType || 'alarm',
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...current];
  saveCustomReminders(updated);
  await scheduleCustomNotification(newEntry);
  return updated;
}

export async function toggleCustomReminder(id) {
  const current = getCustomReminders();
  const updated = current.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
  saveCustomReminders(updated);
  return updated;
}

export async function deleteCustomReminder(id) {
  const current = getCustomReminders();
  const updated = current.filter((r) => r.id !== id);
  saveCustomReminders(updated);
  return updated;
}

// ── Schedule Notification via Native Bridge ──
export async function scheduleCustomNotification(reminder) {
  if (!reminder.enabled || !reminder.time) return;
  try {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    if (targetDate <= new Date()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const catMeta = REMINDER_CATEGORIES.find((c) => c.id === reminder.category) || REMINDER_CATEGORIES[8];

    await schedulePrayerAlarm({
      id: Math.abs(reminder.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
      title: `${catMeta.icon} ${reminder.title}`,
      body: `It is time for your ${catMeta.label} routine.`,
      scheduleAt: targetDate,
      sound: reminder.sound || 'makkah_adhan',
      repeating: reminder.repeat === 'daily' || reminder.repeat === 'weekdays' || reminder.repeat === 'weekends',
    });
  } catch (err) {
    console.warn('[ReminderStorage] Notification scheduling failed:', err);
  }
}
