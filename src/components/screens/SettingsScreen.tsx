import { useState } from 'react';
import { Trash2, Moon, Sun, Volume2, VolumeX, Bell, BellOff, Vibrate, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { ToggleSwitch } from '@/components/ToggleSwitch';

interface SettingsScreenProps {
  vibrateEnabled: boolean;
  vibrateIntensity: 'light' | 'medium' | 'strong';
  soundEnabled: boolean;
  reminderEnabled: boolean;
  darkMode: boolean;
  dayNumberOffset: number;
  dhikrReminderEnabled: boolean;
  salatReminderEnabled: boolean;
  onToggleVibrate: (checked: boolean) => void;
  onVibrateIntensityChange: (intensity: 'light' | 'medium' | 'strong') => void;
  onToggleSound: (checked: boolean) => void;
  onToggleReminder: (checked: boolean) => void;
  onToggleDarkMode: (checked: boolean) => void;
  onSetDayNumberOffset: (offset: number) => void;
  onToggleDhikrReminder: (checked: boolean) => void;
  onToggleSalatReminder: (checked: boolean) => void;
  onFactoryReset: () => void;
}

export function SettingsScreen({
  vibrateEnabled,
  vibrateIntensity,
  soundEnabled,
  reminderEnabled,
  darkMode,
  dayNumberOffset,
  dhikrReminderEnabled,
  salatReminderEnabled,
  onToggleVibrate,
  onVibrateIntensityChange,
  onToggleSound,
  onToggleReminder,
  onToggleDarkMode,
  onSetDayNumberOffset,
  onToggleDhikrReminder,
  onToggleSalatReminder,
  onFactoryReset
}: SettingsScreenProps) {
  const [showDaySettings, setShowDaySettings] = useState(false);
  const [tempOffset, setTempOffset] = useState(dayNumberOffset.toString());

  const handleSaveOffset = () => {
    const offset = parseInt(tempOffset) || 0;
    if (offset >= 0) {
      onSetDayNumberOffset(offset);
      setShowDaySettings(false);
    }
  };

  return (
    <div className="animate-screen-in flex flex-col h-full overflow-y-auto hide-scroll pb-32">
      <div className="w-full flex flex-col items-center pt-4">
        <h2 className="text-center font-bold text-foreground text-xl mb-6">SETTINGS</h2>

        <div className="w-[90%] max-w-md space-y-4">
          {/* Day Number Settings */}
          <div className="clay-button-rect w-full p-4">
            <button
              onClick={() => setShowDaySettings(!showDaySettings)}
              className="w-full flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <span className="font-bold text-foreground">Day Number Settings</span>
                  <p className="text-xs text-muted-foreground">
                    Current offset: {dayNumberOffset} days
                  </p>
                </div>
              </div>
              {showDaySettings ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {showDaySettings && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                <p className="text-xs text-muted-foreground">
                  If you've been counting dhikr before using this app, enter how many days you've already counted. For example, if you enter 172, Day 1 becomes Day 173.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">Starting offset:</span>
                  <input
                    type="number"
                    min="0"
                    value={tempOffset}
                    onChange={(e) => setTempOffset(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border/50 text-foreground"
                    placeholder="0"
                  />
                </div>
                <p className="text-[10px] text-yellow-600 dark:text-yellow-400">
                  ⚠️ This will recalculate all day numbers
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTempOffset(dayNumberOffset.toString());
                      setShowDaySettings(false);
                    }}
                    className="flex-1 py-2 text-sm rounded-lg bg-muted/50 text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOffset}
                    className="flex-1 py-2 text-sm rounded-lg bg-accent text-accent-foreground font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="clay-button-rect w-full p-4 flex justify-between items-center">
            <span className="font-bold text-foreground">Language</span>
            <span className="text-sm text-muted-foreground">English</span>
          </div>

          {/* Vibrate */}
          <div className="clay-button-rect w-full p-4 flex justify-between items-center">
            <span className="font-bold text-foreground">Vibrate</span>
            <ToggleSwitch checked={vibrateEnabled} onChange={onToggleVibrate} iconOn={<Vibrate className="w-3 h-3 text-background" />} iconOff={<Vibrate className="w-3 h-3 text-muted-foreground" />} />
          </div>

          {/* Vibrate Intensity */}
          {vibrateEnabled && <div className="clay-button-rect w-full p-4 flex flex-col gap-3">
              <span className="font-bold text-foreground">Vibrate Intensity</span>
              <div className="flex gap-2 w-full">
                {(['light', 'medium', 'strong'] as const).map(level => <button key={level} onClick={() => onVibrateIntensityChange(level)} className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold capitalize transition-all ${vibrateIntensity === level ? 'bg-accent text-accent-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {level}
                  </button>)}
              </div>
            </div>}

          {/* Dark Mode */}
          <div className="clay-button-rect w-full p-4 flex justify-between items-center">
            <span className="font-bold text-foreground">Dark Mode</span>
            <ToggleSwitch checked={darkMode} onChange={onToggleDarkMode} iconOn={<Moon className="w-3 h-3 text-background" />} iconOff={<Sun className="w-3 h-3 text-muted-foreground" />} />
          </div>

          {/* Sound */}
          <div className="clay-button-rect w-full p-4 flex justify-between items-center">
            <span className="font-bold text-foreground">Sound</span>
            <ToggleSwitch checked={soundEnabled} onChange={onToggleSound} iconOn={<Volume2 className="w-3 h-3 text-background" />} iconOff={<VolumeX className="w-3 h-3 text-muted-foreground" />} />
          </div>

          {/* Notification */}
          <div className="clay-button-rect w-full p-4 flex justify-between items-center">
            <span className="font-bold text-foreground">Reminder Notification</span>
            <ToggleSwitch checked={reminderEnabled} onChange={onToggleReminder} iconOn={<Bell className="w-3 h-3 text-background" />} iconOff={<BellOff className="w-3 h-3 text-muted-foreground" />} />
          </div>

          {/* Dhikr Reminder */}
          <div className="clay-button-rect w-full p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-foreground">Daily Dhikr Reminder</span>
                <p className="text-xs text-muted-foreground">Notify at 8 PM if no dhikr done</p>
              </div>
              <ToggleSwitch 
                checked={dhikrReminderEnabled} 
                onChange={onToggleDhikrReminder} 
                iconOn={<Bell className="w-3 h-3 text-background" />} 
                iconOff={<BellOff className="w-3 h-3 text-muted-foreground" />} 
              />
            </div>
          </div>

          {/* Salat Reminder */}
          <div className="clay-button-rect w-full p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-foreground">Salat Reminder</span>
                <p className="text-xs text-muted-foreground">10 min after azan (2 min for Maghrib)</p>
              </div>
              <ToggleSwitch 
                checked={salatReminderEnabled} 
                onChange={onToggleSalatReminder} 
                iconOn={<Clock className="w-3 h-3 text-background" />} 
                iconOff={<Clock className="w-3 h-3 text-muted-foreground" />} 
              />
            </div>
          </div>

          {/* Support */}
          <div className="clay-button-rect w-full p-4 flex flex-col gap-2 items-center text-center">
            <span className="font-bold text-foreground">Support The Dev</span>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Share your generosity. It helps keep the app ad-free.
            </p>
            <div className="flex gap-3 mt-1 text-xl text-muted-foreground">
              <span>💳</span>
              <span>☕</span>
            </div>
          </div>

          {/* Version */}
          <div className="clay-button-rect w-full p-4 flex flex-col gap-2 items-center text-center opacity-70">
            <span className="font-bold text-foreground">Version 1.5</span>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Dhikr Counter App
            </p>
          </div>

          {/* Reset Data */}
          <button onClick={onFactoryReset} className="clay-button-rect w-full p-4 flex justify-center items-center text-destructive font-bold hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4 mr-2" /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}