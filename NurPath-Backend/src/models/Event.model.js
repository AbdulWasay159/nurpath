const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    masjid: {
      type: String,
      required: [true, 'Masjid name is required'],
      trim: true,
    },
    speaker: {
      type: String,
      default: '',
      trim: true,
    },
    topic: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    posterImage: {
      type: String, // URL or base64
      default: '',
    },
    category: {
      type: String,
      enum: ['lecture', 'jumuah', 'halaqa', 'fundraiser', 'iftar', 'eid', 'community', 'other'],
      default: 'other',
    },
    capacity: {
      type: Number,
      default: null,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{ type: String, trim: true }],
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for upcoming events query
eventSchema.index({ date: 1, isActive: 1 });

module.exports = mongoose.model('Event', eventSchema);
