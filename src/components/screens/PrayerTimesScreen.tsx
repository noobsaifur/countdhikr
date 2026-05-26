import { RefreshCw, MapPin, Loader2, Bell, BellOff, Volume2, VolumeX, Vibrate, Settings2, Check, ChevronDown, Music, Globe, Lock, Unlock, Play, Square } from 'lucide-react';
import { PrayerTimes } from '@/hooks/usePrayerTimes';
import { useAzanPreview } from '@/hooks/useAzanPreview';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { PRAYER_METHODS, AZAN_SOUNDS, SelectedCountry } from '@/types/dhikr';
import { COUNTRIES } from '@/data/countries';
import { useState } from 'react';

const prayerIcons: Record<string, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌇',
  Isha: '🌃',
};

const prayerLabels: Record<string, string> = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
};

interface PrayerTimesScreenProps {
  prayerNotifications: boolean;
  azanEnabled: boolean;
  azanSound: boolean;
  azanVibrate: boolean;
  prayerMethod: number;
  customAzanUrl: string | null;
  selectedCountry: SelectedCountry | null;
  useAutoLocation: boolean;
  times: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  location: string | null;
  date: string | null;
  hijriDate: string | null;
  nextPrayer: string | null;
  timeToNext: string | null;
  forceRefresh: () => void;
  isLocationLocked: boolean;
  getTimeUntilUnlock: () => string | null;
  onTogglePrayerNotifications: (checked: boolean) => void;
  onToggleAzan: (checked: boolean) => void;
  onToggleAzanSound: (checked: boolean) => void;
  onToggleAzanVibrate: (checked: boolean) => void;
  onChangePrayerMethod: (method: number) => void;
  onChangeCustomAzanUrl: (url: string | null) => void;
  onChangeSelectedCountry: (country: SelectedCountry | null) => void;
  onToggleAutoLocation: (checked: boolean) => void;
}

