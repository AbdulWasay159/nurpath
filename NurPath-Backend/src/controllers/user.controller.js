const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, city, avatar, notificationsEnabled } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (city !== undefined) updates.city = city;
  if (avatar !== undefined) updates.avatar = avatar;
  if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated.', data: user });
});

module.exports = { getProfile, updateProfile };
