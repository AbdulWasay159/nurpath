/**
 * NurPath Prayer Times Calculator
 * Method: Ahle Hadees / Umm Al-Qura (Fajr 18°, Isha 17°)
 * Pure JS — no external dependencies
 */

// ── Constants ──────────────────────────────────────────────
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** Ahle Hadees parameters (widely used in South Asia / Arabian Peninsula) */
const AHL_E_HADEES = {
  fajrAngle: 18,   // degrees below horizon
  ishaAngle: 17,   // degrees below horizon
  maghribOffset: 2, // minutes after sunset
  name: 'Ahle Hadees (18°/17°)',
};

// ── Math helpers ───────────────────────────────────────────
const sin  = (d) => Math.sin(d * DEG_TO_RAD);
const cos  = (d) => Math.cos(d * DEG_TO_RAD);
const tan  = (d) => Math.tan(d * DEG_TO_RAD);
const asin = (x) => Math.asin(x) * RAD_TO_DEG;
const acos = (x) => Math.acos(x) * RAD_TO_DEG;
const atan2 = (y, x) => Math.atan2(y, x) * RAD_TO_DEG;

function fixAngle(a) {
  return a - 360 * Math.floor(a / 360);
}

function fixHour(h) {
  return h - 24 * Math.floor(h / 24);
}

// ── Julian Day Number ──────────────────────────────────────
function julianDay(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// ── Sun position ───────────────────────────────────────────
function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
  const dec = asin(sin(e) * sin(L));
  const eqT = q / 15 - fixHour(RA);
  return { dec, eqT };
}

