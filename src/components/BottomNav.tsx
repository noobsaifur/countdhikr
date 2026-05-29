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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center safe-bottom">
      <div className="w-full max-w-lg h-20 landscape:h-14 flex justify-around items-center
        bg-card/65 dark:bg-card/45 backdrop-blur-3xl
        border-t border-white/20 dark:border-white/10
        shadow-[0_-4px_30px_rgba(0,0,0,0.06)]
        dark:shadow-[0_-4px_30px_rgba(0,0,0,0.3)]
        transition-all duration-300 px-2 rounded-t-[1.75rem]">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className="flex flex-col items-center justify-center w-16 h-16 landscape:w-14 landscape:h-12 transition-all duration-200 active:scale-95 group"
            onClick={() => onTabChange(id)}
          >
            {/* MD3 Active Indicator Pill container */}
            <div className="relative w-14 h-8 landscape:w-11 landscape:h-7 flex items-center justify-center rounded-full transition-all duration-300">
              {activeTab === id ? (
                <div className="absolute inset-0 rounded-full m3-nav-indicator animate-screen-in" />
              ) : (
                <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-primary/5 transition-all duration-200" />
              )}
              <Icon
                className={`relative z-10 w-[18px] h-[18px] landscape:w-4 landscape:h-4 transition-all duration-200 ${
                  activeTab === id ? 'text-primary scale-110' : 'text-muted-foreground'
                }`}
              />
            </div>
            {/* Label text below indicator pill */}
            <span
              className={`text-[10px] md:text-[11px] font-semibold tracking-wide mt-1 landscape:hidden transition-colors duration-250 ${
                activeTab === id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}