/**
 * NurPath Hijri (Islamic) Calendar Converter
 * Algorithm: Tabular Islamic Calendar (most accurate for general use)
 * No external dependencies
 */

const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيعُ الأَوَّل', 'رَبِيعُ الثَّانِي',
  'جُمَادَى الأُولَى', 'جُمَادَى الثَّانِيَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة',
];

const HIJRI_DAYS_AR = [
  'الأَحَد', 'الإِثْنَيْن', 'الثُّلَاثَاء', 'الأَرْبِعَاء',
  'الخَمِيس', 'الجُمُعَة', 'السَّبْت',
];

/**
 * Convert Gregorian date to Hijri
 * @param {Date} date
 * @returns {{ day, month, year, monthName, monthNameAr, dayAr, formatted, formattedAr }}
 */
export function gregorianToHijri(date = new Date()) {
  // Julian Day Number
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();

  const JD = Math.floor(
    (1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4 +
    Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4) +
    D - 32075
  );

  // Convert JD to Hijri
  const L = JD - 1948440 + 10632;
  const N = Math.floor((L - 1) / 10631);
  const LL = L - 10631 * N + 354;
  const J =
    Math.floor((10985 - LL) / 5316) * Math.floor((50 * LL) / 17719) +
    Math.floor(LL / 5670) * Math.floor((43 * LL) / 15238);
  const LL2 = LL - Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50) -
    Math.floor(J / 16) * Math.floor((15238 * J) / 43) + 29;
  const month = Math.floor((24 * LL2) / 709);
  const day = LL2 - Math.floor((709 * month) / 24);
  const year = 30 * N + J - 30;

  const monthName = HIJRI_MONTHS[month - 1];
  const monthNameAr = HIJRI_MONTHS_AR[month - 1];
  const dayAr = HIJRI_DAYS_AR[date.getDay()];

  return {
    day,
    month,
    year,
    monthName,
    monthNameAr,
    dayAr,
    formatted: `${day} ${monthName} ${year} AH`,
    formattedAr: `${day} ${monthNameAr} ${year} هـ`,
    formattedShort: `${day} ${monthName.split(' ')[0]} ${year}`,
  };
}

/**
 * Get special Islamic dates for awareness
 */
export function getIslamicOccasion(hijri) {
  const { day, month } = hijri;

  const occasions = {
    '1-1':  'Islamic New Year (1 Muharram)',
    '10-1': 'Day of Ashura (10 Muharram)',
    '12-3': "Birth of Prophet ﷺ — Rabi' al-Awwal",
    '27-7': "Isra wal Mi'raj (27 Rajab)",
    '15-8': "Shab-e-Barat (15 Sha'ban)",
    '1-9':  'First day of Ramadan',
    '27-9': 'Laylat al-Qadr (likely)',
    '1-10': 'Eid al-Fitr',
    '9-12': 'Day of Arafah',
    '10-12': 'Eid al-Adha',
  };

  return occasions[`${day}-${month}`] || null;
}
