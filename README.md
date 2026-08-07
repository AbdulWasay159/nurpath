# NurPath — Salah & Adhkar Tracker

A focused, dark-mode-only Islamic companion for tracking your daily Salah and Adhkar.
**Node.js/Express** backend · **Next.js 14 / React** frontend.

This build is deliberately scoped down to one job: help someone track their five daily
prayers, Sunnah prayers, and Qada, keep up with morning/evening Adhkar, find the Qibla,
and see their history and stats. Quran, Hadith, 99 Names of Allah, Masjid listings, and
Events are separate apps/sites (not part of this codebase) sharing this same backend.

---

## Quick Start

### Backend

```bash
cd NurPath-Backend
npm install
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm run dev                 # → http://localhost:5000
```

**No MongoDB set up yet?** Set `MONGO_URI=memory` in `.env` instead of a real
connection string. This spins up a throwaway in-memory MongoDB automatically —
no install, no account, no config. The first run needs internet access to
download the `mongod` binary once (~80MB, then cached); after that it's instant.
Data does not persist across server restarts in this mode.

**Seed the database** (run once after first install):

```bash
npm run seed          # admin user
npm run seed:adhkar   # morning & evening adhkar
```

Admin login: `admin@nurpath.app` / `Admin@123`

### Frontend

```bash
cd NurPath-Frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev                 # → http://localhost:3000
```

---

## What's in this Build

### Backend (`NurPath-Backend/`)

| Layer | Files |
|---|---|
| **Models** | User, PrayerTracking, Adhkar, Notification |
| **Controllers** | auth, user, admin, prayer, adhkar, notification |
| **Routes** | `/api/auth`, `/api/users`, `/api/prayers`, `/api/adhkar`, `/api/notifications`, `/api/admin` |
| **Utils** | seed, seed-adhkar, email |

### Frontend (`NurPath-Frontend/`)

| Area | Files |
|---|---|
| **Pages** | dashboard, prayers, adhkar, qibla, history, stats, admin, profile, notifications, auth pages (login/register/forgot/reset password) |
| **Components** | Navbar, AppLayout, ErrorBoundary, PWAInstallPrompt, PrayerComponents, AzkarModal, UI primitives |
| **Context** | AuthContext |
| **Lib** | adhkar-enhanced, azkar, api, prayerTimes, hijri, nativeBridge, reminderStorage, serviceWorkerRegister |
| **PWA** | service-worker.js, manifest.json, offline.html |

Dark mode is the only theme — there is no light mode or theme toggle.

**Adhkar page** has three tabs: Morning, Evening, and **After Namaz**. The After Namaz
tab holds the same dhikr recited post-Salah (sourced from `azkar.js`, shared with the
post-prayer popup) so it's always available to mark off by hand — useful for prayers
logged outside their live window (e.g. Fajr after sunrise, or Qaḍā), when the automatic
popup won't appear.

**Post-Salah popup** (`AzkarModal`, triggered from the dashboard) only fires when a
prayer is marked "done" during that prayer's own time window — not for late/Qaḍā
entries. This is intentional, not a bug: the After Namaz tab exists precisely to cover
the cases the popup skips.

### Native / Mobile Wrapper

The frontend is also wrapped as a native app via **Capacitor** (`capacitor.config.json`),
giving it real device alarms and local notifications for Adhan/Salah reminders instead of
relying on browser-only timers:

- `src/lib/nativeBridge.js` — abstraction over Capacitor APIs (geolocation, local
  notification scheduling) with automatic browser fallbacks when not running natively.
- `src/lib/reminderStorage.js` — stores custom prayer-time overrides, pre-prayer reminder
  settings, and Adhan sound choice; schedules native alarms through `nativeBridge`.
- `npm run cap:sync` — builds the Next.js app and syncs it into the native project.
- `npm run cap:android` — opens the Android project in Android Studio.

---

## Environment Variables

**`NurPath-Backend/.env`**

| Variable | Required | Default |
|---|---|---|
| `MONGO_URI` | ✅ | — |
| `JWT_SECRET` | ✅ | — |
| `PORT` | No | 5000 |
| `JWT_EXPIRES_IN` | No | 7d |
| `NODE_ENV` | No | development |
| `FRONTEND_URL` | No | http://localhost:3000 |
| `RESEND_API_KEY` | No | — (email/password reset, via [Resend](https://resend.com)) |
| `EMAIL_FROM` | No | — (sender address for password reset emails) |

**`NurPath-Frontend/.env.local`**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL, including `/api` (default: http://localhost:5000/api) |

---

## What Was Removed From the Original Codebase

Quran Notes, Public Notes/Likes, 99 Names of Allah, Quran reader/search/audio,
Masjid listings, and Events were removed from this frontend and (where nothing else
needed them) from the backend, to keep this app focused on Salah + Adhkar tracking.
Light mode and the theme toggle were removed — the app is dark-only.

**Note on repo layout:** the top-level `backend/` and `docs/` folders in this repo are
leftovers from that earlier, unscoped version — `backend/` still has the old
Note/Quran models this build doesn't use, and `docs/` references routes
(`note.routes.js`, `quran.routes.js`) that no longer exist. **`NurPath-Backend/`** is
the real, current backend described above; ignore `backend/` and `docs/`.
