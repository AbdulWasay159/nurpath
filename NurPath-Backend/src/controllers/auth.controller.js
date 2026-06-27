const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendPasswordResetEmail } = require('../utils/email');

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

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.isLocked()) {
    const minsLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      success: false,
      message: `Too many failed attempts. Account locked for ${minsLeft} more minute(s).`,
    });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    await user.incLoginAttempts();
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
  }

  if (user.loginAttempts > 0 || user.lockUntil) {
    await user.resetLoginAttempts();
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

  // Validate new password — Mongoose minlength only fires on create, not on direct assignment + save()
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email } = req.body;

  // Always return the same response — don't reveal whether the email exists
  const genericReply = () =>
    res.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return genericReply();

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch (err) {
    // Roll back the token so a failed email doesn't leave a dangling valid token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('❌ Failed to send reset email:', err.message);
    return res.status(500).json({ success: false, message: 'Could not send reset email. Please try again later.' });
  }

  return genericReply();
});

// POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');

  if (!user) {
    return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = signToken(user._id);
  res.json({ success: true, message: 'Password reset successfully.', token, user: user.toJSON() });
});

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
