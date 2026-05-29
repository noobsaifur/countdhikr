import { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, MapPin, Navigation, AlertCircle, Compass, Target, Signal, SignalLow, SignalMedium, SignalHigh, CheckCircle } from 'lucide-react';
import { useQiblaCompass } from '@/hooks/useQiblaCompass';
import { useAudio } from '@/hooks/useAudio';

// Kaaba SVG Icon Component (Gold & Black)
const KaabaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="currentColor"
  >
    {/* Base */}
    <rect x="15" y="25" width="70" height="60" rx="3" fill="currentColor" />
    {/* Door */}
    <rect x="55" y="45" width="15" height="35" rx="1.5" fill="hsl(var(--background))" opacity="0.35" />
    {/* Gold band (Kiswah) */}
    <rect x="15" y="38" width="70" height="8" fill="hsl(var(--accent))" opacity="0.9" />
    {/* Corner decorations */}
    <circle cx="18" cy="28" r="3" fill="hsl(var(--accent))" opacity="0.8" />
    <circle cx="82" cy="28" r="3" fill="hsl(var(--accent))" opacity="0.8" />
    {/* Top edge shadow */}
    <rect x="15" y="25" width="70" height="4" fill="hsl(var(--background))" opacity="0.15" />
  </svg>
);

// Navigation Arrow Icon Component for Qibla pointer on the dial
const NavigationArrow = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
  </svg>
);

