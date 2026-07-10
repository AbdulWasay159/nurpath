import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PRAYER_META = {
  fajr:    { icon: '🌙', label: 'Fajr',    arabic: 'الفجر',  apiKey: 'Fajr' },
  sunrise: { icon: '🌄', label: 'Sunrise', arabic: 'شروق',   apiKey: 'Sunrise' },
  dhuhr:   { icon: '☀️', label: 'Dhuhr',   arabic: 'الظهر',  apiKey: 'Dhuhr' },
  asr:     { icon: '🌤️', label: 'Asr',     arabic: 'العصر',  apiKey: 'Asr' },
  maghrib: { icon: '🌅', label: 'Maghrib', arabic: 'المغرب', apiKey: 'Maghrib' },
  isha:    { icon: '🌙', label: 'Isha',    arabic: 'العشاء', apiKey: 'Isha' },
};

const DISPLAY_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const CALC_METHODS = [
  { id: 17, label: 'Ahle Hadees',           region: 'Pakistan · India (Ahle Hadees)' },
  { id: 1,  label: 'Karachi (Hanafi)',       region: 'Pakistan · India · Bangladesh' },
  { id: 2,  label: 'ISNA',                  region: 'North America' },
  { id: 3,  label: 'Muslim World League',   region: 'Europe · Far East' },
  { id: 4,  label: 'Makkah (Umm al-Qura)', region: 'Arabian Peninsula' },
  { id: 5,  label: 'Egyptian',              region: 'Africa · Syria · Iraq' },
  { id: 8,  label: 'Gulf Region',           region: 'Gulf countries' },
  { id: 11, label: 'Singapore',             region: 'Singapore · Malaysia · Indonesia' },
  { id: 13, label: 'Turkey',                region: 'Turkey' },
  { id: 15, label: 'Moonsighting (UK)',      region: 'UK · Ireland' },
  { id: 16, label: 'Dubai',                 region: 'UAE' },
];

const fmt12 = (t) => {
  if (!t) return '—';
  try {
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
  } catch { return t; }
};

