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
    <div className="animate-screen-in flex flex-col h-full overflow-y-auto hide-scroll pb-32">
      <div className="w-[90%] max-w-md mx-auto">
        {/* Daily Dhikr Section - Collapsible */}
        <div className="mb-6">
          {/* Section Header */}
          <button
            onClick={() => setIsDailyDhikrExpanded(!isDailyDhikrExpanded)}
            className="w-full flex items-center justify-between py-3 mb-2"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-bold text-foreground text-xl">Daily Dhikr</h2>
              {isUsingDailyMode && (
                <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-medium">
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
            <>
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
                <div className="clay-button-rect w-full p-4 mb-3 text-center">
                  <p className="text-sm text-muted-foreground">Loading today's dhikr card...</p>
                </div>
              )}

              {/* History Section */}
              {historyCards.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">History</span>
                    {historyCards.length > 3 && (
                      <button
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="text-xs text-accent hover:underline"
                      >
                        {showAllHistory ? 'Show Less' : `View All (${historyCards.length})`}
                      </button>
                    )}
                  </div>
                  
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
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <h2 className="text-center font-bold text-foreground text-xl mb-4">Saved Dhikr</h2>

        {/* General Counter Option */}
        <div
          onClick={() => handleSelectDhikr('')}
          className={`clay-button-rect w-full p-4 flex justify-between items-center cursor-pointer mb-3 ${
            activeDhikrId === null && !isUsingDailyMode ? 'ring-2 ring-accent' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
              ∞
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-foreground">General Counter</span>
              <span className="text-xs text-muted-foreground">Target: 100</span>
            </div>
          </div>
        </div>

        {/* Dhikr List */}
        <div className="space-y-3 mb-6">
          {dhikrs.map((dhikr) => (
            <div
              key={dhikr.id}
              onClick={() => handleSelectDhikr(dhikr.id)}
              className={`clay-button-rect w-full p-4 flex justify-between items-center cursor-pointer ${
                activeDhikrId === dhikr.id && !isUsingDailyMode ? 'ring-2 ring-accent' : ''
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
                className="text-destructive/60 hover:text-destructive p-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Dhikr Button */}
        <div
          onClick={onOpenAddDhikr}
          className="clay-card p-3 mb-8 flex flex-col items-center text-center cursor-pointer hover:bg-card/60 transition-colors"
        >
          <div className="font-bold text-foreground">Add Your Dhikr</div>
          <div className="text-xs text-muted-foreground mb-2">Create custom dhikr</div>
          <div className="clay-button w-8 h-8 rounded-full">
            <Plus className="w-4 h-4" />
          </div>
        </div>

        <h2 className="text-center font-bold text-foreground text-xl mb-4">Must Recite Dua</h2>

        {/* Dua List */}
        <div className="space-y-3 mb-6">
          {duas.map((dua) => (
            <div key={dua.id} className="clay-button-rect w-full p-4 flex flex-col gap-2 relative group">
              {dua.arabic && (
                <div className="text-right font-arabic text-lg text-foreground leading-loose">
                  {dua.arabic}
                </div>
              )}
              <div className="text-sm text-muted-foreground italic">{dua.desc}</div>
              <button
                onClick={() => onDeleteDua(dua.id)}
                className="absolute top-2 left-2 text-destructive/60 hover:text-destructive opacity-70 hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Dua Button */}
        <div
          onClick={onOpenAddDua}
          className="clay-card p-3 mb-4 flex flex-col items-center text-center cursor-pointer hover:bg-card/60 transition-colors"
        >
          <div className="font-bold text-foreground">Add Your Dua</div>
          <div className="text-xs text-muted-foreground mb-2">Save favorite supplications</div>
          <div className="clay-button w-8 h-8 rounded-full">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}