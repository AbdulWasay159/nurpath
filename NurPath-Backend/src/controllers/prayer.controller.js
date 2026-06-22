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

// Helper: sync user streak and totals
// Helper: sync user streak and totals
async function syncUserStats(userId) {
  const records = await PrayerTracking.find({ user: userId }).sort({ date: -1 });
  let totalPrayed = 0, totalMissed = 0, streak = 0, longest = 0;

  records.forEach((rec) => {
    totalPrayed += rec.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
    totalMissed += rec.prayers.filter((p) => p.status === 'missed').length;
  });

  // Calculate streak (consecutive days with completionRate === 100)
  // Today is only counted if it's already a perfect day — if today is still
  // in progress (not yet 100%), we don't let it break a streak built on
  // previous days. The streak should only break once today fully ends
  // without being completed.
  const today = new Date().toLocaleDateString('en-CA');
  const todayRecord = records.find((r) => r.date === today);
  const todayIsComplete = todayRecord && todayRecord.completionRate === 100;

  // Start the lookback from today if it's already perfect, otherwise
  // start from yesterday so an unfinished "today" doesn't zero the streak.
  const startOffset = todayIsComplete ? 0 : 1;

  let d = new Date();
  for (let i = startOffset; i < startOffset + records.length; i++) {
    const expectedDate = new Date(d);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toLocaleDateString('en-CA');
    const rec = records.find((r) => r.date === expectedStr);
    if (rec && rec.completionRate === 100) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      break;
    }
  }

  // If today was already perfect, it's already included in the loop above.
  // If today is in progress, the streak reflects "as of yesterday" — which
  // is the correct, non-punishing behavior while the day is still ongoing.

  await User.findByIdAndUpdate(userId, {
    totalPrayed,
    totalMissed,
    'streak.current': streak,
    'streak.longest': Math.max(longest, streak),
    'streak.lastActiveDate': today,
  });
}

module.exports = { getTodayPrayers, updatePrayerStatus, getPrayerHistory, getPrayerStats };
