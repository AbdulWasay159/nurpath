/**
 * NurPath Native Hardware Bridge
 * Unified abstraction layer for Capacitor Native APIs with automatic Browser Web Fallbacks.
 *
 * Adhan sound file mapping (files must exist in android/app/src/main/res/raw/):
 *   fajr_adhan    → fajr_adhan.wav
 *   makkah_adhan  → makkah_adhan.wav
 *   madinah_adhan → madinah_adhan.wav
 *   default       → (system default)
 *   none          → (no sound)
 */

// ── Sound ID → Android res/raw filename mapping ──
const ADHAN_FILE_MAP = {
  fajr_adhan: 'fajr_adhan.wav',
  makkah_adhan: 'makkah_adhan.wav',
  madinah_adhan: 'madinah_adhan.wav',
  default: null,      // uses system default channel sound
  none: 'silent.wav', // silent audio file
};

// ── Check if running inside native mobile webview ──
export function isNativePlatform() {
  if (typeof window === 'undefined') return false;
  return !!(window.Capacitor && window.Capacitor.isNativePlatform());
}

// ── Geolocation (Native GPS / Browser Fallback) ──
export async function getDevicePosition() {
  if (typeof window === 'undefined') {
    throw new Error('Geolocation unavailable on server side.');
  }

  if (isNativePlatform()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'native-gps' };
    } catch (err) {
      console.warn('[NativeBridge] Capacitor Geolocation failed, falling back to browser:', err);
    }
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'browser-gps' }),
      (err) => reject(err),
      { timeout: 10000 }
    );
  });
}

// ── Ensure notification permissions are granted ──
async function ensureNotificationPermission(LocalNotifications) {
  const status = await LocalNotifications.checkPermissions();
  if (status.display !== 'granted') {
    const req = await LocalNotifications.requestPermissions();
    return req.display === 'granted';
  }
  return true;
}

/**
 * Schedule a one-time native alarm notification.
 * @param {object} opts
 * @param {number}  opts.id         - Unique integer notification ID.
 * @param {string}  opts.title      - Notification title.
 * @param {string}  opts.body       - Notification body text.
 * @param {Date}    opts.scheduleAt - When to fire the alarm.
 * @param {string}  opts.sound      - Sound ID: 'fajr_adhan' | 'makkah_adhan' | 'madinah_adhan' | 'default' | 'none'
 * @param {boolean} opts.repeating  - If true, re-fires daily at the same time.
 */
export async function schedulePrayerAlarm({ id, title, body, scheduleAt, sound = 'makkah_adhan', repeating = false }) {
  if (!isNativePlatform()) {
    // Web fallback: use browser Notification API (best-effort, requires page to be open)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const delay = new Date(scheduleAt).getTime() - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            new Notification(title || 'Salah Reminder', { body: body || 'Time to pray.' });
          }, delay);
        }
      }
    }
    return false;
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const granted = await ensureNotificationPermission(LocalNotifications);
    if (!granted) {
      console.warn('[NativeBridge] Notification permission denied.');
      return false;
    }

    const soundFile = ADHAN_FILE_MAP[sound] ?? ADHAN_FILE_MAP.makkah_adhan;

    const notification = {
      id: id ?? Math.floor(Math.random() * 100000),
      title: title ?? 'Salah Time',
      body: body ?? 'It is time for prayer. May Allah accept it.',
      schedule: repeating
        ? { at: new Date(scheduleAt), repeats: true, every: 'day' }
        : { at: new Date(scheduleAt) },
      channelId: sound === 'none' ? 'nurpath_silent' : 'nurpath_adhan',
      extra: { sound },
    };

    // Only set sound if not 'default' (null = let channel decide)
    if (soundFile !== null) {
      notification.sound = soundFile;
    }

    await LocalNotifications.schedule({ notifications: [notification] });
    console.log(`[NativeBridge] Alarm scheduled → ID:${notification.id}, Sound:${soundFile}, At:${scheduleAt}`);
    return true;
  } catch (err) {
    console.error('[NativeBridge] Failed to schedule alarm:', err);
    return false;
  }
}