export function PrayerTimesScreen({
  prayerNotifications,
  azanEnabled,
  azanSound,
  azanVibrate,
  prayerMethod,
  customAzanUrl,
  selectedCountry,
  useAutoLocation,
  times,
  loading,
  error,
  location,
  date,
  hijriDate,
  nextPrayer,
  timeToNext,
  forceRefresh,
  isLocationLocked,
  getTimeUntilUnlock,
  onTogglePrayerNotifications,
  onToggleAzan,
  onToggleAzanSound,
  onToggleAzanVibrate,
  onChangePrayerMethod,
  onChangeCustomAzanUrl,
  onChangeSelectedCountry,
  onToggleAutoLocation,
}: PrayerTimesScreenProps) {
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showAzanSoundSelector, setShowAzanSoundSelector] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(customAzanUrl || '');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  
  const { isPlaying, currentUrl, togglePreview, stopPreview } = useAzanPreview();


  // Get the current azan URL for preview
  const getCurrentAzanUrl = () => {
    if (customAzanUrl) return customAzanUrl;
    return AZAN_SOUNDS[0].url;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const currentMethodName = PRAYER_METHODS.find(m => m.id === prayerMethod)?.name || 'Unknown';
  const currentAzanSound = customAzanUrl 
    ? 'Custom' 
    : AZAN_SOUNDS.find(s => !customAzanUrl)?.name || 'Makkah Azan';
  const timeUntilUnlock = getTimeUntilUnlock();

  const handleSelectCountry = (country: SelectedCountry) => {
    onChangeSelectedCountry(country);
    onChangePrayerMethod(country.method);
    onToggleAutoLocation(false);
    setShowCountrySelector(false);
  };

  const handleEnableAutoLocation = () => {
    onChangeSelectedCountry(null);
    onToggleAutoLocation(true);
    setShowCountrySelector(false);
  };

  const handleSelectAzanSound = (url: string | null) => {
    onChangeCustomAzanUrl(url);
    setShowAzanSoundSelector(false);
    setShowCustomUrlInput(false);
  };

  const handleSaveCustomUrl = () => {
    if (customUrlInput.trim()) {
      onChangeCustomAzanUrl(customUrlInput.trim());
    }
    setShowCustomUrlInput(false);
  };

  return (
    <div className="animate-screen-in flex flex-col h-full px-4 pt-4 overflow-y-auto hide-scroll">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-center font-bold text-foreground text-xl">PRAYER TIMES</h2>
        <div className="flex items-center gap-2">
          {isLocationLocked && timeUntilUnlock && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>{timeUntilUnlock}</span>
            </div>
          )}
          <button
            onClick={forceRefresh}
            disabled={loading}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50"
            title="Force refresh location"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Location Card */}
      <div className="clay-button-rect w-full p-4 mb-3 flex flex-col justify-start items-stretch">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <span className="font-semibold text-foreground text-sm">Location</span>
          </div>
          {isLocationLocked ? (
            <Lock className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Unlock className="w-3 h-3 text-accent" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">
            {loading ? 'Detecting location...' : location || 'Unknown location'}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Auto Location</span>
          <ToggleSwitch
            checked={useAutoLocation}
            onChange={onToggleAutoLocation}
            iconOn={<MapPin className="w-3 h-3 text-background" />}
            iconOff={<MapPin className="w-3 h-3 text-muted-foreground" />}
          />
        </div>

        <button
          onClick={() => setShowCountrySelector(!showCountrySelector)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 mt-2"
        >
          <span className="text-xs text-muted-foreground">
            {useAutoLocation ? 'Or select a city...' : selectedCountry?.name || 'Select a city'}
          </span>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
        </button>

        {showCountrySelector && (
          <div className="mt-2 pt-2 border-t border-border/50 space-y-1 max-h-48 overflow-y-auto">
            <button
              onClick={handleEnableAutoLocation}
              className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                useAutoLocation
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Auto Detect Location</span>
              </div>
              {useAutoLocation && <Check className="w-3 h-3" />}
            </button>
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelectCountry(country)}
                className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                  selectedCountry?.code === country.code && !useAutoLocation
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <span>{country.name}</span>
                {selectedCountry?.code === country.code && !useAutoLocation && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Calculation Method Card */}
      <div className="clay-button-rect w-full p-4 mb-3 flex flex-col justify-start items-stretch">
        <button
          onClick={() => setShowMethodSelector(!showMethodSelector)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-accent" />
            <span className="font-semibold text-foreground text-sm">Calculation Method</span>
          </div>
          <span className="text-xs text-muted-foreground max-w-[140px] truncate">{currentMethodName}</span>
        </button>
        
        {showMethodSelector && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1 max-h-48 overflow-y-auto">
            {PRAYER_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  onChangePrayerMethod(method.id);
                  setShowMethodSelector(false);
                }}
                className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                  prayerMethod === method.id
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <span>{method.name}</span>
                {prayerMethod === method.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Azan Sound Card */}
      <div className="clay-button-rect w-full p-4 mb-3 flex flex-col justify-start items-stretch">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-accent" />
            <span className="font-semibold text-foreground text-sm">Azan Sound</span>
          </div>
          {/* Preview Button */}
          <button
            onClick={() => togglePreview(getCurrentAzanUrl())}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
              isPlaying ? 'bg-accent text-accent-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Preview</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Enable Sound</span>
          <ToggleSwitch
            checked={azanSound}
            onChange={onToggleAzanSound}
            iconOn={<Volume2 className="w-3 h-3 text-background" />}
            iconOff={<VolumeX className="w-3 h-3 text-muted-foreground" />}
          />
        </div>

        {azanSound && (
          <>
            <button
              onClick={() => setShowAzanSoundSelector(!showAzanSoundSelector)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <Music className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{currentAzanSound}</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showAzanSoundSelector ? 'rotate-180' : ''}`} />
            </button>

            {showAzanSoundSelector && (
              <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                {AZAN_SOUNDS.map((sound) => (
                  <div
                    key={sound.id}
                    className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                      (!customAzanUrl && sound.id === 'makkah') || customAzanUrl === sound.url
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectAzanSound(sound.url === AZAN_SOUNDS[0].url ? null : sound.url)}
                      className="flex-1 text-left"
                    >
                      {sound.name}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreview(sound.url);
                        }}
                        className={`p-1 rounded ${
                          isPlaying && currentUrl === sound.url
                            ? 'text-accent'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isPlaying && currentUrl === sound.url ? (
                          <Square className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </button>
                      {((!customAzanUrl && sound.id === 'makkah') || customAzanUrl === sound.url) && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                  className="w-full p-2 rounded-lg text-left text-xs text-muted-foreground hover:bg-muted/50"
                >
                  + Add Custom URL
                </button>
                {showCustomUrlInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-muted/50 text-foreground border border-border/50"
                    />
                    <button
                      onClick={handleSaveCustomUrl}
                      className="px-3 py-1 text-xs rounded-lg bg-accent text-accent-foreground"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Azan Vibrate Card */}
      <div className="clay-button-rect w-full p-4 mb-3 flex flex-col justify-start items-stretch">
        <div className="flex items-center gap-2 mb-3">
          <Vibrate className="w-4 h-4 text-accent" />
          <span className="font-semibold text-foreground text-sm">Azan Vibrate</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Enable Vibration</span>
          <ToggleSwitch
            checked={azanVibrate}
            onChange={onToggleAzanVibrate}
            iconOn={<Vibrate className="w-3 h-3 text-background" />}
            iconOff={<Vibrate className="w-3 h-3 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Prayer Notifications Card */}
      <div className="clay-button-rect w-full p-4 mb-3 flex flex-col justify-start items-stretch">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-accent" />
          <span className="font-semibold text-foreground text-sm">Prayer Notifications</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Enable Notifications</span>
          <ToggleSwitch
            checked={prayerNotifications}
            onChange={onTogglePrayerNotifications}
            iconOn={<Bell className="w-3 h-3 text-background" />}
            iconOff={<BellOff className="w-3 h-3 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Enable Azan</span>
          <ToggleSwitch
            checked={azanEnabled}
            onChange={onToggleAzan}
            iconOn={<Check className="w-3 h-3 text-background" />}
            iconOff={<span className="w-3 h-3" />}
          />
        </div>
      </div>

      {/* Dates */}
      {date && (
        <div className="text-center mb-3">
          <p className="text-sm text-muted-foreground">{date}</p>
          {hijriDate && <p className="text-xs text-accent">{hijriDate}</p>}
        </div>
      )}

      {/* Next Prayer Highlight */}
      {nextPrayer && timeToNext && !loading && (
        <div className="clay-button-rect w-full p-3 mb-3 flex flex-col justify-start items-stretch bg-accent/10 border border-accent/30">
          <p className="text-center text-sm">
            <span className="text-muted-foreground">Next: </span>
            <span className="font-bold text-accent">{nextPrayer}</span>
            <span className="text-muted-foreground"> in </span>
            <span className="font-semibold text-foreground">{timeToNext}</span>
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="clay-button-rect w-full p-4 flex flex-col items-center justify-center text-center">
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={forceRefresh}
            className="mt-2 text-accent text-sm font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Prayer Times List */}
      {times && !loading && (
        <div className="space-y-2">
          {Object.entries(times).map(([prayer, time]) => (
            <div
              key={prayer}
              className={`clay-button-rect w-full p-3 flex items-center justify-between transition-all ${
                nextPrayer === prayer
                  ? 'ring-2 ring-accent bg-accent/10'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{prayerIcons[prayer]}</span>
                <div className="flex flex-col">
                  <span className={`font-bold text-sm ${nextPrayer === prayer ? 'text-accent' : 'text-foreground'}`}>
                    {prayerLabels[prayer]}
                  </span>
                  {nextPrayer === prayer && (
                    <span className="text-[10px] text-accent font-medium">Next Prayer</span>
                  )}
                </div>
              </div>
              <span className={`text-base font-semibold ${nextPrayer === prayer ? 'text-accent' : 'text-foreground'}`}>
                {formatTime(time)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Kaaba decoration */}
      <div className="mt-4 mb-4 text-center">
        <span className="text-3xl">🕋</span>
        <p className="text-xs text-muted-foreground mt-1">
          {isLocationLocked ? `Location locked for ${timeUntilUnlock}` : 'Force refresh to update location'}
        </p>
      </div>

      <div className="h-10" />
    </div>
  );
}
