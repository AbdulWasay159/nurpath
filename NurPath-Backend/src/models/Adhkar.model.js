const mongoose = require('mongoose');

const adhkarSchema = new mongoose.Schema(
  {
    arabic: {
      type: String,
      required: [true, 'Arabic text is required'],
      trim: true,
    },
    transliteration: {
      type: String,
      required: [true, 'Transliteration is required'],
      trim: true,
    },
    translation: {
      type: String,
      required: [true, 'Translation is required'],
      trim: true,
    },
    count: {
      type: Number,
      required: [true, 'Count is required'],
      default: 1,
    },
    timing: {
      type: [String],
      enum: ['morning', 'evening'],
      required: [true, 'Timing is required'],
    },
    virtue: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
      required: [true, 'Reference is required'],
    },
    authenticity: {
      type: String,
      trim: true,
      required: [true, 'Authenticity grading is required'],
    },
    occasion: {
      type: String,
      trim: true,
    },
    benefits: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Adhkar', adhkarSchema);
