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

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }
    updates.name = trimmedName;
  }

  if (city !== undefined) updates.city = city;

  if (avatar !== undefined) {
    // Only accept http/https URLs with a reasonable length
    if (avatar !== '' && (!/^https?:\/\/.+/.test(avatar) || avatar.length > 500)) {
      return res.status(400).json({ success: false, message: 'Avatar must be a valid http/https URL under 500 characters.' });
    }
    updates.avatar = avatar;
  }

  if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated.', data: user });
});

module.exports = { getProfile, updateProfile };
