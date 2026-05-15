const express = require('express');
const { getTodayPrayers, updatePrayerStatus, getPrayerHistory, getPrayerStats } = require('../controllers/prayer.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.get('/today', getTodayPrayers);
router.put('/today/:prayerName', updatePrayerStatus);
router.get('/history', getPrayerHistory);
router.get('/stats', getPrayerStats);

module.exports = router;