/**
 * Cancel a previously scheduled alarm by ID.
 * @param {number} id
 */
export async function cancelAlarm(id) {
  if (!isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id }] });
    console.log(`[NativeBridge] Alarm cancelled → ID:${id}`);
  } catch (err) {
    console.warn('[NativeBridge] Failed to cancel alarm:', err);
  }
}

/**
 * Schedule all 5 Salah pre-reminders from saved settings.
 * Cancels previous alarms first to avoid duplicates.
 * @param {object} salahSettings - From getSalahPreReminders()
 * @param {object} customTimes   - From getCustomPrayerTimes()
 */
export async function scheduleAllSalahAlarms(salahSettings, customTimes) {
  if (!isNativePlatform()) return;

  const SALAH_IDS = {
    fajr: 1001,
    dhuhr: 1002,
    asr: 1003,
    maghrib: 1004,
    isha: 1005,
  };

  const SALAH_LABELS = {
    fajr: 'Fajr الفجر',
    dhuhr: 'Dhuhr الظهر',
    asr: 'Asr العصر',
    maghrib: 'Maghrib المغرب',
    isha: 'Isha العشاء',
  };

  for (const [salahId, baseId] of Object.entries(SALAH_IDS)) {
    const settings = salahSettings[salahId];
    if (!settings?.enabled) {
      // Cancel any existing alarm for this prayer
      await cancelAlarm(baseId);
      await cancelAlarm(baseId + 100); // pre-reminder id
      continue;
    }

    const timeStr = customTimes[salahId] || settings.customTime || '12:00';
    const [hours, minutes] = timeStr.split(':').map(Number);

    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    if (prayerTime <= new Date()) prayerTime.setDate(prayerTime.getDate() + 1);

    // 1. Pre-reminder alarm (X minutes before)
    const preTime = new Date(prayerTime.getTime() - settings.offsetMinutes * 60 * 1000);
    if (preTime > new Date()) {
      await cancelAlarm(baseId + 100);
      await schedulePrayerAlarm({
        id: baseId + 100,
        title: `⏰ ${SALAH_LABELS[salahId]} in ${settings.offsetMinutes} minutes`,
        body: `Prepare for ${SALAH_LABELS[salahId].split(' ')[0]} prayer. Make wudu and find your place.`,
        scheduleAt: preTime,
        sound: settings.sound || 'makkah_adhan',
        repeating: true,
      });
    }

    // 2. At-time Salah alarm
    if (settings.atTimeAlert !== false) {
      await cancelAlarm(baseId);
      await schedulePrayerAlarm({
        id: baseId,
        title: `🕌 ${SALAH_LABELS[salahId]} — Time to Pray`,
        body: 'Hayya \'alas-Salāh · Hayya \'alal-Falāh',
        scheduleAt: prayerTime,
        sound: settings.sound || 'makkah_adhan',
        repeating: true,
      });
    }
  }

  console.log('[NativeBridge] All Salah alarms scheduled.');
}

// ── Capacitor Preferences (key-value store, persists across app kills) ──
export async function nativeSet(key, value) {
  if (!isNativePlatform()) {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return;
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value: typeof value === 'string' ? value : JSON.stringify(value) });
  } catch (err) {
    console.warn('[NativeBridge] Preferences.set failed:', err);
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

export async function nativeGet(key) {
  if (!isNativePlatform()) {
    return localStorage.getItem(key);
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value;
  } catch (err) {
    console.warn('[NativeBridge] Preferences.get failed:', err);
    return localStorage.getItem(key);
  }
}

export async function nativeRemove(key) {
  if (!isNativePlatform()) {
    localStorage.removeItem(key);
    return;
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key });
  } catch (err) {
    localStorage.removeItem(key);
  }
}
