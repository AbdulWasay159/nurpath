const PrayerTracking = require('../models/PrayerTracking.model');
const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Normal-day sunnah names
const SUNNAH_NAMES_WEEKDAY = ['fajr_sunnah', 'dhuhr_before', 'dhuhr_after', 'asr_sunnah', 'maghrib_sunnah', 'isha_sunnah'];
// Friday sunnah names (dhuhr replaced by jumuah_after)
const SUNNAH_NAMES_FRIDAY  = ['fajr_sunnah', 'jumuah_after', 'asr_sunnah', 'maghrib_sunnah', 'isha_sunnah'];
// All valid sunnah name values
const ALL_SUNNAH_NAMES = [...new Set([...SUNNAH_NAMES_WEEKDAY, ...SUNNAH_NAMES_FRIDAY])];

// Build a fresh prayers array with all 5 set to 'pending'
const freshPrayers = () =>
  PRAYER_NAMES.map((name) => ({ name, status: 'pending', markedAt: null, method: '', notes: '' }));

// Build a fresh sunnah array for the given date string (YYYY-MM-DD)
const freshSunnahPrayers = (dateStr) => {
  const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay(); // 5 = Friday
  const names = dayOfWeek === 5 ? SUNNAH_NAMES_FRIDAY : SUNNAH_NAMES_WEEKDAY;
  return names.map((name) => ({ name, status: 'pending', variant: null, markedAt: null }));
};

// Ensure a record's sunnahPrayers array is populated (migration-safe)
const ensureSunnah = (record) => {
  if (!record.sunnahPrayers || record.sunnahPrayers.length === 0) {
    record.sunnahPrayers = freshSunnahPrayers(record.date);
  }
};

// ─── FARZ ROUTES ─────────────────────────────────────────────────────────────

// GET /api/prayers/today
const getTodayPrayers = asyncHandler(async (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  let record = await PrayerTracking.findOne({ user: req.user._id, date: today });
  if (!record) {
    record = await PrayerTracking.create({
      user: req.user._id,
      date: today,
      prayers: freshPrayers(),
      sunnahPrayers: freshSunnahPrayers(today),
    });
  } else {
    // Migration: seed sunnah if missing on existing record.
    // Only save if something actually changed — avoids a pointless DB write on every page load.
    ensureSunnah(record);
    if (record.isModified()) {
      await record.save();
    }
  }

  res.json({ success: true, data: record });
});

// PUT /api/prayers/today/:prayerName
const updatePrayerStatus = asyncHandler(async (req, res) => {
  const { prayerName } = req.params;
  const { status, method, notes } = req.body;

  if (!PRAYER_NAMES.includes(prayerName)) {
    return res.status(400).json({ success: false, message: 'Invalid prayer name.' });
  }
  if (!['pending', 'done', 'missed', 'qada'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  const today = new Date().toLocaleDateString('en-CA');
  let record = await PrayerTracking.findOne({ user: req.user._id, date: today });

  if (!record) {
    record = new PrayerTracking({
      user: req.user._id,
      date: today,
      prayers: freshPrayers(),
      sunnahPrayers: freshSunnahPrayers(today),
    });
  } else {
    ensureSunnah(record);
  }

  const prayer = record.prayers.find((p) => p.name === prayerName);
  if (!prayer) {
    return res.status(404).json({ success: false, message: 'Prayer entry not found.' });
  }

  prayer.status = status;
  prayer.markedAt = status !== 'pending' ? new Date() : null;
  if (method !== undefined) prayer.method = method;
  if (notes !== undefined) prayer.notes = notes;

  await record.save();
  await syncUserStats(req.user._id);

  res.json({ success: true, message: 'Prayer updated.', data: record });
});

// GET /api/prayers/history?days=30
const getPrayerHistory = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toLocaleDateString('en-CA');

  const records = await PrayerTracking.find({
    user: req.user._id,
    date: { $gte: sinceStr },
  }).sort({ date: -1 });

  // Migration: ensure sunnah exists on every returned record (in-memory only for GET)
  records.forEach((r) => ensureSunnah(r));

  res.json({ success: true, data: records });
});