// ── Time for given angle ───────────────────────────────────
function hourAngle(angle, lat, dec) {
  const val = (-sin(angle) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
  if (val >= 1)  return null; // never rises
  if (val <= -1) return null; // never sets
  return acos(val) / 15;
}

// ── Asr shadow factor (Hanafi = 2, Shafi/Hanbali/Maliki = 1) ──
function asrTime(factor, lat, dec, noon) {
  const angle = -RAD_TO_DEG * Math.atan(1 / (factor + tan(Math.abs(lat - dec) * DEG_TO_RAD)));
  const ha = hourAngle(angle, lat, dec);
  if (ha === null) return null;
  return noon + ha;
}

// ── Main calculator ────────────────────────────────────────
/**
 * @param {number} lat  - latitude
 * @param {number} lng  - longitude
 * @param {Date}   date - JS Date (local timezone)
 * @returns {{ fajr, sunrise, dhuhr, asr, maghrib, isha }} - times as Date objects
 */
export function calculatePrayerTimes(lat, lng, date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const day   = date.getDate();

  const jd = julianDay(year, month, day);
  const { dec, eqT } = sunPosition(jd);

  // UTC offset in hours (handles DST automatically via browser)
  const utcOffset = -date.getTimezoneOffset() / 60;

  // Solar noon in local time
  const noon = 12 - eqT - lng / 15 + utcOffset;

  // Times in decimal hours
  const fajrHa    = hourAngle(-AHL_E_HADEES.fajrAngle, lat, dec);
  const sunriseHa = hourAngle(-0.833, lat, dec);
  const ishaHa    = hourAngle(-AHL_E_HADEES.ishaAngle, lat, dec);

  if (fajrHa === null || sunriseHa === null || ishaHa === null) {
    return null; // polar edge case
  }

  const fajrH    = noon - fajrHa;
  const sunriseH = noon - sunriseHa;
  const dhuhrH   = noon + 0.017; // 1 min after zawal
  const asrH     = asrTime(1, lat, dec, noon); // Shafi shadow factor = 1 (Ahle Hadees follows this)
  const maghribH = noon + sunriseHa + AHL_E_HADEES.maghribOffset / 60;
  const ishaH    = noon + ishaHa;

  // Convert decimal hours → Date objects
  const toDate = (h) => {
    const totalMin = Math.round(h * 60);
    const result = new Date(date);
    result.setHours(Math.floor(totalMin / 60), totalMin % 60, 0, 0);
    return result;
  };

  return {
    fajr:    toDate(fajrH),
    sunrise: toDate(sunriseH),
    dhuhr:   toDate(dhuhrH),
    asr:     asrH ? toDate(asrH) : null,
    maghrib: toDate(maghribH),
    isha:    toDate(ishaH),
  };
}

// ── Next prayer helper ─────────────────────────────────────
/**
 * Returns the next upcoming prayer name + time + minutes remaining
 */
export function getNextPrayer(times, now = new Date()) {
  if (!times) return null;

  const prayers = [
    { name: 'fajr',    label: 'Fajr',    arabic: 'الفجر',   time: times.fajr },
    { name: 'dhuhr',   label: 'Dhuhr',   arabic: 'الظهر',   time: times.dhuhr },
    { name: 'asr',     label: 'Asr',     arabic: 'العصر',   time: times.asr },
    { name: 'maghrib', label: 'Maghrib', arabic: 'المغرب',  time: times.maghrib },
    { name: 'isha',    label: 'Isha',    arabic: 'العشاء',  time: times.isha },
  ].filter((p) => p.time);

  for (const prayer of prayers) {
    if (prayer.time > now) {
      const diffMs = prayer.time - now;
      const diffMin = Math.floor(diffMs / 60000);
      return {
        ...prayer,
        minutesLeft: diffMin,
        hoursLeft: Math.floor(diffMin / 60),
        minsLeft: diffMin % 60,
      };
    }
  }

  // Past Isha — return tomorrow's Fajr
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { fajr: tomorrowFajr } = calculatePrayerTimes(
    /* we don't have lat/lng here, just return fajr label */
    0, 0, tomorrow
  ) || {};

  return {
    name: 'fajr',
    label: 'Fajr',
    arabic: 'الفجر',
    time: null,
    minutesLeft: null,
    hoursLeft: null,
    minsLeft: null,
    isTomorrow: true,
  };
}

// ── Islamic greeting based on current prayer time ──────────
export function getIslamicGreeting(times, now = new Date()) {
  if (!times) {
    const h = now.getHours();
    if (h < 12) return { text: 'Good Morning', arabic: 'صَبَاحُ الخَيْر', sub: 'Fajr time is before dawn' };
    if (h < 17) return { text: 'Good Afternoon', arabic: 'مَسَاءُ الخَيْر', sub: 'Remember your midday prayers' };
    return { text: 'Good Evening', arabic: 'مَسَاءُ النُّور', sub: 'Maghrib approaches' };
  }

  const { fajr, sunrise, dhuhr, asr, maghrib, isha } = times;

  if (now < fajr) {
    return { text: 'Good Night', arabic: 'لَيْلَة مُبَارَكَة', sub: 'Fajr is approaching — rise for salah' };
  }
  if (now < sunrise) {
    return { text: 'Fajr Mubarak', arabic: 'صَلَاةُ الفَجْر', sub: 'The most blessed time of day 🌙' };
  }
  if (now < dhuhr) {
    return { text: 'Good Morning', arabic: 'صَبَاحُ الخَيْر', sub: 'Dhuhr is approaching' };
  }
  if (now < asr) {
    return { text: 'Good Afternoon', arabic: 'مَسَاءُ الخَيْر', sub: 'Asr time is ahead' };
  }
  if (now < maghrib) {
    return { text: 'Good Afternoon', arabic: 'مَسَاءُ الخَيْر', sub: 'Maghrib is approaching' };
  }
  if (now < isha) {
    return { text: 'Good Evening', arabic: 'مَسَاءُ النُّور', sub: 'Isha prayer is ahead' };
  }
  return { text: 'Good Night', arabic: 'لَيْلَة مُبَارَكَة', sub: 'Rest well — Fajr awaits' };
}

// ── Format time ────────────────────────────────────────────
export function formatPrayerTime(date) {
  if (!date) return '--:--';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── Prayer-specific hadiths ────────────────────────────────
export const PRAYER_HADITHS = {
  fajr: {
    text: 'The two rakahs of Fajr are better than this world and everything in it.',
    source: 'Sahih Muslim 725',
    arabic: 'رَكْعَتَا الفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا',
  },
  dhuhr: {
    text: 'The gates of Paradise are opened at noon (Dhuhr), and the believer who prays four rakahs before Dhuhr — Allah forbids the Fire from touching him.',
    source: 'Abu Dawud 1269',
    arabic: 'مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ',
  },
  asr: {
    text: 'Whoever misses the Asr prayer, it is as if he lost his family and wealth.',
    source: 'Sahih Bukhari 552',
    arabic: 'مَنْ فَاتَتْهُ صَلَاةُ الْعَصْرِ فَكَأَنَّمَا وُتِرَ أَهْلَهُ وَمَالَهُ',
  },
  maghrib: {
    text: 'Guard strictly the middle prayer (Asr) and the Maghrib prayer and stand before Allah with obedience.',
    source: 'Quran 2:238',
    arabic: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَى',
  },
  isha: {
    text: 'If people knew the reward for praying Isha and Fajr in congregation, they would come even if they had to crawl.',
    source: 'Sahih Bukhari 615',
    arabic: 'لَوْ يَعْلَمُ النَّاسُ مَا فِي النِّدَاءِ وَالصَّفِّ الْأَوَّلِ ثُمَّ لَمْ يَجِدُوا إِلَّا أَنْ يَسْتَهِمُوا عَلَيْهِ لَاسْتَهَمُوا',
  },
  general: {
    text: 'Prayer is the pillar of the religion. Whoever establishes it has established the religion, and whoever destroys it has destroyed the religion.',
    source: 'Bayhaqi',
    arabic: 'الصَّلَاةُ عِمَادُ الدِّينِ مَنْ أَقَامَهَا فَقَدْ أَقَامَ الدِّينَ وَمَنْ هَدَمَهَا فَقَدْ هَدَمَ الدِّينَ',
  },
};

export function getCurrentPrayerHadith(times, now = new Date()) {
  if (!times) return PRAYER_HADITHS.general;
  const { fajr, sunrise, dhuhr, asr, maghrib, isha } = times;
  if (now >= fajr && now < sunrise) return PRAYER_HADITHS.fajr;
  if (now >= dhuhr && now < asr)   return PRAYER_HADITHS.dhuhr;
  if (now >= asr && now < maghrib) return PRAYER_HADITHS.asr;
  if (now >= maghrib && now < isha) return PRAYER_HADITHS.maghrib;
  if (now >= isha) return PRAYER_HADITHS.isha;
  return PRAYER_HADITHS.fajr; // before fajr
}
