const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// ── Security packages (install: npm i helmet express-rate-limit express-mongo-sanitize) ──
let helmet, rateLimit, mongoSanitize;
try { helmet        = require('helmet'); } catch {}
try { rateLimit     = require('express-rate-limit'); } catch {}
try { mongoSanitize = require('express-mongo-sanitize'); } catch {}

const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const prayerRoutes       = require('./routes/prayer.routes');
const eventRoutes        = require('./routes/event.routes');
const masjidRoutes       = require('./routes/masjid.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes        = require('./routes/admin.routes');
const { errorHandler }   = require('./middleware/error.middleware');

const app = express();

// ── Security headers ──
if (helmet) app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Body parsing (reduced limit) ──
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Sanitize MongoDB operators from req.body / query ──
if (mongoSanitize) app.use(mongoSanitize());

// ── Rate limiting ──
if (rateLimit) {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 15,
    message: { success: false, message: 'Too many attempts. Please wait 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests.' },
  });
  const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { success: false, message: 'Too many reset requests. Please wait an hour and try again.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth/login',           authLimiter);
  app.use('/api/auth/register',        authLimiter);
  app.use('/api/auth/forgot-password', forgotPasswordLimiter);
  app.use('/api/auth/reset-password',  authLimiter);
  app.use('/api/',                     globalLimiter);
}

// ── Logging (dev only) ──
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ──
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/prayers',       prayerRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/masjids',       masjidRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── 404 ──
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── Global error handler ──
app.use(errorHandler);

// ── Connect DB then start server ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 NurPath API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

module.exports = app;
