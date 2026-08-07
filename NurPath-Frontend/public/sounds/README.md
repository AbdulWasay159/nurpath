# NurPath — Adhan Audio Files Needed

## Where to place audio files

Place the following `.wav` files in TWO locations:

### 1. For Android native alarms (critical):
```
android/app/src/main/res/raw/
  ├── fajr_adhan.wav       ← Fajr: includes "Assalātu Khayrum Minan-Nawm"
  ├── makkah_adhan.wav     ← Full Makkah Adhan (Hayya 'alas-Salāh)
  ├── madinah_adhan.wav    ← Madinah soft Adhan
  └── silent.wav           ← 1-second silent file (for "vibrate only" mode)
```

### 2. For web browser preview (optional but recommended):
```
public/sounds/
  ├── fajr_adhan.mp3
  ├── makkah_adhan.mp3
  ├── madinah_adhan.mp3
```

---

## Free authentic Adhan audio sources

Download from these trusted sources (royalty-free):
- https://www.islamicfinder.org/prayer-times/adhan-sounds/
- https://www.al-islam.org/
- Archive.org search: "Makkah Adhan"
- YouTube → download → convert to WAV via ffmpeg:
  `ffmpeg -i input.mp4 -ar 44100 -ac 2 -c:a pcm_s16le output.wav`

## Converting MP3 → WAV for Android (res/raw requires WAV)
```bash
ffmpeg -i makkah_adhan.mp3 -ar 44100 -ac 2 -c:a pcm_s16le makkah_adhan.wav
ffmpeg -i fajr_adhan.mp3 -ar 44100 -ac 2 -c:a pcm_s16le fajr_adhan.wav
ffmpeg -i madinah_adhan.mp3 -ar 44100 -ac 2 -c:a pcm_s16le madinah_adhan.wav
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 silent.wav
```

## Important Android Notes
- Android `res/raw/` filenames MUST be lowercase with underscores only (no spaces, no dashes).
- Files are registered to the `nurpath_adhan` notification channel which is configured in `capacitor.config.json`.
- The channel is created at first app launch — if it was already created with a different sound, the user must manually go to Android Settings → App → Notifications → NurPath Adhan Reminders → Sound to change it. This is an Android OS limitation.

## After placing audio files, rebuild:
```bash
cd NurPath-Frontend
npm run build
npx cap sync android
npx cap open android
# Then in Android Studio: Build → Generate Signed APK
```
