const PrayerTracking = require('../models/PrayerTracking.model');
const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Build a fresh prayers array with all 5 set to 'pending'
const freshPrayers = () =>
  PRAYER_NAMES.map((name) => ({ name, status: 'pending', markedAt: null, method: '', notes: '' }));

// GET /api/prayers/today
const getTodayPrayers = asyncHandler(async (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  let record = await PrayerTracking.findOne({ user: req.user._id, date: today });
  if (!record) {
    record = await PrayerTracking.create({
      user: req.user._id,
      date: today,
      prayers: freshPrayers(),
    });
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
    });
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

  // Update user totals
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
  };

  PRAYER_NAMES.forEach((name) => {
    stats.byPrayer[name] = { done: 0, missed: 0, pending: 0 };
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
  });

  const user = await User.findById(req.user._id);
  stats.streak = user.streak;

  res.json({ success: true, data: stats });
});

// PUT /api/prayers/:date/:prayerName  — edit a past prayer record
const updatePastPrayerStatus = asyncHandler(async (req, res) => {
  const { date, prayerName } = req.params;
  const { status, method, notes } = req.body;

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  // Reject today or future dates — use the /today route for those
  const today = new Date().toLocaleDateString('en-CA');
  if (date >= today) {
    return res.status(400).json({ success: false, message: 'Use the /today route to edit today\'s prayers.' });
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
    });
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

// Helper: sync user streak and totals
async function syncUserStats(userId) {
  const records = await PrayerTracking.find({ user: userId }).sort({ date: -1 });
  let totalPrayed = 0, totalMissed = 0, currentStreak = 0, longestStreak = 0;

  records.forEach((rec) => {
    totalPrayed += rec.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
    totalMissed += rec.prayers.filter((p) => p.status === 'missed').length;
  });

  // Calculate current streak (consecutive perfect days going back from today)
  // If today is still in-progress, start from yesterday so an unfinished day
  // doesn't zero an existing streak.
  const today = new Date().toLocaleDateString('en-CA');
  const todayRecord = records.find((r) => r.date === today);
  const todayIsComplete = todayRecord && todayRecord.completionRate === 100;
  const startOffset = todayIsComplete ? 0 : 1;

  let d = new Date();
  for (let i = startOffset; i < startOffset + records.length + 1; i++) {
    const expectedDate = new Date(d);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toLocaleDateString('en-CA');
    const rec = records.find((r) => r.date === expectedStr);
    if (rec && rec.completionRate === 100) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak by scanning all records chronologically
  // (separate pass — not nested inside the current-streak loop)
  const sortedAsc = [...records].sort((a, b) => (a.date > b.date ? 1 : -1));
  let runningStreak = 0;
  let prevDate = null;
  for (const rec of sortedAsc) {
    if (rec.completionRate === 100) {
      if (prevDate) {
        // Check if this day is exactly one day after the previous perfect day
        const prev = new Date(prevDate);
        prev.setDate(prev.getDate() + 1);
        const expectedNext = prev.toLocaleDateString('en-CA');
        if (rec.date === expectedNext) {
          runningStreak++;
        } else {
          runningStreak = 1; // gap — restart
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

  // Longest must be at least as big as current
  longestStreak = Math.max(longestStreak, currentStreak);

  await User.findByIdAndUpdate(userId, {
    totalPrayed,
    totalMissed,
    'streak.current': currentStreak,
    'streak.longest': longestStreak,
    'streak.lastActiveDate': today,
  });
}

module.exports = { getTodayPrayers, updatePrayerStatus, updatePastPrayerStatus, getPrayerHistory, getPrayerStats };
