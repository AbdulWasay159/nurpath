import { useState, useEffect, useCallback } from 'react';
import {
  calculatePrayerTimes,
  getNextPrayer,
  getIslamicGreeting,
  getCurrentPrayerHadith,
  formatPrayerTime,
} from '../lib/prayerTimes';
import { gregorianToHijri, getIslamicOccasion } from '../lib/hijri';

// Default: Hyderabad, India — used if geolocation denied
const DEFAULT_COORDS = { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' };

export function usePrayerTimes() {
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [times, setTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [greeting, setGreeting] = useState(null);
  const [hadith, setHadith] = useState(null);
  const [hijri, setHijri] = useState(null);
  const [islamicOccasion, setIslamicOccasion] = useState(null);
  const [now, setNow] = useState(new Date());
  const [locationLoading, setLocationLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  // Tick every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get geolocation once
  useEffect(() => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      useDefault();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationName('Your Location');
        setLocationLoading(false);
      },
      () => {
        useDefault();
      },
      { timeout: 8000 }
    );
  }, []);

  function useDefault() {
    setCoords(DEFAULT_COORDS);
    setLocationName(DEFAULT_COORDS.city);
    setLocationLoading(false);
  }

  // Recalculate prayer times whenever coords or date changes
  useEffect(() => {
    if (!coords) return;

    const today = new Date();
    const fetchTimes = async () => {
      try {
        const todayStr = today.toLocaleDateString('en-GB').split('/').join('-');

        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${todayStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=17`
        );

        const data = await res.json();

        if (data.code === 200) {
          const hijriData = data.data.date.hijri;

          const realHijri = {
            day: hijriData.day,
            month: hijriData.month.number,
            year: hijriData.year,
            monthName: hijriData.month.en,
            monthNameAr: hijriData.month.ar,
            formatted: `${hijriData.day} ${hijriData.month.en} ${hijriData.year} AH`,
            formattedAr: `${hijriData.day} ${hijriData.month.ar} ${hijriData.year} هـ`,
            formattedShort: `${hijriData.day} ${hijriData.month.en}`,
          };

          setHijri(realHijri);
          setIslamicOccasion(getIslamicOccasion(realHijri));
          
          setTimes({
            fajr: new Date(`${today.toDateString()} ${data.data.timings.Fajr}`),
            sunrise: new Date(`${today.toDateString()} ${data.data.timings.Sunrise}`),
            dhuhr: new Date(`${today.toDateString()} ${data.data.timings.Dhuhr}`),
            asr: new Date(`${today.toDateString()} ${data.data.timings.Asr}`),
            maghrib: new Date(`${today.toDateString()} ${data.data.timings.Maghrib}`),
            isha: new Date(`${today.toDateString()} ${data.data.timings.Isha}`),
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTimes();

    // Hijri

  }, [coords]);

  // Update live values every second
  useEffect(() => {
    if (!times) return;

    const next = getNextPrayer(times, now);
    setNextPrayer(next);
    setGreeting(getIslamicGreeting(times, now));
    setHadith(getCurrentPrayerHadith(times, now));

    // Countdown string
    if (next && next.minutesLeft !== null) {
      const h = Math.floor(next.minutesLeft / 60);
      const m = next.minutesLeft % 60;
      const s = Math.floor((next.minutesLeft * 60 - Math.floor(next.minutesLeft) * 60));
      // Live seconds countdown
      if (next.minutesLeft < 60) {
        const totalSec = Math.round((next.time - now) / 1000);
        const mm = Math.floor(totalSec / 60);
        const ss = totalSec % 60;
        setCountdown(`${mm}:${String(ss).padStart(2, '0')}`);
      } else {
        setCountdown(`${h}h ${m}m`);
      }
    } else {
      setCountdown('');
    }
  }, [times, now]);

  const formattedTimes = times
    ? {
      fajr: formatPrayerTime(times.fajr),
      sunrise: formatPrayerTime(times.sunrise),
      dhuhr: formatPrayerTime(times.dhuhr),
      asr: formatPrayerTime(times.asr),
      maghrib: formatPrayerTime(times.maghrib),
      isha: formatPrayerTime(times.isha),
    }
    : null;

  return {
    times,
    formattedTimes,
    nextPrayer,
    greeting,
    hadith,
    hijri,
    islamicOccasion,
    locationName,
    locationLoading,
    countdown,
    now,
  };
}
