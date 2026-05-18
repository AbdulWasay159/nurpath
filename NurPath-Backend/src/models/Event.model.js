const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:   { type: String, enum: ['attending', 'not_attending'], default: 'attending' },
  markedAt: { type: Date, default: Date.now },
}, { _id: false });

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    date:   { type: Date, required: [true, 'Event date is required'] },
    time:   { type: String, required: [true, 'Event time is required'] },
    masjid: { type: String, required: [true, 'Masjid name is required'], trim: true },
    speaker:     { type: String, default: '', trim: true },
    topic:       { type: String, default: '', trim: true },
    description: { type: String, default: '', maxlength: [2000] },
    posterImage: { type: String, default: '' },
    category: {
      type: String,
      enum: ['lecture', 'jumuah', 'halaqa', 'fundraiser', 'iftar', 'eid', 'community', 'other'],
      default: 'other',
    },
    capacity: { type: Number, default: null },
    address:  { type: String, default: '' },
    tags:     [{ type: String, trim: true }],

    // Attendance
    attendees:      [attendeeSchema],
    attendingCount: { type: Number, default: 0 },

    isActive:  { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1, isActive: 1 });

eventSchema.pre('save', function (next) {
  this.attendingCount = this.attendees.filter((a) => a.status === 'attending').length;
  next();
});

module.exports = mongoose.model('Event', eventSchema);
