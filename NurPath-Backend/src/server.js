const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// ── Default env var fallbacks for seamless startup ──
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'nurpath-secret-key-2026-authentic';
if (!process.env.MONGO_URI) process.env.MONGO_URI = 'memory';

// ── Security packages ──
let helmet, rateLimit, mongoSanitize;
try { helmet        = require('helmet'); } catch {}
try { rateLimit     = require('express-rate-limit'); } catch {}
try { mongoSanitize = require('express-mongo-sanitize'); } catch {}

const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const prayerRoutes       = require('./routes/prayer.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes        = require('./routes/admin.routes');
const adhkarRoutes       = require('./routes/adhkar.routes');
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/adhkar',        adhkarRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── 404 ──
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── Global error handler ──
app.use(errorHandler);

// ── Connect DB then start server ──
// Set MONGO_URI=memory in .env to spin up a throwaway in-memory MongoDB —
// useful for trying the app locally without setting up a real database.
// Data does not persist across restarts in this mode.
async function start() {
  let mongoUri = process.env.MONGO_URI;

  if (mongoUri === 'memory') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    mongoUri = mem.getUri();
    console.log('🧪 Using in-memory MongoDB (data will not persist across restarts)');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 NurPath API running on port ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
