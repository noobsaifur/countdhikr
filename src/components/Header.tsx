import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <div 
      className="absolute top-0 left-0 w-full pb-3 px-3 landscape:pb-1.5 flex flex-col items-center z-50 transition-all safe-top"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 24px) + 1.25rem)'
      }}
    >
      <div className="liquid-glass-gold px-4 py-1.5 flex items-center gap-2 shadow-sm active:scale-95 transition-transform duration-200 cursor-pointer">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span className="font-bold text-foreground tracking-widest text-xs uppercase header-font">
          Dhikr Counter
        </span>
      </div>
    </div>
  );
}