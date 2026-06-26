# Edit Past Prayer History — Files to Replace

## How to apply
Copy the 3 files over their matching paths in your repo. No new npm packages needed.

## Files included

### Backend (full replacements)
- `NurPath-Backend/src/controllers/prayer.controller.js`
  - NEW: `updatePastPrayerStatus` — handles `PUT /api/prayers/:date/:prayerName`
  - Rejects future dates, today, and anything older than 7 days
  - FIXED: `syncUserStats` longest-streak bug — old code computed `longest` inside the
    same backward walk as `current`, so it could never exceed `current`. Now does two
    separate passes: full ascending scan for all-time best, backward walk for current active.

- `NurPath-Backend/src/routes/prayer.routes.js`
  - NEW route: `PUT /:date/:prayerName` added AFTER `/today/:prayerName` (order matters
    so Express matches the specific /today/* route first)

### Frontend (full replacement)
- `NurPath-Frontend/src/pages/history.jsx`
  - Rows within the last 7 days (including today): tap-to-cycle interactive prayer cards
    in the expanded view, pencil indicator in row header
  - Rows older than 7 days: read-only cards with 🔒 lock explanation
  - Local state updates instantly from server response (completionRate + prayers array)
  - Errors revert to a full refetch so the UI stays accurate
  - Today routes to `/prayers/today/:prayerName`; past days route to `/prayers/:date/:prayerName`

## What was NOT changed
- Dashboard prayer tracking (`/today/:prayerName`) — untouched
- Stats page — streak numbers will now be more accurate due to the syncUserStats fix
- No new environment variables or npm packages needed
