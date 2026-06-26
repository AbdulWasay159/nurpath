const express = require('express');
const { getTodayPrayers, updatePrayerStatus, updatePastPrayerStatus, getPrayerHistory, getPrayerStats } = require('../controllers/prayer.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.get('/today', getTodayPrayers);
router.put('/today/:prayerName', updatePrayerStatus);
router.put('/:date/:prayerName', updatePastPrayerStatus);
router.get('/history', getPrayerHistory);
router.get('/stats', getPrayerStats);

module.exports = router;
