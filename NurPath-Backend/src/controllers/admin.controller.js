const User = require('../models/User.model');
const Event = require('../models/Event.model');
const PrayerTracking = require('../models/PrayerTracking.model');
const Notification = require('../models/Notification.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalEvents, totalPrayers, recentUsers] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Event.countDocuments({ isActive: true }),
    PrayerTracking.countDocuments(),
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt city'),
  ]);

  const upcomingEvents = await Event.find({ isActive: true, date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(5);

  res.json({
    success: true,
    data: { totalUsers, totalEvents, totalPrayers, recentUsers, upcomingEvents },
  });
});

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
});

// PUT /api/admin/users/:id/toggle-active
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts.' });
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: user });
});

// PUT /api/admin/users/:id/make-admin
const makeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'User is already an admin.' });
  }
  user.role = 'admin';
  await user.save();
  res.json({ success: true, message: `${user.name} is now an admin.`, data: user });
});

// PUT /api/admin/users/:id/remove-admin
const removeAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot remove your own admin access.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.role = 'user';
  await user.save();
  res.json({ success: true, message: `${user.name} is no longer an admin.`, data: user });
});

// POST /api/admin/announcements
const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }
  const notif = await Notification.create({
    title,
    message,
    type: 'announcement',
    isBroadcast: true,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, message: 'Announcement sent to all users.', data: notif });
});

module.exports = { getDashboard, getAllUsers, toggleUserActive, makeAdmin, removeAdmin, sendAnnouncement };
