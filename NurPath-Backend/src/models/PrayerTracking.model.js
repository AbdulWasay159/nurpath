const mongoose = require('mongoose');

const prayerEntrySchema = new mongoose.Schema({
  name: { type: String, enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], required: true },
  status: { type: String, enum: ['pending', 'done', 'missed', 'qada'], default: 'pending' },
  markedAt: { type: Date, default: null },
  method: { type: String, enum: ['congregation', 'alone', 'qada', ''], default: '' },
  notes: { type: String, default: '' },
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
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound unique index: one document per user per day
prayerTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate completion rate before save
prayerTrackingSchema.pre('save', function (next) {
  const done = this.prayers.filter((p) => p.status === 'done' || p.status === 'qada').length;
  this.completionRate = Math.round((done / 5) * 100);
  next();
});

module.exports = mongoose.model('PrayerTracking', prayerTrackingSchema);
