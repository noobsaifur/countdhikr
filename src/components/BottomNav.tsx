import { Home, List, Settings, Clock, Compass } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'list' | 'settings' | 'prayer' | 'qibla';
  onTabChange: (tab: 'home' | 'list' | 'settings' | 'prayer' | 'qibla') => void;
}

const navItems = [
  { id: 'home' as const, icon: Home, label: 'Home' },
  { id: 'list' as const, icon: List, label: 'Routine' },
  { id: 'prayer' as const, icon: Clock, label: 'Prayer' },
  { id: 'qibla' as const, icon: Compass, label: 'Qibla' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' }
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-5 landscape:bottom-3 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-18 landscape:h-13 flex justify-around items-center z-50 rounded-3xl landscape:rounded-2xl bg-card/65 dark:bg-card/45 backdrop-blur-2xl border border-white/25 dark:border-white/10 shadow-xl transition-all duration-300 px-2">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`nav-item-new relative flex flex-col items-center justify-center w-14 h-14 landscape:w-11 landscape:h-11 rounded-2xl transition-all active:scale-95 ${
            activeTab === id
              ? 'text-primary scale-105 font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onTabChange(id)}
        >
          {/* Dot indicator on top */}
          {activeTab === id && (
            <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-primary animate-bounce shadow-md shadow-primary/30" />
          )}
          <Icon
            className={`w-[18px] h-[18px] landscape:w-4 landscape:h-4 transition-transform ${
              activeTab === id ? 'scale-110 text-primary' : ''
            }`}
          />
          <span
            className={`text-[9px] font-bold tracking-wide mt-0.5 ${
              activeTab === id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}