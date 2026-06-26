# Forgot Password Feature — Files to Replace

## How to apply
1. Unzip this into a scratch folder.
2. Copy each file over the matching path in your repo (same folder structure: `NurPath-Backend/...`, `NurPath-Frontend/...`).
3. In `NurPath-Backend`, run:
   ```
   npm install resend
   ```
4. Add to your **real** `NurPath-Backend/.env** (not the .env.example included here — that's just a reference):
   ```
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=NurPath <onboarding@resend.dev>
   ```
   Get a free API key at https://resend.com (no domain verification needed to start — `onboarding@resend.dev` works out of the box).

## Files included

### Backend (full replacements)
- `NurPath-Backend/package.json` — added `resend` dependency
- `NurPath-Backend/.env.example` — reference only, shows new vars needed
- `NurPath-Backend/src/models/User.model.js` — added reset token + lockout fields/methods
- `NurPath-Backend/src/controllers/auth.controller.js` — added `forgotPassword`, `resetPassword`, lockout logic in `login`
- `NurPath-Backend/src/routes/auth.routes.js` — added `/forgot-password` and `/reset-password/:token` routes
- `NurPath-Backend/src/server.js` — added a dedicated rate limiter for `/forgot-password` (3/hour)

### Backend (new file)
- `NurPath-Backend/src/utils/email.js` — Resend email sender for the reset link

### Frontend (full replacements)
- `NurPath-Frontend/src/context/AuthContext.jsx` — added `forgotPassword`, `resetPassword` methods
- `NurPath-Frontend/src/pages/login.jsx` — added "Forgot password?" link

### Frontend (new files)
- `NurPath-Frontend/src/pages/forgot-password.jsx` — email entry page (includes a honeypot anti-bot field)
- `NurPath-Frontend/src/pages/reset-password/[token].jsx` — new password entry page

## What this adds
- Forgot/reset password flow with 1-hour expiring, hashed tokens
- Email enumeration protection (same response whether the email exists or not)
- Rate limiting on the forgot-password endpoint (3/hour/IP)
- Honeypot field on the forgot-password form (free bot deterrent)
- Account lockout after 5 failed logins (15 min), auto-cleared on successful reset

## Not touched
- Your actual `.env` file (only `.env.example` is included as a reference)
- `change-password` flow (unchanged — still requires current password, for logged-in users)
- No email verification on signup, no "logout everywhere" — out of scope for this pass
