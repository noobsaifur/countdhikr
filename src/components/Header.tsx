import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <div className="absolute top-0 left-0 w-full p-4 landscape:p-2 flex flex-col items-center z-10 transition-all">
      <div className="glass-card-gold px-4 py-1.5 flex items-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span className="font-bold text-foreground tracking-widest text-xs uppercase header-font">
          Dhikr Counter
        </span>
      </div>
    </div>
  );
}