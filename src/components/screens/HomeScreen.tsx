import { Plus, Vibrate, Volume2, Calendar, Moon, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DailyDhikr, DailyDhikrItem } from '@/types/dhikr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HomeScreenProps {
  count: number;
  target: number;
  name: string;
  vibrateEnabled: boolean;
  soundEnabled: boolean;
  todayDhikr: DailyDhikr | null;
  activeDailyDhikrItem: DailyDhikrItem | null;
  isInDailyMode: boolean;
  onIncrement: () => void;
  onReset: () => void;
  onSave: () => void;
  onToggleVibrate: () => void;
  onToggleSound: () => void;
  onSelectDailyDhikr?: (dhikrId: string) => void;
}

export function HomeScreen({
  count,
  target,
  name,
  vibrateEnabled,
  soundEnabled,
  todayDhikr,
  activeDailyDhikrItem,
  isInDailyMode,
  onIncrement,
  onReset,
  onSave,
  onToggleVibrate,
  onToggleSound,
  onSelectDailyDhikr,
}: HomeScreenProps) {
  const [showRipple, setShowRipple] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

  // Trigger iOS-style expand animation when count reaches target multiple
  useEffect(() => {
    if (count > 0 && count % target === 0) {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setRipplePosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height,
        });
      }
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 800);
      return () => clearTimeout(timer);
    }
  }, [count, target]);

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const hasDailyDhikrs = todayDhikr && todayDhikr.dhikrs.length > 0;
  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  return (
    <div className="animate-screen-in flex flex-col landscape:flex-row items-center justify-center h-full w-full px-4 sm:px-6 md:px-8 gap-3 landscape:gap-4 relative py-2 landscape:py-0 overflow-y-auto hide-scroll">
      {/* iOS-style Ripple Portal */}
      {showRipple && createPortal(
        <div className="ios-ripple-overlay">
          <div 
            className="ios-ripple-circle"
            style={{
              transformOrigin: `${ripplePosition.x}px ${ripplePosition.y}px`,
            }}
          />
        </div>,
        document.body
      )}

      {/* Left Column (landscape) or Top (portrait): Stats & Calendar Info */}
      {todayDhikr && (
        <div className="w-full max-w-md landscape:max-w-xs landscape:flex-shrink-0 md:max-w-sm flex flex-col gap-3 justify-center">
          {/* Day Info Card */}
          <div className="liquid-glass-gold p-4 flex items-center justify-between shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground flex flex-col items-center justify-center shadow-[0_4px_10px_rgba(16,185,129,0.3)] border border-white/10">
                <span className="text-[10px] font-bold tracking-wider">DAY</span>
                <span className="text-lg md:text-xl font-black leading-none">{todayDhikr.dayNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">Today's Dhikr</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                    isInDailyMode 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                      : 'bg-primary/10 text-primary dark:bg-primary/20'
                  }`}>
                    {isInDailyMode ? 'DAILY MODE' : 'GENERAL'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="w-3 h-3 text-primary/75" />
                  <span className="font-medium">{formatDisplayDate(todayDhikr.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Moon className="w-3 h-3 text-amber-500/75" />
                  <span className="font-semibold text-amber-600 dark:text-amber-500">{todayDhikr.hijriDate}</span>
                </div>
              </div>
            </div>
            {todayDhikr.dhikrs.length > 0 && (
              <div className="text-right">
                <div className="text-xl font-black text-foreground">
                  {todayDhikr.dhikrs.reduce((sum, d) => sum + d.count, 0)}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  /{todayDhikr.dhikrs.reduce((sum, d) => sum + d.target, 0)} total
                </div>
              </div>
            )}
          </div>

          {/* Quick List for Landscape Mode */}
          {hasDailyDhikrs && (
            <div className="hidden landscape:block liquid-glass p-4 max-h-[160px] overflow-y-auto hide-scroll">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Today's Routine</span>
              <div className="space-y-1.5">
                {todayDhikr.dhikrs.map((dhikr) => (
                  <button
                    key={dhikr.id}
                    onClick={() => onSelectDailyDhikr?.(dhikr.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                      activeDailyDhikrItem?.id === dhikr.id
                        ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm'
                        : 'hover:bg-muted/50 text-muted-foreground border border-transparent'
                    }`}
                  >
                    <span>{dhikr.title}</span>
                    <span className="font-mono text-[10px]">{dhikr.count}/{dhikr.target}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Column (landscape) or Bottom (portrait): Counter & Controls */}
      <div className="w-full max-w-md md:max-w-lg landscape:flex-1 flex flex-col items-center gap-3 md:gap-5 justify-center">
        {/* Count Display Card - Clean static premium glassmorphic card */}
        <div 
          ref={cardRef}
          className="liquid-glass-gold w-full p-5 md:p-8 landscape:p-4 flex flex-col items-center justify-center relative shadow-md"
        >
          <div className="relative flex items-center justify-center w-full">
            <div className="count-display count-size-responsive text-foreground tracking-tighter slab-font font-extrabold relative z-10 select-none">
              {count}
            </div>
          </div>

          <div className="flex gap-3 mt-5 md:mt-6 w-full justify-center">
            <button
              onClick={onReset}
              className="liquid-glass px-6 py-2 md:px-8 md:py-2.5 text-xs md:text-sm font-bold hover:text-destructive hover:bg-destructive/10 transition-colors uppercase tracking-wider rounded-2xl"
            >
              Reset
            </button>
            <button
              onClick={onSave}
              className="liquid-glass px-6 py-2 md:px-8 md:py-2.5 text-xs md:text-sm font-bold hover:text-primary hover:bg-primary/10 transition-colors uppercase tracking-wider rounded-2xl"
            >
              Save
            </button>
          </div>

          <div className="mt-6 md:mt-8 pb-2 text-center w-full px-2 relative z-10">
            {/* Daily Dhikr Dropdown Switcher */}
            {hasDailyDhikrs && onSelectDailyDhikr ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 font-extrabold text-foreground text-base md:text-lg hover:text-primary transition-colors">
                    {name}
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border border-border z-50 rounded-2xl shadow-xl" align="center">
                  {todayDhikr?.dhikrs.map((dhikr) => (
                    <DropdownMenuItem
                      key={dhikr.id}
                      onClick={() => onSelectDailyDhikr(dhikr.id)}
                      className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl transition-colors hover:bg-muted"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs">{dhikr.title}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {dhikr.count} / {dhikr.target}
                        </span>
                      </div>
                      {activeDailyDhikrItem?.id === dhikr.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="font-extrabold text-foreground text-base md:text-lg">{name}</div>
            )}
            
            {activeDailyDhikrItem?.arabic && (
              <div className="text-lg md:text-xl text-primary font-bold arabic-font mt-1 tracking-wide leading-relaxed">
                {activeDailyDhikrItem.arabic}
              </div>
            )}
            <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">
              Target: <span className="font-mono text-xs md:text-sm">{target}</span>
            </div>
            {isInDailyMode && (
              <div className="text-[9px] md:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Counting Daily Routine
              </div>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex items-center justify-between w-full px-4 md:px-8">
          <button
            onClick={onToggleVibrate}
            className={`clay-button w-14 h-14 md:w-16 md:h-16 landscape:w-12 landscape:h-12 transition-all hover:scale-105 ${
              vibrateEnabled ? 'text-primary bg-primary/10 border border-primary/20 shadow-md' : 'text-muted-foreground bg-secondary/50'
            }`}
          >
            <Vibrate className="w-5 h-5 md:w-6 md:h-6 landscape:w-5 landscape:h-5" />
          </button>

          {/* Big Count Button */}
          <button
            onClick={onIncrement}
            className="clay-button count-button count-button-glow w-28 h-28 md:w-32 md:h-32 landscape:w-24 landscape:h-24 rounded-full text-4xl text-primary bg-gradient-to-br from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-primary-foreground border border-white/20 dark:border-white/10 flex items-center justify-center"
          >
            <Plus className="w-9 h-9 md:w-10 md:h-10 landscape:w-7 landscape:h-7 text-white" />
          </button>

          <button
            onClick={onToggleSound}
            className={`clay-button w-14 h-14 md:w-16 md:h-16 landscape:w-12 landscape:h-12 transition-all hover:scale-105 ${
              soundEnabled ? 'text-primary bg-primary/10 border border-primary/20 shadow-md' : 'text-muted-foreground bg-secondary/50'
            }`}
          >
            <Volume2 className="w-5 h-5 md:w-6 md:h-6 landscape:w-5 landscape:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}