const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['announcement', 'event', 'prayer', 'streak', 'system'],
      default: 'announcement',
    },
    // null = broadcast to all users; array of IDs = targeted
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isBroadcast: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

notificationSchema.index({ isBroadcast: 1, isActive: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