// GET /api/prayers/stats
const getPrayerStats = asyncHandler(async (req, res) => {
  const records = await PrayerTracking.find({ user: req.user._id });

  const stats = {
    totalDays: records.length,
    totalPrayed: 0,
    totalMissed: 0,
    perfectDays: 0,
    byPrayer: {},
    sunnah: {
      totalDone: 0,
      totalSkipped: 0,
      bySunnah: {},
    },
  };

  PRAYER_NAMES.forEach((name) => {
    stats.byPrayer[name] = { done: 0, missed: 0, pending: 0 };
  });
  ALL_SUNNAH_NAMES.forEach((name) => {
    stats.sunnah.bySunnah[name] = { done: 0, skipped: 0, pending: 0 };
  });

  records.forEach((rec) => {
    const done = rec.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
    const missed = rec.prayers.filter((p) => p.status === 'missed').length;
    stats.totalPrayed += done;
    stats.totalMissed += missed;
    if (done === 5) stats.perfectDays++;
    rec.prayers.forEach((p) => {
      if (stats.byPrayer[p.name]) {
        if (p.status === 'done' || p.status === 'qada') stats.byPrayer[p.name].done++;
        else if (p.status === 'missed') stats.byPrayer[p.name].missed++;
        else stats.byPrayer[p.name].pending++;
      }
    });

    // Sunnah stats
    (rec.sunnahPrayers || []).forEach((s) => {
      if (s.status === 'done') stats.sunnah.totalDone++;
      else if (s.status === 'skipped') stats.sunnah.totalSkipped++;
      if (stats.sunnah.bySunnah[s.name]) {
        if (s.status === 'done') stats.sunnah.bySunnah[s.name].done++;
        else if (s.status === 'skipped') stats.sunnah.bySunnah[s.name].skipped++;
        else stats.sunnah.bySunnah[s.name].pending++;
      }
    });
  });

  const user = await User.findById(req.user._id);
  stats.streak = user.streak;

  res.json({ success: true, data: stats });
});

