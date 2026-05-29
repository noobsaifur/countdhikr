import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Dhikr, Dua, DailyDhikr, DailyDhikrItem } from '@/types/dhikr';
import { DailyDhikrCard } from '@/components/DailyDhikrCard';

interface ListScreenProps {
  dhikrs: Dhikr[];
  duas: Dua[];
  dailyDhikrs: DailyDhikr[];
  activeDhikrId: string | null;
  activeDailyDhikrId: string | null;
  onSelectDhikr: (id: string | null) => void;
  onSelectDailyDhikr: (dhikrId: string) => void;
  onDeleteDhikr: (id: string) => void;
  onDeleteDua: (id: string) => void;
  onOpenAddDhikr: () => void;
  onOpenAddDua: () => void;
  onGoHome: () => void;
  onAddDhikrToDay: (date: string, dhikr: Omit<DailyDhikrItem, 'id'>) => void;
  onDeleteDhikrFromDay: (date: string, dhikrId: string) => void;
  onIncrementDayDhikr: (date: string, dhikrId: string) => void;
  onResetDayDhikr: (date: string, dhikrId: string) => void;
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function ListScreen({
  dhikrs,
  duas,
  dailyDhikrs,
  activeDhikrId,
  activeDailyDhikrId,
  onSelectDhikr,
  onSelectDailyDhikr,
  onDeleteDhikr,
  onDeleteDua,
  onOpenAddDhikr,
  onOpenAddDua,
  onGoHome,
  onAddDhikrToDay,
  onDeleteDhikrFromDay,
  onIncrementDayDhikr,
  onResetDayDhikr,
}: ListScreenProps) {
  const [isDailyDhikrExpanded, setIsDailyDhikrExpanded] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleSelectDhikr = (id: string) => {
    onSelectDhikr(id);
    onGoHome();
  };

  const todayStr = getTodayDateString();

  // Sort daily dhikrs by date (newest first)
  const sortedDailyDhikrs = [...dailyDhikrs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Separate today's card from history
  const todayCard = sortedDailyDhikrs.find(d => d.date === todayStr);
  const historyCards = sortedDailyDhikrs.filter(d => d.date !== todayStr);
  
  // Show recent 3 days or all if expanded
  const visibleHistory = showAllHistory ? historyCards : historyCards.slice(0, 3);

  // Check if using daily mode (no old system dhikr active AND has active daily dhikr)
  const isUsingDailyMode = activeDailyDhikrId !== null;

  return (
    <div className="animate-screen-in flex flex-col h-full overflow-y-auto hide-scroll pb-8 landscape:pb-4">
      <div className="w-[92%] max-w-md md:max-w-2xl mx-auto space-y-6">
        
        {/* Daily Dhikr Section - Collapsible */}
        <div className="liquid-glass p-3 md:p-5">
          {/* Section Header */}
          <button
            onClick={() => setIsDailyDhikrExpanded(!isDailyDhikrExpanded)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-bold text-foreground text-lg md:text-xl">Daily Dhikr</h2>
              {isUsingDailyMode && (
                <span className="text-[10px] bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {sortedDailyDhikrs.length} days
              </span>
              {isDailyDhikrExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {isDailyDhikrExpanded && (
            <div className="mt-4 space-y-4">
              {/* Today's Card - Always Expanded */}
              {todayCard ? (
                <DailyDhikrCard
                  key={todayCard.id}
                  dailyDhikr={todayCard}
                  isToday={true}
                  activeDailyDhikrId={activeDailyDhikrId}
                  onAddDhikr={onAddDhikrToDay}
                  onDeleteDhikr={onDeleteDhikrFromDay}
                  onIncrementDhikr={onIncrementDayDhikr}
                  onResetDhikr={onResetDayDhikr}
                  onSelectDhikr={onSelectDailyDhikr}
                />
              ) : (
                <div className="liquid-glass w-full p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-muted-foreground">Loading today's dhikr card...</p>
                </div>
              )}

              {/* History Section */}
              {historyCards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">History</span>
                    {historyCards.length > 3 && (
                      <button
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="text-xs text-accent font-bold hover:underline"
                      >
                        {showAllHistory ? 'Show Less' : `View All (${historyCards.length})`}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {visibleHistory.map((dailyDhikr) => (
                      <DailyDhikrCard
                        key={dailyDhikr.id}
                        dailyDhikr={dailyDhikr}
                        isToday={false}
                        activeDailyDhikrId={null}
                        onAddDhikr={onAddDhikrToDay}
                        onDeleteDhikr={onDeleteDhikrFromDay}
                        onIncrementDhikr={onIncrementDayDhikr}
                        onResetDhikr={onResetDayDhikr}
                        onSelectDhikr={onSelectDailyDhikr}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Saved Dhikr Section */}
        <div>
          <h2 className="text-center font-bold text-foreground text-xl mb-4 uppercase tracking-widest header-font text-accent">Saved Dhikr</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0 mb-4">
            {/* General Counter Option */}
            <div
              onClick={() => handleSelectDhikr('')}
              className={`liquid-glass w-full p-4 flex justify-between items-center cursor-pointer hover:scale-[1.01] active:scale-95 transition-all ${
                activeDhikrId === null && !isUsingDailyMode ? 'ring-2 ring-accent bg-accent/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-lg">
                  ∞
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-foreground">General Counter</span>
                  <span className="text-xs text-muted-foreground">Target: 100</span>
                </div>
              </div>
            </div>

            {/* Dhikr List */}
            {dhikrs.map((dhikr) => (
              <div
                key={dhikr.id}
                onClick={() => handleSelectDhikr(dhikr.id)}
                className={`liquid-glass w-full p-4 flex justify-between items-center cursor-pointer hover:scale-[1.01] active:scale-95 transition-all ${
                  activeDhikrId === dhikr.id && !isUsingDailyMode ? 'ring-2 ring-accent bg-accent/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                    {dhikr.count}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-foreground">{dhikr.title}</span>
                    <span className="text-xs text-muted-foreground">Target: {dhikr.target}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDhikr(dhikr.id);
                  }}
                  className="text-destructive/60 hover:text-destructive p-2 rounded-lg hover:bg-destructive/5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Dhikr Button */}
          <div
            onClick={onOpenAddDhikr}
            className="liquid-glass p-4 flex flex-col items-center text-center cursor-pointer hover:bg-card/45 hover:scale-[1.01] active:scale-95 transition-all"
          >
            <div className="font-bold text-foreground">Add Your Dhikr</div>
            <div className="text-xs text-muted-foreground mb-3">Create custom dhikr counter</div>
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shadow-sm hover:bg-accent/30 transition-all">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Must Recite Dua Section */}
        <div>
          <h2 className="text-center font-bold text-foreground text-xl mb-4 uppercase tracking-widest header-font text-accent">Must Recite Dua</h2>

          {/* Dua List */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0 mb-4">
            {duas.map((dua) => (
              <div key={dua.id} className="liquid-glass w-full p-4 flex flex-col gap-2 relative group hover:scale-[1.01] transition-all">
                {dua.arabic && (
                  <div className="text-right font-arabic text-lg md:text-xl text-foreground leading-loose py-2">
                    {dua.arabic}
                  </div>
                )}
                <div className="text-xs md:text-sm text-muted-foreground italic pl-6">{dua.desc}</div>
                <button
                  onClick={() => onDeleteDua(dua.id)}
                  className="absolute top-2 left-2 text-destructive/60 hover:text-destructive p-1.5 rounded-md hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Dua Button */}
          <div
            onClick={onOpenAddDua}
            className="liquid-glass p-4 flex flex-col items-center text-center cursor-pointer hover:bg-card/45 hover:scale-[1.01] active:scale-95 transition-all"
          >
            <div className="font-bold text-foreground">Add Your Dua</div>
            <div className="text-xs text-muted-foreground mb-3">Save favorite supplications</div>
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shadow-sm hover:bg-accent/30 transition-all">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}