const mongoose = require('mongoose');

const QuranProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lastSurahNumber: { type: Number, default: 1 },
  lastSurahName: { type: String, default: 'Al-Fatihah' },
  lastAyahNumber: { type: Number, default: 1 },
  lastReadPage: { type: Number, default: 1 },
  mode: { type: String, enum: ['reading', 'mushaf'], default: 'reading' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.QuranProgress || mongoose.model('QuranProgress', QuranProgressSchema);