export function QiblaCompassScreen() {
  const {
    qiblaDirection,
    compassHeading,
    userLocation,
    distanceToKaaba,
    isGyroscopeAvailable,
    isLocationAvailable,
    loading,
    error,
    accuracy,
    isAlignedWithQibla,
    getQiblaRotation,
    calibrate,
    refresh,
  } = useQiblaCompass();

  const { vibrate } = useAudio();
  const lastAlignmentVibration = useRef<number>(0);
  const [showCalibrationHint, setShowCalibrationHint] = useState(false);

  // Vibrate when aligned with Qibla (with cooldown to prevent rapid vibrations)
  useEffect(() => {
    if (isAlignedWithQibla && isGyroscopeAvailable) {
      const now = Date.now();
      // Only vibrate if it's been at least 2 seconds since last vibration
      if (now - lastAlignmentVibration.current > 2000) {
        vibrate([50, 50, 50], 'medium');
        lastAlignmentVibration.current = now;
      }
    }
  }, [isAlignedWithQibla, isGyroscopeAvailable, vibrate]);

  // Show calibration hint after a few seconds if compass is available
  useEffect(() => {
    if (isGyroscopeAvailable && !loading) {
      const timer = setTimeout(() => setShowCalibrationHint(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isGyroscopeAvailable, loading]);

  // Get accuracy icon
  const AccuracyIcon = () => {
    switch (accuracy) {
      case 'high':
        return <SignalHigh className="w-4 h-4 text-accent" />;
      case 'medium':
        return <SignalMedium className="w-4 h-4 text-primary" />;
      default:
        return <SignalLow className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAccuracyLabel = () => {
    switch (accuracy) {
      case 'high':
        return 'High Accuracy';
      case 'medium':
        return 'Medium Accuracy';
      default:
        return 'Low Accuracy';
    }
  };

  return (
    <div className="animate-screen-in flex flex-col h-full px-4 md:px-8 pt-4 overflow-y-auto hide-scroll pb-8 landscape:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-center font-bold text-foreground text-xl">QIBLA COMPASS</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-50"
          title="Refresh compass"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 items-center">
        {/* Status Card and Information */}
        <div className="space-y-4">
          <div className="liquid-glass w-full p-4 flex flex-col justify-start items-stretch">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent animate-pulse" />
                <span className="font-semibold text-foreground text-sm">Compass Status</span>
              </div>
              <div className="flex items-center gap-1">
                <AccuracyIcon />
                <span className="text-xs text-muted-foreground">{getAccuracyLabel()}</span>
              </div>
            </div>

            {/* Location Info */}
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                {loading ? 'Detecting location...' : 
                 userLocation ? `${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°` : 
                 'Location unavailable'}
              </span>
            </div>

            {/* Sensor Info */}
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                {isGyroscopeAvailable ? 'Gyroscope Active' : 'Using Location Only'}
              </span>
            </div>

            {/* Qibla Direction */}
            {qiblaDirection !== null && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                <Navigation className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  Qibla: <span className="font-semibold text-foreground">{qiblaDirection.toFixed(1)}°</span> from North
                </span>
              </div>
            )}

            {/* Distance to Kaaba */}
            {distanceToKaaba !== null && (
              <div className="flex items-center gap-2 mt-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  Distance: <span className="font-semibold text-foreground">{distanceToKaaba.toFixed(0)} km</span> to Mecca
                </span>
              </div>
            )}

            {/* Alignment Status */}
            {isAlignedWithQibla && isGyroscopeAvailable && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 bg-green-500/5 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-500">
                  Aligned with Qibla! Face this way.
                </span>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="liquid-glass w-full p-4 flex flex-col justify-start items-stretch border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
              <button
                onClick={calibrate}
                className="mt-3 w-full py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:brightness-110"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Qibla Direction Text */}
          {!loading && qiblaDirection !== null && (
            <div className="text-center md:text-left py-2 px-1">
              <p className="text-lg font-semibold text-foreground">
                {isGyroscopeAvailable ? 'Rotate phone to align' : 'Face'} <span className="text-accent">{qiblaDirection.toFixed(0)}°</span> from North
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isGyroscopeAvailable 
                  ? 'Rotate phone until the gold Kaaba target lines up with the green arrow' 
                  : 'Compass sensor not available, use a physical compass'}
              </p>
            </div>
          )}
        </div>

        {/* Compass Display Column */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Calibrating compass...</p>
            </div>
          )}

          {!loading && qiblaDirection !== null && (
            <>
              {/* Alignment indicator glow */}
              {isAlignedWithQibla && isGyroscopeAvailable && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-green-500/10 animate-pulse blur-xl" />
                </div>
              )}

              {/* Main Compass Circle */}
              <div className={`relative w-72 h-72 md:w-80 md:h-80 transition-all duration-300 ${
                isAlignedWithQibla && isGyroscopeAvailable 
                  ? 'ring-4 ring-green-500/50 rounded-full shadow-[0_0_40px_rgba(34,197,94,0.35)] scale-[1.02]' 
                  : 'ring-1 ring-border/50 rounded-full shadow-lg'
              }`}>
                {/* Outer ring with gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted/30 to-muted/60 p-1">
                  <div className="w-full h-full rounded-full bg-card/90 backdrop-blur-md border border-border/40 shadow-inner relative overflow-hidden">
                    
                    {/* FIXED Target at the top (12 o'clock position) — ALWAYS GOLD KAABA */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                      <div className={`p-2 rounded-xl border transition-all duration-300 shadow-md ${
                        isAlignedWithQibla && isGyroscopeAvailable
                          ? 'bg-green-500/20 border-green-500 scale-110 shadow-green-500/20'
                          : 'bg-accent/20 border-accent/30 hover:scale-105'
                      }`}>
                        <KaabaIcon className="w-8 h-8 text-foreground" />
                      </div>
                      {/* Smooth glowing Notch Pointer pointing downwards */}
                      <div className={`w-0.5 h-3 mt-1 transition-all duration-300 ${
                        isAlignedWithQibla && isGyroscopeAvailable ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-accent/70'
                      }`} />
                    </div>
 
                    {/* Compass markings & directions — ROTATES BY -compassHeading */}
                    <div 
                      className="absolute inset-5 rounded-full z-10 transition-transform duration-75 ease-out"
                      style={{
                        transform: `rotate(-${compassHeading || 0}deg)`,
                      }}
                    >
                      {/* Cardinal directions */}
                      {['N', 'E', 'S', 'W'].map((dir, index) => (
                        <div
                          key={dir}
                          className="absolute font-bold text-sm text-muted-foreground"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) rotate(${index * 90}deg) translateY(-105px) rotate(-${index * 90}deg)`,
                          }}
                        >
                          <span className={dir === 'N' ? 'text-accent font-extrabold text-base' : 'font-bold'}>{dir}</span>
                        </div>
                      ))}
 
                      {/* Degree markings */}
                      {[...Array(36)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-0.5 bg-muted-foreground/30"
                          style={{
                            height: i % 3 === 0 ? '10px' : '5px',
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) rotate(${i * 10}deg) translateY(-90px)`,
                            opacity: i % 3 === 0 ? 0.7 : 0.35,
                          }}
                        />
                      ))}
 
                      {/* INTEGRATED QIBLA POINTER ON DIAL — Rotates with the dial. Placed at qiblaDirection angle relative to N */}
                      <div
                        className="absolute w-full h-full top-1/2 left-1/2 pointer-events-none"
                        style={{
                          transform: 'translate(-50%, -50%) rotate(' + (qiblaDirection || 0) + 'deg)',
                        }}
                      >
                        {/* Green Arrow pointing outwards to target the fixed Kaaba at 0 deg */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center drop-shadow-[0_2px_8px_rgba(34,197,94,0.4)]">
                          <NavigationArrow className="w-8 h-8 text-green-500 animate-pulse" />
                        </div>
                        {/* Green guide line */}
                        <div 
                          className="absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-b from-green-500 to-transparent"
                          style={{
                            height: '75px',
                            transform: 'translate(-50%, -100%)',
                          }}
                        />
                      </div>
                    </div>
 
                    {/* Center Pin Indicator */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg border-2 border-primary-foreground flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                      </div>
                    </div>
 
                    {/* Compass heading indicator */}
                    {compassHeading !== null && (
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
                        <div className="px-3 py-1 rounded-full bg-muted/40 backdrop-blur-md border border-border/20 shadow-sm">
                          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
                            HEADING: <span className="text-foreground font-bold">{compassHeading.toFixed(0)}°</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Calibration Hint */}
          {showCalibrationHint && isGyroscopeAvailable && !loading && (
            <div className="mt-4 p-3 rounded-xl bg-accent/15 border border-accent/25 max-w-xs text-center animate-pulse">
              <p className="text-xs text-accent">
                💡 Rotate your phone in a figure-8 pattern to calibrate the compass sensors
              </p>
            </div>
          )}
        </div>
      </div>

      {/* No Data State */}
      {!loading && qiblaDirection === null && !error && (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <Compass className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm text-center mb-4">
            Unable to determine Qibla direction
          </p>
          <button
            onClick={calibrate}
            className="py-2.5 px-6 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 shadow-md transition-all"
          >
            Calibrate Compass
          </button>
        </div>
      )}

      {/* Bottom Padding */}
      <div className="h-8" />
    </div>
  );
}
