const mongoose = require('mongoose');

const prayerEntrySchema = new mongoose.Schema({
  name: { type: String, enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], required: true },
  status: { type: String, enum: ['pending', 'done', 'missed', 'qada'], default: 'pending' },
  markedAt: { type: Date, default: null },
  method: { type: String, enum: ['congregation', 'alone', 'qada', ''], default: '' },
  notes: { type: String, default: '' },
});

// Sunnah entry schema
// Names for normal days:  fajr_sunnah | dhuhr_before | dhuhr_after | asr_sunnah | maghrib_sunnah | isha_sunnah
// Name for Friday:        jumuah_after  (replaces dhuhr_before + dhuhr_after)
const sunnahEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['fajr_sunnah', 'dhuhr_before', 'dhuhr_after', 'asr_sunnah', 'maghrib_sunnah', 'isha_sunnah', 'jumuah_after'],
    required: true,
  },
  status: { type: String, enum: ['pending', 'done', 'skipped'], default: 'pending' },
  // For jumuah_after only: 'masjid' (4 rakah) | 'home' (2 rakah) | null
  variant: { type: String, enum: ['masjid', 'home', null], default: null },
  markedAt: { type: Date, default: null },
});

const prayerTrackingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    prayers: [prayerEntrySchema],
    completionRate: {
      type: Number,
      default: 0, // 0–100
    },
    sunnahPrayers: [sunnahEntrySchema],
    sunnahCompletionRate: {
      type: Number,
      default: 0, // 0–100
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound unique index: one document per user per day
prayerTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate completion rates before save
prayerTrackingSchema.pre('save', function (next) {
  // Farz completion
  const done = this.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  this.completionRate = Math.round((done / 5) * 100);

  // Sunnah completion (done / total sunnah entries)
  if (this.sunnahPrayers && this.sunnahPrayers.length > 0) {
    const sunnahDone = this.sunnahPrayers.filter((s) => s.status === 'done').length;
    this.sunnahCompletionRate = Math.round((sunnahDone / this.sunnahPrayers.length) * 100);
  } else {
    this.sunnahCompletionRate = 0;
  }

  next();
});

module.exports = mongoose.model('PrayerTracking', prayerTrackingSchema);
