import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { MapPin, RefreshCw, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

// ── Kaaba coordinates ────────────────────────────────────────────────────────
const KAABA = { lat: 21.4225, lng: 39.8262 };

/**
 * Calculate the bearing (degrees from North, clockwise) from a point to the Kaaba.
 * Uses the great-circle / forward-azimuth formula.
 */
function calcQiblaBearing(lat, lng) {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lng - lng) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360; // 0–360°
}

/** Great-circle distance in km */
function calcDistance(lat, lng) {
  const R = 6371;
  const dLat = ((KAABA.lat - lat) * Math.PI) / 180;
  const dLng = ((KAABA.lng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  return km >= 1000
    ? `${(km / 1000).toFixed(1)}k km`
    : `${Math.round(km)} km`;
}

// ── Compass SVG ──────────────────────────────────────────────────────────────
function CompassDial({ needleDeg, aligned }) {
  // needleDeg: how many degrees to rotate the NEEDLE clockwise from 12 o'clock
  // i.e. the compass rose stays fixed, needle points toward Qibla.
  const SIZE = 280;
  const C = SIZE / 2;
  const R = C - 4;

  // Tick marks
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5); // every 5°
  const cardinals = [
    { deg: 0,   label: 'N' },
    { deg: 90,  label: 'E' },
    { deg: 180, label: 'S' },
    { deg: 270, label: 'W' },
  ];

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      style={{ overflow: 'visible' }}>

      {/* ── Outer ring ── */}
      <circle cx={C} cy={C} r={R}
        fill="none"
        stroke={aligned ? 'rgba(34,197,94,0.35)' : 'rgba(201,168,76,0.2)'}
        strokeWidth="1.5" />

      {/* ── Inner fill ── */}
      <circle cx={C} cy={C} r={R - 2}
        fill="rgba(15,22,32,0.95)" />

      {/* ── Glow ring when aligned ── */}
      {aligned && (
        <circle cx={C} cy={C} r={R}
          fill="none"
          stroke="rgba(34,197,94,0.5)"
          strokeWidth="3"
          style={{ filter: 'blur(4px)' }} />
      )}

      {/* ── Tick marks ── */}
      {ticks.map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const isMajor = deg % 45 === 0;
        const tickLen = isMajor ? 12 : 6;
        const x1 = C + (R - 2) * Math.cos(rad);
        const y1 = C + (R - 2) * Math.sin(rad);
        const x2 = C + (R - 2 - tickLen) * Math.cos(rad);
        const y2 = C + (R - 2 - tickLen) * Math.sin(rad);
        return (
          <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isMajor ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.12)'}
            strokeWidth={isMajor ? 1.5 : 0.8} />
        );
      })}

      {/* ── Cardinal labels ── */}
      {cardinals.map(({ deg, label }) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const dist = R - 26;
        const x = C + dist * Math.cos(rad);
        const y = C + dist * Math.sin(rad) + 5;
        return (
          <text key={label} x={x} y={y}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="DM Sans, sans-serif"
            fill={deg === 0 ? '#EF4444' : 'rgba(255,255,255,0.45)'}>
            {label}
          </text>
        );
      })}

      {/* ── Degree markings every 30° ── */}
      {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const dist = R - 26;
        const x = C + dist * Math.cos(rad);
        const y = C + dist * Math.sin(rad) + 4.5;
        return (
          <text key={deg} x={x} y={y}
            textAnchor="middle"
            fontSize="8"
            fontFamily="DM Sans, sans-serif"
            fill="rgba(255,255,255,0.2)">
            {deg}
          </text>
        );
      })}

      {/* ── Rotating needle group ── */}
      <g style={{
        transformOrigin: `${C}px ${C}px`,
        transform: `rotate(${needleDeg}deg)`,
        transition: 'transform 0.25s ease-out',
      }}>
        {/* Kaaba end (gold, points toward Qibla) */}
        <polygon
          points={`${C},${C - R + 36} ${C - 9},${C + 22} ${C},${C + 10} ${C + 9},${C + 22}`}
          fill={aligned ? '#22C55E' : '#C9A84C'}
          style={{ filter: aligned ? 'drop-shadow(0 0 6px #22C55E)' : 'drop-shadow(0 0 8px #C9A84C88)', transition: 'fill 0.4s' }}
        />
        {/* Opposite end (dim grey) */}
        <polygon
          points={`${C},${C + R - 36} ${C - 7},${C - 18} ${C},${C - 6} ${C + 7},${C - 18}`}
          fill="rgba(255,255,255,0.15)"
        />
        {/* Kaaba icon at tip */}
        <text x={C} y={C - R + 56}
          textAnchor="middle"
          fontSize="16"
          style={{ userSelect: 'none' }}>
          🕋
        </text>
        {/* Centre dot */}
        <circle cx={C} cy={C} r={5}
          fill={aligned ? '#22C55E' : '#C9A84C'}
          style={{ transition: 'fill 0.4s' }} />
      </g>
    </svg>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function QiblaPage() {
  const [coords, setCoords]         = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locError, setLocError]     = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  // Bearing from current location toward Kaaba (0–360, from North)
  const [qiblaBearing, setQiblaBearing] = useState(null);
  // Distance to Kaaba in km
  const [distance, setDistance]     = useState(null);

  // Compass heading from device (degrees the device top is pointing from North)
  const [heading, setHeading]       = useState(null);
  const [compassSupported, setCompassSupported] = useState(true);
  const [compassError, setCompassError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [needsPermissionTap, setNeedsPermissionTap] = useState(false);

  // How many degrees to rotate the needle in the SVG
  // needle = qiblaBearing - heading  (so needle points at Qibla regardless of how device is rotated)
  const needleDeg = heading !== null && qiblaBearing !== null
    ? ((qiblaBearing - heading + 360) % 360)
    : qiblaBearing ?? 0;

  // "Aligned" = needle is within ±5° of 0 (straight up) — device is facing Qibla
  const aligned = heading !== null && Math.abs(((needleDeg + 180) % 360) - 180) < 5;

  // ── Step 1: get geolocation ──────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    setLocLoading(true);
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLocationName('Your Location');
        setQiblaBearing(calcQiblaBearing(lat, lng));
        setDistance(calcDistance(lat, lng));
        setLocLoading(false);
      },
      (err) => {
        // Fallback to Hyderabad
        const lat = 17.3850, lng = 78.4867;
        setCoords({ lat, lng });
        setLocationName('Hyderabad (default)');
        setQiblaBearing(calcQiblaBearing(lat, lng));
        setDistance(calcDistance(lat, lng));
        setLocError('Location access denied — showing Hyderabad as default.');
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  // ── Step 2: device orientation (compass) ────────────────────────────────
  const startCompass = useCallback(() => {
    const handleOrientation = (e) => {
      // webkitCompassHeading: iOS Safari — degrees from North, clockwise
      // alpha on Android: degrees the device has rotated counter-clockwise from North
      if (e.webkitCompassHeading !== undefined) {
        setHeading(e.webkitCompassHeading);
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Convert: heading = (360 - alpha) % 360
        setHeading((360 - e.alpha) % 360);
      } else {
        setCompassError('Compass data unavailable on this device.');
        setCompassSupported(false);
      }
    };

    if (typeof DeviceOrientationEvent === 'undefined') {
      setCompassSupported(false);
      setCompassError('DeviceOrientation API not available on this device.');
      return;
    }

    // iOS 13+ requires explicit permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            setPermissionGranted(true);
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setCompassError('Compass permission denied. Direction shown from North.');
          }
        })
        .catch(() => {
          setCompassError('Could not request compass permission.');
        });
    } else {
      // Android / non-iOS: no permission needed
      setPermissionGranted(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  useEffect(() => {
    // iOS 13+ can only call requestPermission from a user gesture,
    // so we detect whether we need a tap first.
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      setNeedsPermissionTap(true);
    } else {
      const cleanup = startCompass();
      return cleanup;
    }
  }, [startCompass]);

  const handlePermissionTap = () => {
    setNeedsPermissionTap(false);
    startCompass();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="font-amiri text-sm mb-1" style={{ color: '#7A6130', direction: 'rtl' }}>
          اتِّجَاهُ الْقِبْلَةِ
        </p>
        <h1 className="font-amiri text-4xl" style={{ color: '#C9A84C' }}>Qibla Finder</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA8' }}>
          Hold your device flat and face the direction shown by the gold needle.
        </p>
      </div>

      {/* Location status */}
      <div className="rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3"
        style={{
          background: locError ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${locError ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
        }}>
        <MapPin size={15} style={{ color: locError ? '#EF4444' : '#C9A84C', flexShrink: 0 }} />
        <span className="text-sm flex-1" style={{ color: locError ? '#EF4444' : '#7A8FA8' }}>
          {locLoading ? 'Detecting your location…' : locError || locationName}
        </span>
        {!locLoading && (
          <button onClick={requestLocation}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            style={{ color: '#3A4A60' }} title="Retry location">
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      {/* Main compass card */}
      <div className="rounded-3xl p-6 mb-6 flex flex-col items-center"
        style={{
          background: 'rgba(15,22,32,0.8)',
          border: `1px solid ${aligned ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.15)'}`,
          transition: 'border-color 0.4s',
        }}>

        {/* iOS permission tap prompt */}
        {needsPermissionTap && (
          <div className="mb-6 w-full rounded-2xl p-4 text-center"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-sm mb-3" style={{ color: '#C9A84C' }}>
              🧭 Tap below to enable the compass on your device.
            </p>
            <button onClick={handlePermissionTap}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95"
              style={{
                background: 'rgba(201,168,76,0.15)',
                border: '1px solid rgba(201,168,76,0.35)',
                color: '#C9A84C',
              }}>
              Enable Compass
            </button>
          </div>
        )}

        {/* Compass dial */}
        {locLoading
          ? (
            <div className="w-[280px] h-[280px] rounded-full flex items-center justify-center"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(15,22,32,0.9)' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}>
                <RefreshCw size={28} style={{ color: '#C9A84C' }} />
              </motion.div>
            </div>
          )
          : <CompassDial needleDeg={needleDeg} aligned={aligned} />
        }

        {/* Aligned banner */}
        <AnimatePresence>
          {aligned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-4 px-5 py-2.5 rounded-xl flex items-center gap-2"
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
              }}>
              <CheckCircle2 size={15} style={{ color: '#22C55E' }} />
              <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                Facing the Qibla — Allahu Akbar!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bearing + distance info */}
        {!locLoading && qiblaBearing !== null && (
          <div className="mt-5 grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
              <p className="text-xs mb-1" style={{ color: '#7A8FA8' }}>Qibla bearing</p>
              <p className="text-xl font-bold" style={{ color: '#C9A84C' }}>
                {Math.round(qiblaBearing)}°
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#3A4A60' }}>from North</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
              <p className="text-xs mb-1" style={{ color: '#7A8FA8' }}>Distance</p>
              <p className="text-xl font-bold" style={{ color: '#C9A84C' }}>
                {formatDistance(distance)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#3A4A60' }}>to Kaaba</p>
            </div>
          </div>
        )}

        {/* Compass heading display */}
        {heading !== null && (
          <p className="mt-4 text-xs" style={{ color: '#3A4A60' }}>
            <Navigation size={11} className="inline mr-1" />
            Device heading: {Math.round(heading)}° from North
          </p>
        )}
      </div>

      {/* Compass error / no-compass notice */}
      {compassError && (
        <div className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <AlertCircle size={15} style={{ color: '#F97316', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#F97316' }}>
              Compass unavailable
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#7A8FA8' }}>
              {compassError} The needle above shows the correct Qibla direction from North — use it with a physical compass to find the direction.
            </p>
          </div>
        </div>
      )}

      {/* How to use */}
      <div className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: '#EDE8D8' }}>How to use</p>
        <div className="space-y-2.5">
          {[
            ['📱', 'Hold your phone flat (screen facing up).'],
            ['🧭', 'Allow location & compass access when prompted.'],
            ['🕋', 'Slowly turn your body until the gold needle points straight up.'],
            ['✅', 'When the needle is at 12 o\'clock you are facing the Qibla.'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">{icon}</span>
              <p className="text-sm" style={{ color: '#7A8FA8' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 text-center">
        <p className="font-amiri text-base mb-1" style={{ color: '#7A6130' }}>
          وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
        </p>
        <p className="text-xs" style={{ color: '#3A4A60' }}>Al-Baqarah 2:150</p>
      </div>
    </AppLayout>
  );
}
