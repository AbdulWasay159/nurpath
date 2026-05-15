const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password, city } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, city: city || '' });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created. Welcome to NurPath!',
    token,
    user,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
  }

  const token = signToken(user._id);
  const userObj = user.toJSON();

  res.json({ success: true, message: 'Welcome back!', token, user: userObj });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

module.exports = { register, login, getMe, changePassword };
