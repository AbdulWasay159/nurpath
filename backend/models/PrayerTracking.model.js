const mongoose = require('mongoose');

const PrayerTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true,
  },
  prayers: {
    fajr: {
      fard: { type: Boolean, default: false },
      sunnah: { type: Boolean, default: false },
    },
    dhuhr: {
      fard: { type: Boolean, default: false },
      sunnah: { type: Boolean, default: false },
    },
    asr: {
      fard: { type: Boolean, default: false },
      sunnah: { type: Boolean, default: false },
    },
    maghrib: {
      fard: { type: Boolean, default: false },
      sunnah: { type: Boolean, default: false },
    },
    isha: {
      fard: { type: Boolean, default: false },
      sunnah: { type: Boolean, default: false },
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PrayerTrackingSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.PrayerTracking || mongoose.model('PrayerTracking', PrayerTrackingSchema);
