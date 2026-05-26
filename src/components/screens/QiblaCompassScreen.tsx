import { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, MapPin, Navigation, AlertCircle, Compass, Target, Signal, SignalLow, SignalMedium, SignalHigh, CheckCircle } from 'lucide-react';
import { useQiblaCompass } from '@/hooks/useQiblaCompass';
import { useAudio } from '@/hooks/useAudio';

// Kaaba SVG Icon Component
const KaabaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="currentColor"
  >
    {/* Base */}
    <rect x="15" y="25" width="70" height="60" rx="2" fill="currentColor" />
    {/* Door */}
    <rect x="55" y="45" width="15" height="35" rx="1" fill="hsl(var(--background))" opacity="0.3" />
    {/* Gold band (Kiswah) */}
    <rect x="15" y="38" width="70" height="8" fill="hsl(var(--accent))" opacity="0.8" />
    {/* Corner decorations */}
    <circle cx="18" cy="28" r="3" fill="hsl(var(--accent))" opacity="0.6" />
    <circle cx="82" cy="28" r="3" fill="hsl(var(--accent))" opacity="0.6" />
    {/* Top edge shadow */}
    <rect x="15" y="25" width="70" height="4" fill="hsl(var(--background))" opacity="0.1" />
  </svg>
);

// Navigation Arrow Icon Component
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

  const qiblaRotation = getQiblaRotation();

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
    <div className="animate-screen-in flex flex-col h-full px-4 pt-4 overflow-y-auto hide-scroll">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-center font-bold text-foreground text-xl">QIBLA COMPASS</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50"
          title="Refresh compass"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Card */}
      <div className="clay-button-rect w-full p-4 mb-4 flex flex-col justify-start items-stretch">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
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
        <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              ✓ Aligned with Qibla!
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="clay-button-rect w-full p-4 mb-4 flex flex-col justify-start items-stretch border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
          <button
            onClick={calibrate}
            className="mt-3 w-full py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-muted-foreground text-sm">Calibrating compass...</p>
        </div>
      )}

      {/* Compass Display */}
      {!loading && qiblaDirection !== null && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 relative">
          {/* Alignment indicator glow */}
          {isAlignedWithQibla && isGyroscopeAvailable && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-green-500/10 animate-pulse" />
            </div>
          )}

          {/* Main Compass Circle */}
          <div className={`relative w-72 h-72 ${isAlignedWithQibla && isGyroscopeAvailable ? 'ring-4 ring-green-500/50 rounded-full' : ''}`}>
            {/* Outer ring with gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted/30 to-muted/60 p-1">
              <div className="w-full h-full rounded-full bg-card/80 backdrop-blur-sm border border-border/40 shadow-lg">
                {/* Fixed Kaaba Icon at the top (12 o'clock position) as a target */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                  <div className="p-2 rounded-lg bg-accent/20 backdrop-blur-sm border border-accent/30 shadow-md">
                    <KaabaIcon className="w-8 h-8 text-foreground" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 animate-pulse" />
                </div>

                {/* Compass markings (dial) - rotates by -compassHeading */}
                <div 
                  className="absolute inset-4 rounded-full transition-transform duration-150 ease-out"
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
                        transform: `translate(-50%, -50%) rotate(${index * 90}deg) translateY(-110px) rotate(-${index * 90}deg)`,
                      }}
                    >
                      <span className={dir === 'N' ? 'text-accent font-bold' : ''}>{dir}</span>
                    </div>
                  ))}

                  {/* Degree markings */}
                  {[...Array(36)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 bg-muted-foreground/30"
                      style={{
                        height: i % 3 === 0 ? '12px' : '6px',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 10}deg) translateY(-95px)`,
                        opacity: i % 3 === 0 ? 0.6 : 0.3,
                      }}
                    />
                  ))}
                </div>

                {/* User Position Indicator (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-lg border-2 border-primary-foreground" />
                </div>

                {/* Qibla Direction Indicator - rotates by qiblaRotation */}
                <div
                  className="absolute top-1/2 left-1/2 w-full h-full transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${qiblaRotation}deg)`,
                  }}
                >
                  {/* Arrow pointing to Qibla */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                    <NavigationArrow 
                      className="w-8 h-8 text-accent drop-shadow-lg" 
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    />
                  </div>

                  {/* Direction line */}
                  <div 
                    className="absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-b from-accent to-transparent"
                    style={{
                      height: '90px',
                      transform: 'translate(-50%, -100%)',
                    }}
                  />
                </div>

                {/* Compass heading display */}
                {compassHeading !== null && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
                      <span className="text-xs text-muted-foreground">
                        Heading: <span className="font-semibold text-foreground">{compassHeading.toFixed(0)}°</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Qibla Direction Text */}
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-foreground">
              {isGyroscopeAvailable ? 'Point your phone' : 'Face'} <span className="text-accent">{qiblaDirection.toFixed(0)}°</span> from North
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isGyroscopeAvailable 
                ? 'Follow the arrow to face Qibla' 
                : 'Compass sensor not available, use a physical compass'}
            </p>
          </div>

          {/* Calibration Hint */}
          {showCalibrationHint && isGyroscopeAvailable && (
            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30 max-w-xs text-center">
              <p className="text-xs text-accent">
                💡 Move your phone in a figure-8 pattern to calibrate the compass for better accuracy
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!loading && qiblaDirection === null && !error && (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <Compass className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm text-center mb-4">
            Unable to determine Qibla direction
          </p>
          <button
            onClick={calibrate}
            className="py-2 px-6 rounded-lg bg-accent text-accent-foreground text-sm font-medium"
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