// PUT /api/prayers/:date/:prayerName  — edit a past farz prayer record
const updatePastPrayerStatus = asyncHandler(async (req, res) => {
  const { date, prayerName } = req.params;
  const { status, method, notes } = req.body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
  }
  const today = new Date().toLocaleDateString('en-CA');
  if (date >= today) {
    return res.status(400).json({ success: false, message: "Use the /today route to edit today's prayers." });
  }
  if (!PRAYER_NAMES.includes(prayerName)) {
    return res.status(400).json({ success: false, message: 'Invalid prayer name.' });
  }
  if (!['pending', 'done', 'missed', 'qada'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  let record = await PrayerTracking.findOne({ user: req.user._id, date });
  if (!record) {
    record = new PrayerTracking({
      user: req.user._id,
      date,
      prayers: freshPrayers(),
      sunnahPrayers: freshSunnahPrayers(date),
    });
  } else {
    ensureSunnah(record);
  }

  const prayer = record.prayers.find((p) => p.name === prayerName);
  if (!prayer) {
    return res.status(404).json({ success: false, message: 'Prayer entry not found.' });
  }

  prayer.status = status;
  prayer.markedAt = status !== 'pending' ? new Date() : null;
  if (method !== undefined) prayer.method = method;
  if (notes !== undefined) prayer.notes = notes;

  await record.save();
  await syncUserStats(req.user._id);

  res.json({ success: true, message: 'Past prayer updated.', data: record });
});

// ─── SUNNAH ROUTES ────────────────────────────────────────────────────────────

// PUT /api/prayers/today/sunnah/:sunnahName
const updateSunnahStatus = asyncHandler(async (req, res) => {
  const { sunnahName } = req.params;
  const { status, variant } = req.body;

  if (!ALL_SUNNAH_NAMES.includes(sunnahName)) {
    return res.status(400).json({ success: false, message: 'Invalid sunnah name.' });
  }
  if (!['pending', 'done', 'skipped'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Use: pending, done, skipped.' });
  }
  // variant only valid for jumuah_after
  if (variant !== undefined && sunnahName !== 'jumuah_after') {
    return res.status(400).json({ success: false, message: 'variant is only valid for jumuah_after.' });
  }
  if (sunnahName === 'jumuah_after' && variant && !['masjid', 'home'].includes(variant)) {
    return res.status(400).json({ success: false, message: 'variant must be masjid or home.' });
  }

  const today = new Date().toLocaleDateString('en-CA');
  let record = await PrayerTracking.findOne({ user: req.user._id, date: today });

  if (!record) {
    record = new PrayerTracking({
      user: req.user._id,
      date: today,
      prayers: freshPrayers(),
      sunnahPrayers: freshSunnahPrayers(today),
    });
  } else {
    ensureSunnah(record);
  }

  const sunnah = record.sunnahPrayers.find((s) => s.name === sunnahName);
  if (!sunnah) {
    return res.status(404).json({ success: false, message: 'Sunnah entry not found for today.' });
  }

  sunnah.status = status;
  sunnah.markedAt = status !== 'pending' ? new Date() : null;
  if (sunnahName === 'jumuah_after') {
    sunnah.variant = variant || null;
  }

  await record.save();
  res.json({ success: true, message: 'Sunnah updated.', data: record });
});

// PUT /api/prayers/:date/sunnah/:sunnahName  — edit past sunnah
const updatePastSunnahStatus = asyncHandler(async (req, res) => {
  const { date, sunnahName } = req.params;
  const { status, variant } = req.body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
  }
  const today = new Date().toLocaleDateString('en-CA');
  if (date >= today) {
    return res.status(400).json({ success: false, message: "Use the /today route to edit today's sunnah." });
  }
  if (!ALL_SUNNAH_NAMES.includes(sunnahName)) {
    return res.status(400).json({ success: false, message: 'Invalid sunnah name.' });
  }
  if (!['pending', 'done', 'skipped'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  let record = await PrayerTracking.findOne({ user: req.user._id, date });
  if (!record) {
    record = new PrayerTracking({
      user: req.user._id,
      date,
      prayers: freshPrayers(),
      sunnahPrayers: freshSunnahPrayers(date),
    });
  } else {
    ensureSunnah(record);
  }

  const sunnah = record.sunnahPrayers.find((s) => s.name === sunnahName);
  if (!sunnah) {
    return res.status(404).json({ success: false, message: 'Sunnah entry not found.' });
  }

  sunnah.status = status;
  sunnah.markedAt = status !== 'pending' ? new Date() : null;
  if (sunnahName === 'jumuah_after') {
    sunnah.variant = variant || null;
  }

  await record.save();
  res.json({ success: true, message: 'Past sunnah updated.', data: record });
});

// ─── HELPER ───────────────────────────────────────────────────────────────────

async function syncUserStats(userId) {
  const today = new Date().toLocaleDateString('en-CA');

  // ── Totals via aggregation — one pipeline instead of loading all records ──
  const totalsResult = await PrayerTracking.aggregate([
    { $match: { user: userId } },
    { $unwind: '$prayers' },
    {
      $group: {
        _id: null,
        totalPrayed: {
          $sum: { $cond: [{ $in: ['$prayers.status', ['done', 'qada']] }, 1, 0] },
        },
        totalMissed: {
          $sum: { $cond: [{ $eq: ['$prayers.status', 'missed'] }, 1, 0] },
        },
      },
    },
  ]);

  const totalPrayed = totalsResult[0]?.totalPrayed ?? 0;
  const totalMissed = totalsResult[0]?.totalMissed ?? 0;

  // ── Streak — only fetch last 90 days sorted desc, not all time ──
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceStr = since.toLocaleDateString('en-CA');

  const recentRecords = await PrayerTracking.find(
    { user: userId, date: { $gte: sinceStr } },
    { date: 1, completionRate: 1 }
  ).sort({ date: -1 });

  const todayRecord = recentRecords.find((r) => r.date === today);
  const todayIsComplete = todayRecord && todayRecord.completionRate === 100;
  const startOffset = todayIsComplete ? 0 : 1;

  let currentStreak = 0;
  const d = new Date();
  for (let i = startOffset; i < startOffset + recentRecords.length + 1; i++) {
    const expected = new Date(d);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toLocaleDateString('en-CA');
    const rec = recentRecords.find((r) => r.date === expectedStr);
    if (rec && rec.completionRate === 100) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Longest streak from sorted-ascending recent records
  const sortedAsc = [...recentRecords].sort((a, b) => (a.date > b.date ? 1 : -1));
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;
  for (const rec of sortedAsc) {
    if (rec.completionRate === 100) {
      if (prevDate) {
        const prev = new Date(prevDate);
        prev.setDate(prev.getDate() + 1);
        if (rec.date === prev.toLocaleDateString('en-CA')) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      } else {
        runningStreak = 1;
      }
      prevDate = rec.date;
      if (runningStreak > longestStreak) longestStreak = runningStreak;
    } else {
      runningStreak = 0;
      prevDate = null;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  await User.findByIdAndUpdate(userId, {
    totalPrayed,
    totalMissed,
    'streak.current': currentStreak,
    'streak.longest': longestStreak,
    'streak.lastActiveDate': today,
  });
}

module.exports = {
  getTodayPrayers,
  updatePrayerStatus,
  updatePastPrayerStatus,
  getPrayerHistory,
  getPrayerStats,
  updateSunnahStatus,
  updatePastSunnahStatus,
};
