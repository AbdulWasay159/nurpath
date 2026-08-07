const mongoose = require('mongoose');

const QuranBookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  surahNumber: { type: Number, required: true },
  surahName: { type: String, required: true },
  ayahNumber: { type: Number, required: true },
  arabicText: { type: String, default: '' },
  translationText: { type: String, default: '' },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

QuranBookmarkSchema.index({ userId: 1, surahNumber: 1, ayahNumber: 1 }, { unique: true });

module.exports = mongoose.models.QuranBookmark || mongoose.model('QuranBookmark', QuranBookmarkSchema);
