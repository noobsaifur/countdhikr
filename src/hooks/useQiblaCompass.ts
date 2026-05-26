import { useState, useEffect, useCallback, useRef } from 'react';

interface QiblaCompassState {
  qiblaDirection: number | null;
  compassHeading: number | null;
  userLocation: { lat: number; lng: number } | null;
  distanceToKaaba: number | null;
  isGyroscopeAvailable: boolean;
  isLocationAvailable: boolean;
  loading: boolean;
  error: string | null;
  accuracy: 'high' | 'medium' | 'low';
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
  isAlignedWithQibla: boolean;
}

// Kaaba coordinates in Mecca
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Calculate distance between two points using Haversine formula (in km)
function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth's radius in km
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const dLat = ((KAABA_LAT - userLat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - userLng) * Math.PI) / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

// Calculate Qibla direction from user's location
function calculateQiblaDirection(userLat: number, userLng: number): number {
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const lng1 = (userLng * Math.PI) / 180;
  const lng2 = (KAABA_LNG * Math.PI) / 180;

  const dLng = lng2 - lng1;

  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let qibla = Math.atan2(x, y);
  qibla = (qibla * 180) / Math.PI;
  qibla = (qibla + 360) % 360;

  return qibla;
}

export function useQiblaCompass() {
  const [state, setState] = useState<QiblaCompassState>({
    qiblaDirection: null,
    compassHeading: null,
    userLocation: null,
    distanceToKaaba: null,
    isGyroscopeAvailable: false,
    isLocationAvailable: false,
    loading: true,
    error: null,
    accuracy: 'low',
    permissionStatus: null,
    isAlignedWithQibla: false,
  });

  const watchId = useRef<number | null>(null);
  const orientationHandler = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const isAbsoluteRef = useRef<boolean>(false);

  // Check and request device orientation permission (iOS 13+)
  const requestOrientationPermission = useCallback(async (): Promise<boolean> => {
    // Check if DeviceOrientationEvent is available
    if (typeof DeviceOrientationEvent === 'undefined') {
      return false;
    }

    // iOS 13+ requires permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setState(prev => ({ ...prev, permissionStatus: permission }));
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting orientation permission:', error);
        return false;
      }
    }

    // Non-iOS or older iOS - permission not required
    return true;
  }, []);

  // Get user's geolocation
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
        isLocationAvailable: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };
        const qiblaDirection = calculateQiblaDirection(latitude, longitude);
        const distanceToKaaba = calculateDistanceToKaaba(latitude, longitude);
        
        let accuracyLevel: 'high' | 'medium' | 'low' = 'low';
        if (accuracy < 50) accuracyLevel = 'high';
        else if (accuracy < 200) accuracyLevel = 'medium';

        setState(prev => ({
          ...prev,
          userLocation,
          qiblaDirection,
          distanceToKaaba,
          isLocationAvailable: true,
          loading: false,
          accuracy: prev.isGyroscopeAvailable ? 'high' : accuracyLevel,
          error: null,
        }));
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          isLocationAvailable: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [state.isGyroscopeAvailable]);

  // Handle device orientation for compass
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;
    const isAbsoluteEvent = event.type === 'deviceorientationabsolute' || event.absolute === true;

    // If we have already started receiving absolute orientation events, ignore relative ones
    if (isAbsoluteRef.current && !isAbsoluteEvent) {
      return;
    }

    if (isAbsoluteEvent) {
      isAbsoluteRef.current = true;
    }

    // Check for iOS specific webkitCompassHeading
    if ((event as any).webkitCompassHeading !== undefined) {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android / Chrome: alpha is counter-clockwise rotation around Z-axis.
      // Compass heading is clockwise rotation from North.
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null) {
      setState(prev => ({
        ...prev,
        compassHeading: heading,
        isGyroscopeAvailable: true,
        accuracy: prev.isLocationAvailable ? 'high' : 'medium',
      }));
    }
  }, []);

  // Start compass orientation tracking
  const startCompass = useCallback(async () => {
    const hasPermission = await requestOrientationPermission();
    
    if (!hasPermission) {
      setState(prev => ({
        ...prev,
        isGyroscopeAvailable: false,
        error: 'Device orientation permission denied',
      }));
      return false;
    }

    // Store the handler reference for cleanup
    orientationHandler.current = handleOrientation;
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    // Also try deviceorientationabsolute for more accurate readings
    window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    
    return true;
  }, [requestOrientationPermission, handleOrientation]);

  // Stop compass tracking
  const stopCompass = useCallback(() => {
    if (orientationHandler.current) {
      window.removeEventListener('deviceorientation', orientationHandler.current, true);
      window.removeEventListener('deviceorientationabsolute', orientationHandler.current as any, true);
      orientationHandler.current = null;
    }
  }, []);

  // Initialize compass and location
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // First check if gyroscope/compass is available
    const hasGyro = typeof DeviceOrientationEvent !== 'undefined';
    
    if (hasGyro) {
      await startCompass();
    }
    
    // Always get location
    getLocation();
  }, [startCompass, getLocation]);

  // Calibrate - request fresh permissions and data
  const calibrate = useCallback(async () => {
    stopCompass();
    await initialize();
  }, [stopCompass, initialize]);

  // Calculate the rotation needed for the compass needle to point to Qibla
  const getQiblaRotation = useCallback((): number => {
    if (state.qiblaDirection === null) return 0;
    
    if (state.compassHeading !== null) {
      // With gyroscope: rotate based on device heading
      return state.qiblaDirection - state.compassHeading;
    }
    
    // Without gyroscope: just show the static qibla direction
    return state.qiblaDirection;
  }, [state.qiblaDirection, state.compassHeading]);

  // Check if aligned with Qibla (within ±5 degrees)
  const checkQiblaAlignment = useCallback((): boolean => {
    if (state.qiblaDirection === null || state.compassHeading === null) return false;
    
    const rotation = Math.abs((state.qiblaDirection - state.compassHeading + 360) % 360);
    // Check if within ±5 degrees (accounting for wrap-around at 360)
    return rotation <= 5 || rotation >= 355;
  }, [state.qiblaDirection, state.compassHeading]);

  // Update alignment state when compass heading changes
  useEffect(() => {
    const isAligned = checkQiblaAlignment();
    if (isAligned !== state.isAlignedWithQibla) {
      setState(prev => ({ ...prev, isAlignedWithQibla: isAligned }));
    }
  }, [state.compassHeading, checkQiblaAlignment, state.isAlignedWithQibla]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCompass();
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [stopCompass]);

  // Initialize on mount
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    getQiblaRotation,
    calibrate,
    refresh: initialize,
  };
}
