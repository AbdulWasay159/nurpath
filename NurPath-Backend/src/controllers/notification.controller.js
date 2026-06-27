const Notification = require('../models/Notification.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/notifications — get notifications for current user
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    isActive: true,
    $or: [
      { isBroadcast: true },
      { recipients: req.user._id },
    ],
  })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  // Attach read status for each
  const data = notifications.map((n) => ({
    ...n.toObject(),
    isRead: n.readBy.some((id) => id.toString() === req.user._id.toString()),
  }));

  res.json({ success: true, data });
});

// PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });

  if (!notif.readBy.includes(req.user._id)) {
    notif.readBy.push(req.user._id);
    await notif.save();
  }

  res.json({ success: true, message: 'Marked as read.' });
});

// PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      isActive: true,
      readBy: { $ne: req.user._id },
      $or: [{ isBroadcast: true }, { recipients: req.user._id }],
    },
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// POST /api/notifications — admin only
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, isBroadcast, recipients, relatedEvent } = req.body;

  // Basic validation — prevent saving null/empty notifications
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Notification title is required.' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Notification message is required.' });
  }

  const notif = await Notification.create({
    title: title.trim(),
    message: message.trim(),
    type: type || 'announcement',
    isBroadcast: isBroadcast ?? true,
    recipients: recipients || [],
    relatedEvent: relatedEvent || null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Notification sent.', data: notif });
});

module.exports = { getNotifications, markRead, markAllRead, createNotification };
