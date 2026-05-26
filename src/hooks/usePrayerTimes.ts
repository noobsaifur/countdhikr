import { useState, useEffect, useCallback, useRef } from 'react';
import { SelectedCountry, AZAN_SOUNDS } from '@/types/dhikr';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerTimesState {
  times: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  location: string | null;
  date: string | null;
  nextPrayer: string | null;
  timeToNext: string | null;
  hijriDate: string | null;
  isLocationLocked: boolean;
  lastFetchTime: number | null;
}

interface AzanSettings {
  enabled: boolean;
  sound: boolean;
  vibrate: boolean;
  prayerNotifications: boolean;
  prayerMethod: number;
  customAzanUrl: string | null;
  selectedCountry: SelectedCountry | null;
  useAutoLocation: boolean;
}

const LOCATION_LOCK_DURATION = 5 * 60 * 60 * 1000; // 5 hours
const PRAYER_CHECK_INTERVAL = 60 * 1000; // 1 minute

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

const LOCATION_STORAGE_KEY = 'prayer-times-location-cache';

interface LocationCache {
  lat: number;
  lng: number;
  location: string;
  timestamp: number;
  isAuto: boolean;
}

export function usePrayerTimes(azanSettings?: AzanSettings) {
  const enabled = azanSettings?.enabled ?? false;
  const sound = azanSettings?.sound ?? false;
  const vibrate = azanSettings?.vibrate ?? false;
  const prayerMethod = azanSettings?.prayerMethod ?? 8;
  const customAzanUrl = azanSettings?.customAzanUrl ?? null;
  const selectedCountry = azanSettings?.selectedCountry ?? null;
  const selectedCountryCode = selectedCountry?.code ?? null;
  const selectedCountryLat = selectedCountry?.lat ?? null;
  const selectedCountryLng = selectedCountry?.lng ?? null;
  const selectedCountryName = selectedCountry?.name ?? null;
  const selectedCountryMethod = selectedCountry?.method ?? null;
  const useAutoLocation = azanSettings?.useAutoLocation ?? true;

  const [state, setState] = useState<PrayerTimesState>({
    times: null,
    loading: true,
    error: null,
    location: null,
    date: null,
    nextPrayer: null,
    timeToNext: null,
    hijriDate: null,
    isLocationLocked: false,
    lastFetchTime: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prayerCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastPlayedRef = useRef<string>('');

  // Get cached location
  const getCachedLocation = useCallback((): LocationCache | null => {
    try {
      const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  // Check if location is locked (within 5 hours)
  const isLocationLocked = useCallback((): boolean => {
    const cached = getCachedLocation();
    if (!cached) return false;
    if (cached.isAuto === false) return false; // Manual city selection is not an auto location lock!
    const now = Date.now();
    return now - cached.timestamp < LOCATION_LOCK_DURATION;
  }, [getCachedLocation]);

  // Get time until location unlocks
  const getTimeUntilUnlock = useCallback((): string | null => {
    const cached = getCachedLocation();
    if (!cached) return null;
    const now = Date.now();
    const elapsed = now - cached.timestamp;
    if (elapsed >= LOCATION_LOCK_DURATION) return null;

    const remaining = LOCATION_LOCK_DURATION - elapsed;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }, [getCachedLocation]);

  const fetchPrayerTimes = useCallback(async (latitude: number, longitude: number, method: number = 8, locationName?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();

      if (data.code === 200 && data.data) {
        const timings = data.data.timings;
        const meta = data.data.meta;
        const hijri = data.data.date.hijri;

        const times: PrayerTimes = {
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
        };

        // Get city name from reverse geocoding if not provided
        let finalLocationName = locationName || meta.timezone || 'Unknown';
        if (!locationName) {
          try {
            const geoResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              finalLocationName = geoData.city || geoData.locality || geoData.principalSubdivision || finalLocationName;
            }
          } catch {
            // Keep timezone as fallback
          }
        }

        // Cache the location
        const cache: LocationCache = {
          lat: latitude,
          lng: longitude,
          location: finalLocationName,
          timestamp: Date.now(),
          isAuto: useAutoLocation,
        };
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(cache));

        setState(prev => ({
          ...prev,
          times,
          loading: false,
          error: null,
          location: finalLocationName,
          date: data.data.date.readable,
          hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
          isLocationLocked: useAutoLocation, // Only lock for auto location
          lastFetchTime: Date.now(),
        }));

        if (useAutoLocation) {
          coordsRef.current = { lat: latitude, lng: longitude };
        }
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  const getLocation = useCallback((force: boolean = false) => {
    // If using selected country, use its coordinates
    if (selectedCountryCode && !useAutoLocation && selectedCountryLat !== null && selectedCountryLng !== null) {
      fetchPrayerTimes(
        selectedCountryLat, 
        selectedCountryLng, 
        prayerMethod !== null ? prayerMethod : (selectedCountryMethod ?? 8), 
        selectedCountryName || undefined
      );
      return;
    }

    // Check if location is locked and not forcing
    if (!force && isLocationLocked()) {
      const cached = getCachedLocation();
      if (cached) {
        setState(prev => ({ ...prev, isLocationLocked: true }));
        fetchPrayerTimes(cached.lat, cached.lng, prayerMethod ?? 8, cached.location);
        return;
      }
    }

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation not supported. Showing times for Mecca.',
      }));
      fetchPrayerTimes(21.4225, 39.8262, prayerMethod ?? 4, 'Mecca (Default)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchPrayerTimes(
          position.coords.latitude,
          position.coords.longitude,
          prayerMethod ?? 8
        );
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Set an error state to inform the UI, then fetch for Mecca
        setState(prev => ({
          ...prev,
          error: `Automatic location failed: ${error.message}. Showing times for Mecca.`,
        }));
        fetchPrayerTimes(21.4225, 39.8262, prayerMethod ?? 4, 'Mecca (Default)');
      }
    );
  }, [
    fetchPrayerTimes,
    prayerMethod,
    selectedCountryCode,
    selectedCountryLat,
    selectedCountryLng,
    selectedCountryName,
    selectedCountryMethod,
    useAutoLocation,
    isLocationLocked,
    getCachedLocation
  ]);

  // Force refresh - ignores the 5-hour lock
  const forceRefresh = useCallback(() => {
    // Clear the cache to allow fresh fetch
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setState(prev => ({ ...prev, isLocationLocked: false }));
    getLocation(true);
  }, [getLocation]);

  // Re-fetch when prayer method or country changes
  useEffect(() => {
    if (selectedCountryCode && !useAutoLocation && selectedCountryLat !== null && selectedCountryLng !== null) {
      fetchPrayerTimes(
        selectedCountryLat,
        selectedCountryLng,
        prayerMethod ?? (selectedCountryMethod ?? 8),
        selectedCountryName || undefined
      );
    } else if (useAutoLocation && coordsRef.current) {
      fetchPrayerTimes(
        coordsRef.current.lat,
        coordsRef.current.lng,
        prayerMethod ?? 8
      );
    }
  }, [
    prayerMethod,
    selectedCountryCode,
    selectedCountryLat,
    selectedCountryLng,
    selectedCountryName,
    selectedCountryMethod,
    fetchPrayerTimes
  ]);

  // Get next prayer based on current time
  const getNextPrayer = useCallback((times: PrayerTimes): { name: string; timeToNext: string } | null => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of PRAYER_ORDER) {
      const [h, m] = times[prayer].split(':').map(Number);
      const prayerMinutes = h * 60 + m;

      if (currentMinutes < prayerMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        const timeToNext = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        return { name: prayer, timeToNext };
      }
    }

    // After Isha, next prayer is Fajr (next day)
    const [fajrH, fajrM] = times.Fajr.split(':').map(Number);
    const fajrMinutes = fajrH * 60 + fajrM;
    const minutesToMidnight = 24 * 60 - currentMinutes;
    const totalMinutes = minutesToMidnight + fajrMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return { name: 'Fajr', timeToNext: `${hours}h ${mins}m` };
  }, []);

  // Get the azan URL to play
  const getAzanUrl = useCallback((): string => {
    if (customAzanUrl) {
      return customAzanUrl;
    }
    return AZAN_SOUNDS[0].url; // Default to Makkah
  }, [customAzanUrl]);

  // Play azan sound
  const playAzan = useCallback(() => {
    const url = getAzanUrl();
    if (!audioRef.current || audioRef.current.src !== url) {
      audioRef.current = new Audio(url);
    }
    audioRef.current.play().catch(console.error);
  }, [getAzanUrl]);

  // Check if it's time for azan
  const checkAzanTime = useCallback(() => {
    if (!state.times || !enabled) return;

    const now = new Date();
    const todayStr = now.toDateString();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (const prayer of PRAYER_ORDER) {
      if (prayer === 'Sunrise') continue;

      if (state.times[prayer] === currentTime) {
        const playKey = `${prayer}-${todayStr}-${currentTime}`;
        if (lastPlayedRef.current !== playKey) {
          lastPlayedRef.current = playKey;
          if (sound) {
            playAzan();
          }
        }
      }
    }
  }, [state.times, enabled, sound, playAzan]);

  // Update next prayer info
  useEffect(() => {
    if (!state.times) return;

    const updateNextPrayer = () => {
      const next = getNextPrayer(state.times!);
      if (next) {
        setState(prev => ({
          ...prev,
          nextPrayer: next.name,
          timeToNext: next.timeToNext,
        }));
      }
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [state.times, getNextPrayer]);

  // Initial fetch - respects the 5-hour lock
  useEffect(() => {
    getLocation(false);
  }, [getLocation]);

  // Azan check interval - check every 10 seconds to ensure we never miss a minute boundary
  useEffect(() => {
    if (!enabled) return;

    checkAzanTime();
    prayerCheckIntervalRef.current = setInterval(checkAzanTime, 10000); // Check every 10 seconds

    return () => {
      if (prayerCheckIntervalRef.current) {
        clearInterval(prayerCheckIntervalRef.current);
      }
    };
  }, [enabled, checkAzanTime]);

  // Silence Azan immediately if disabled or sound toggled off
  useEffect(() => {
    if (!enabled || !sound) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [enabled, sound]);

  return {
    ...state,
    refresh: () => getLocation(false),
    forceRefresh,
    getTimeUntilUnlock,
    isLocationLocked: isLocationLocked(),
  };
}