// ── Prayer Times Tab ──────────────────────────────────────────────────────
function PrayerTimesSection() {
  const [times, setTimes]                 = useState(null);
  const [hijri, setHijri]                 = useState(null);
  const [cityLabel, setCityLabel]         = useState('');
  const [inputCity, setInputCity]         = useState('');
  const [method, setMethod]               = useState(() => {
    // Restore previously chosen calculation method (persisted across sessions)
    if (typeof window !== 'undefined') {
      const saved = parseInt(localStorage.getItem('nurpath_calc_method'));
      if (!isNaN(saved)) return saved;
    }
    return 17; // Ahle Hadees default
  });
  const [loading, setLoading]             = useState(false);
  const [locLoading, setLocLoading]       = useState(false);
  const [error, setError]                 = useState('');
  const [coordsCache, setCoordsCache]     = useState(null);
  const [nextPrayer, setNextPrayer]       = useState(null);
  const [countdown, setCountdown]         = useState('');

  // ── Figure out next prayer from current times ──
  const computeNext = useCallback((t) => {
    if (!t) return;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const prayerList = PRAYER_NAMES.map((name) => {
      const raw = t[PRAYER_META[name].apiKey] || '';
      if (!raw) return null;
      const [h, m] = raw.split(':').map(Number);
      return { name, label: PRAYER_META[name].label, arabic: PRAYER_META[name].arabic, totalMins: h * 60 + m, raw };
    }).filter(Boolean);

    const upcoming = prayerList.filter((p) => p.totalMins > nowMins);
    const next = upcoming[0] || prayerList[0]; // wrap to fajr if past isha
    setNextPrayer(next);
  }, []);

  // ── Live countdown ticker ──
  useEffect(() => {
    if (!nextPrayer) return;
    const tick = () => {
      const now = new Date();
      const [h, m] = nextPrayer.raw.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1); // next day
      const diffSec = Math.max(0, Math.floor((target - now) / 1000));
      const hh = Math.floor(diffSec / 3600);
      const mm = Math.floor((diffSec % 3600) / 60);
      const ss = diffSec % 60;
      if (hh > 0) setCountdown(`${hh}h ${mm}m`);
      else setCountdown(`${mm}:${String(ss).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextPrayer]);

  // ── Fetch by coords ──
  const fetchByCoords = useCallback(async (lat, lng, calcMethod) => {
    setLoading(true); setError('');
    try {
      const today = format(new Date(), 'dd-MM-yyyy');
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${today}?latitude=${lat}&longitude=${lng}&method=${calcMethod}`
      );
      const data = await res.json();
      if (data.code === 200) {
        setTimes(data.data.timings);
        setHijri(data.data.date.hijri);
        computeNext(data.data.timings);
      } else { setError('Could not fetch prayer times.'); }
    } catch { setError('Network error — check your connection.'); }
    finally { setLoading(false); }
  }, [computeNext]);

  // ── Fetch by city name ──
  const fetchByCity = useCallback(async (cityName, calcMethod) => {
    if (!cityName.trim()) return;
    setLoading(true); setError(''); setCoordsCache(null);
    try {
      const today = format(new Date(), 'dd-MM-yyyy');
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${today}?city=${encodeURIComponent(cityName)}&country=&method=${calcMethod}`
      );
      const data = await res.json();
      if (data.code === 200) {
        setTimes(data.data.timings);
        setHijri(data.data.date.hijri);
        setCityLabel(cityName);
        computeNext(data.data.timings);
      } else { setError('City not found. Try "Hyderabad" or "London, UK".'); }
    } catch { setError('Network error — check your connection.'); }
    finally { setLoading(false); }
  }, [computeNext]);

  // ── Detect location ──
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return; }
    setLocLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoordsCache({ lat, lng });
        setCityLabel('Your Location');
        setLocLoading(false);
        fetchByCoords(lat, lng, method);
      },
      () => {
        setLocLoading(false);
        setError('Location denied — enter your city below.');
      },
      { timeout: 8000 }
    );
  }, [method, fetchByCoords]);

  // ── Auto-detect on mount ──
  useEffect(() => { detectLocation(); }, []);

  // ── Re-fetch when method changes + persist preference ──
  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    localStorage.setItem('nurpath_calc_method', String(newMethod));
    if (coordsCache) fetchByCoords(coordsCache.lat, coordsCache.lng, newMethod);
    else if (inputCity.trim()) fetchByCity(inputCity, newMethod);
  };

  const busy = loading || locLoading;
  const methodLabel = CALC_METHODS.find((m) => m.id === method)?.label || '';

  return (
    <div>
      {/* ── Location row ── */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <button onClick={detectLocation} disabled={busy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition shrink-0 disabled:opacity-50"
          style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', color: '#2DD4BF' }}>
          {locLoading ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
          {locLoading ? 'Detecting...' : 'My Location'}
        </button>

        <input
          type="text"
          placeholder='City — "Hyderabad" or "London, UK"'
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm border border-gray-700 focus:border-yellow-600 focus:outline-none text-white placeholder-gray-600 transition"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchByCity(inputCity, method)}
        />

        <button onClick={() => fetchByCity(inputCity, method)} disabled={busy}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 shrink-0"
          style={{ background: '#C9A84C', color: '#1A1000' }}>
          Search
        </button>
      </div>

      {/* ── Method selector ── */}
      <div className="rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Calculation Method
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)' }}>
            {methodLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CALC_METHODS.map((m) => (
            <button key={m.id} onClick={() => handleMethodChange(m.id)} title={m.region}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition"
              style={{
                background: method === m.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${method === m.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: method === m.id ? '#C9A84C' : '#7A8FA8',
              }}>
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          💡 Hover any method to see its region · For South Asia use <strong style={{ color: 'var(--gold)' }}>Ahle Hadees</strong> or <strong style={{ color: 'var(--gold)' }}>Karachi (Hanafi)</strong>
        </p>
      </div>

      {error && (
        <p className="text-sm mb-4 px-1" style={{ color: '#EF4444' }}>⚠ {error}</p>
      )}

      {/* ── Location + Hijri ── */}
      {cityLabel && !busy && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={13} style={{ color: 'var(--gold)' }} />
            {cityLabel}
          </p>
          {hijri && (
            <p className="font-amiri text-sm" style={{ color: 'var(--gold)' }}>
              {hijri.day} {hijri.month.en} {hijri.year} AH
            </p>
          )}
        </div>
      )}

      {/* ── Next prayer countdown ── */}
      {nextPrayer && countdown && !busy && (
        <div className="rounded-2xl p-5 mb-6 flex items-center justify-between"
          style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--gold-dim)' }}>Next Prayer</p>
            <p className="text-xl font-semibold" style={{ color: 'var(--gold)' }}>
              {nextPrayer.label}
              <span className="font-amiri text-base ml-2" style={{ color: 'var(--gold-dim)' }}>{nextPrayer.arabic}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--gold-dim)' }}>In</p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--gold)' }}>{countdown}</p>
          </div>
        </div>
      )}

      {/* ── Skeleton ── */}
      {busy && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      )}

      {/* ── Prayer cards ── */}
      {!busy && times && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {DISPLAY_ORDER.map((name) => {
              const meta  = PRAYER_META[name];
              const raw   = times[meta.apiKey] || '';
              const isNext = nextPrayer?.name === name;
              const isSunrise = name === 'sunrise';
              return (
                <div key={name} className="rounded-2xl p-4 text-center transition"
                  style={{
                    background: isNext ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isNext ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <span className="block text-2xl mb-2">{meta.icon}</span>
                  <span className="block text-xs font-semibold mb-1"
                    style={{ color: isNext ? '#C9A84C' : '#EDE8D8' }}>
                    {meta.label}
                  </span>
                  <span className="block font-amiri text-xs mb-3" style={{ color: 'var(--gold-dim)' }}>
                    {meta.arabic}
                  </span>
                  <span className="block text-sm font-bold"
                    style={{ color: isNext ? '#C9A84C' : isSunrise ? '#F59E0B' : '#2DD4BF' }}>
                    {fmt12(raw)}
                  </span>
                  {isNext && (
                    <span className="block text-xs mt-2 font-semibold" style={{ color: 'var(--gold)' }}>
                      Next ▸
                    </span>
                  )}
                  {isSunrise && (
                    <span className="block text-xs mt-1" style={{ color: 'var(--text-muted)' }}>no salah</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Powered by AlAdhan API · Method: {methodLabel}
          </p>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PrayersPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1"
          style={{ color: 'var(--gold-dim)', direction: 'rtl' }}>أَقِمِ الصَّلَاةَ</p>
        <h1 className="font-amiri text-4xl" style={{ color: 'var(--gold)' }}>Prayers</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Prayer times for your location.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <PrayerTimesSection />
      </motion.div>
    </AppLayout>
  );
}
