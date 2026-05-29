import { useState } from 'react';
import { Trash2, Moon, Sun, Volume2, VolumeX, Bell, BellOff, Vibrate, Calendar, ChevronDown, ChevronUp, Clock, Info, ShieldAlert, Heart, Languages, Check } from 'lucide-react';
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
    <div className="animate-screen-in flex flex-col h-full overflow-y-auto hide-scroll pb-8 landscape:pb-4">
      <div className="w-full flex flex-col items-center pt-2 px-4 md:px-8">
        <h2 className="text-center font-bold text-foreground text-xl mb-4 tracking-wider uppercase font-sans">SETTINGS</h2>

        <div className="w-full max-w-md md:max-w-xl mx-auto space-y-4">
          
          {/* SECTION 1: GENERAL SYSTEM SETTINGS */}
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-3 block mb-1.5">GENERAL</span>
            <div className="liquid-glass w-full overflow-hidden flex flex-col divide-y divide-border/20">
              
              {/* Dark Mode Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-none">Dark Mode</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Adjust screen theme</span>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={darkMode} 
                  onChange={onToggleDarkMode} 
                  iconOn={<Moon className="w-3.5 h-3.5" />} 
                  iconOff={<Sun className="w-3.5 h-3.5" />} 
                />
              </div>

              {/* Language Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-none">Language</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Preferred app interface language</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-semibold bg-muted/40 px-2.5 py-1 rounded-lg">English</span>
              </div>

              {/* Day Offset Settings Row */}
              <div className="flex flex-col p-4 transition-colors">
                <button
                  onClick={() => setShowDaySettings(!showDaySettings)}
                  className="w-full flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-foreground leading-none">Day Number Settings</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Current offset: {dayNumberOffset} days</span>
                    </div>
                  </div>
                  {showDaySettings ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {showDaySettings && (
                  <div className="mt-4 pt-3 border-t border-border/20 space-y-3 animate-screen-in">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Offset your starting day number. If you counted 172 days previously, entering 172 here makes tomorrow count as Day 173.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-foreground">Starting Offset:</span>
                      <input
                        type="number"
                        min="0"
                        value={tempOffset}
                        onChange={(e) => setTempOffset(e.target.value)}
                        className="flex-1 max-w-[100px] px-2.5 py-1.5 text-xs rounded-lg bg-background/50 border border-border/50 text-foreground backdrop-blur-sm text-center"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => {
                          setTempOffset(dayNumberOffset.toString());
                          setShowDaySettings(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg bg-muted/40 hover:bg-muted/60 text-muted-foreground font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveOffset}
                        className="px-3 py-1.5 text-xs rounded-lg bg-accent text-accent-foreground font-bold hover:brightness-110 transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: HAPTICS & SOUND */}
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-3 block mb-1.5">SOUNDS & FEEDBACK</span>
            <div className="liquid-glass w-full overflow-hidden flex flex-col divide-y divide-border/20">
              
              {/* Vibrate Switch Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Vibrate className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-none">Haptic Feedback</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Vibrate device on counts & alarms</span>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={vibrateEnabled} 
                  onChange={onToggleVibrate} 
                  iconOn={<Vibrate className="w-3.5 h-3.5" />} 
                  iconOff={<Vibrate className="w-3.5 h-3.5" />} 
                />
              </div>

              {/* Vibrate Intensity Sub-menu (if haptics enabled) */}
              {vibrateEnabled && (
                <div className="flex flex-col p-4 bg-muted/5 transition-all">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Vibration Intensity</span>
                  <div className="flex gap-2 w-full">
                    {(['light', 'medium', 'strong'] as const).map(level => (
                      <button 
                        key={level} 
                        onClick={() => onVibrateIntensityChange(level)} 
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          vibrateIntensity === level 
                            ? 'bg-accent text-accent-foreground shadow-sm' 
                            : 'bg-background/40 text-muted-foreground border border-border/40 hover:bg-muted/40'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tap Sound Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-none">Click Sound</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Play distinct audio click on count increments</span>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={soundEnabled} 
                  onChange={onToggleSound} 
                  iconOn={<Volume2 className="w-3.5 h-3.5" />} 
                  iconOff={<VolumeX className="w-3.5 h-3.5" />} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTIFICATIONS & REMINDERS */}
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-3 block mb-1.5">NOTIFICATIONS & ALERTS</span>
            <div className="liquid-glass w-full overflow-hidden flex flex-col divide-y divide-border/20">
              
              {/* Daily Reminder Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-none">Daily Dhikr Reminder</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Notify at 8 PM if no daily dhikr completed</span>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={dhikrReminderEnabled} 
                  onChange={onToggleDhikrReminder} 
                  iconOn={<Bell className="w-3.5 h-3.5" />} 
                  iconOff={<BellOff className="w-3.5 h-3.5" />} 
                />
              </div>

              {/* Salat Reminder Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-foreground leading-none">Salat reminders</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Notify 10 min after prayer time (2 min for Maghrib)</span>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={salatReminderEnabled} 
                  onChange={onToggleSalatReminder} 
                  iconOn={<Check className="w-3.5 h-3.5" />} 
                  iconOff={<span className="w-3.5 h-3.5" />} 
                />
              </div>

              {/* General Reminder Row */}
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-foreground leading-none">Active System Alerts</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Ensure high-priority background scheduling permissions</span>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={reminderEnabled} 
                  onChange={onToggleReminder} 
                  iconOn={<Bell className="w-3.5 h-3.5" />} 
                  iconOff={<BellOff className="w-3.5 h-3.5" />} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: VERSION & ABOUT */}
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-3 block mb-1.5">ABOUT</span>
            <div className="liquid-glass w-full overflow-hidden flex flex-col divide-y divide-border/20">
              
              {/* Version Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-foreground leading-none">Version</span>
                    <span className="text-[10px] text-muted-foreground mt-1">CountDhikr App — Beta Debug 3</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-semibold bg-muted/40 px-2.5 py-1 rounded-lg">1.5.0-beta-debug3</span>
              </div>

              {/* Support Row */}
              <div className="flex flex-col p-4 gap-2 items-center text-center">
                <div className="flex items-center gap-1.5 text-primary text-sm font-bold">
                  <Heart className="w-4 h-4 fill-current text-red-500 animate-pulse" />
                  <span>Support Ad-Free Development</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight max-w-[280px]">
                  This app is completely free and contains no invasive tracking or ads. Share your prayers and support to help us maintain it!
                </p>
              </div>
            </div>
          </div>

          {/* DANGER AREA: FACTORY RESET */}
          <button 
            onClick={onFactoryReset} 
            className="liquid-glass w-full p-4 flex justify-center items-center text-destructive font-bold hover:bg-destructive/10 transition-colors uppercase tracking-widest text-xs border border-destructive/20"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}