const express = require('express');
const {
  getTodayPrayers,
  updatePrayerStatus,
  updatePastPrayerStatus,
  getPrayerHistory,
  getPrayerStats,
  updateSunnahStatus,
  updatePastSunnahStatus,
} = require('../controllers/prayer.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

// ── Static / named routes first (before any :param wildcards) ──
router.get('/today',                           getTodayPrayers);
router.get('/history',                         getPrayerHistory);
router.get('/stats',                           getPrayerStats);

// ── Today's farz & sunnah updates ──
router.put('/today/:prayerName',               updatePrayerStatus);
router.put('/today/sunnah/:sunnahName',        updateSunnahStatus);

// ── Past date farz & sunnah updates ──
// NOTE: /today/sunnah/:name is registered above so 'today' won't be treated as a :date here
router.put('/:date/sunnah/:sunnahName',        updatePastSunnahStatus);
router.put('/:date/:prayerName',               updatePastPrayerStatus);

module.exports = router;
