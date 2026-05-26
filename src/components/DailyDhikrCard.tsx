import { useState } from 'react';
import { Plus, Trash2, Calendar, Moon, ChevronDown, ChevronUp, Lock, CheckCircle, AlertCircle, XCircle, Play } from 'lucide-react';
import { DailyDhikr, DailyDhikrItem, DailyDhikrStatus } from '@/types/dhikr';

interface DailyDhikrCardProps {
  dailyDhikr: DailyDhikr;
  isToday: boolean;
  activeDailyDhikrId: string | null;
  onAddDhikr: (date: string, dhikr: Omit<DailyDhikrItem, 'id'>) => void;
  onDeleteDhikr: (date: string, dhikrId: string) => void;
  onIncrementDhikr: (date: string, dhikrId: string) => void;
  onResetDhikr: (date: string, dhikrId: string) => void;
  onSelectDhikr?: (dhikrId: string) => void;
}

const StatusIcon = ({ status }: { status: DailyDhikrStatus }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'missed':
      return <XCircle className="w-4 h-4 text-red-500" />;
  }
};

const StatusBadge = ({ status, isToday }: { status: DailyDhikrStatus; isToday: boolean }) => {
  if (isToday) {
    return (
      <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
        Active
      </span>
    );
  }

  const labels: Record<DailyDhikrStatus, string> = {
    completed: '✅ Done',
    partial: '⚠️ Partial',
    missed: '❌ Missed',
  };

  const colors: Record<DailyDhikrStatus, string> = {
    completed: 'bg-green-500/20 text-green-600',
    partial: 'bg-yellow-500/20 text-yellow-600',
    missed: 'bg-red-500/20 text-red-600',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

export function DailyDhikrCard({
  dailyDhikr,
  isToday,
  activeDailyDhikrId,
  onAddDhikr,
  onDeleteDhikr,
  onIncrementDhikr,
  onResetDhikr,
  onSelectDhikr,
}: DailyDhikrCardProps) {
  const [isExpanded, setIsExpanded] = useState(isToday);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDhikr, setNewDhikr] = useState({ title: '', arabic: '', target: 33 });

  const isReadOnly = !isToday; // Past days are read-only

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleAddDhikr = () => {
    if (newDhikr.title.trim() && isToday) {
      onAddDhikr(dailyDhikr.date, {
        title: newDhikr.title.trim(),
        arabic: newDhikr.arabic.trim() || undefined,
        count: 0,
        target: newDhikr.target,
      });
      setNewDhikr({ title: '', arabic: '', target: 33 });
      setShowAddForm(false);
    }
  };

  const handleSelectDhikr = (dhikrId: string) => {
    if (isToday && onSelectDhikr) {
      onSelectDhikr(dhikrId);
    }
  };

  const totalCount = dailyDhikr.dhikrs.reduce((sum, d) => sum + d.count, 0);
  const totalTarget = dailyDhikr.dhikrs.reduce((sum, d) => sum + d.target, 0);

  return (
    <div className={`clay-button-rect w-full p-4 mb-3 transition-all flex flex-col justify-start items-stretch ${
      isToday 
        ? 'ring-2 ring-accent shadow-lg' 
        : isReadOnly 
          ? 'opacity-80' 
          : ''
    }`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
            isToday 
              ? 'bg-accent text-accent-foreground' 
              : 'bg-secondary text-muted-foreground'
          }`}>
            <span className="text-xs font-bold">Day</span>
            <span className="text-sm font-bold">{dailyDhikr.dayNumber}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-sm ${isToday ? 'text-accent' : 'text-foreground'}`}>
                {isToday ? 'Today' : formatDisplayDate(dailyDhikr.date)}
              </span>
              <StatusBadge status={dailyDhikr.status} isToday={isToday} />
              {isReadOnly && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Moon className="w-3 h-3" />
              <span>{dailyDhikr.hijriDate}</span>
            </div>
            {isToday && (
              <div className="text-[10px] text-muted-foreground mt-0.5">
                📅 {formatDisplayDate(dailyDhikr.date)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dailyDhikr.dhikrs.length > 0 && (
            <div className="text-right">
              <span className="text-sm font-semibold text-foreground">{totalCount}</span>
              <span className="text-xs text-muted-foreground">/{totalTarget}</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {/* Dhikr List */}
          {dailyDhikr.dhikrs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground mb-3">
              {isReadOnly ? 'No dhikr was recorded this day' : 'No dhikrs added yet. Start your daily dhikr!'}
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {dailyDhikr.dhikrs.map((dhikr) => {
                const isActive = activeDailyDhikrId === dhikr.id;
                
                return (
                  <div 
                    key={dhikr.id} 
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-green-500/20 ring-2 ring-green-500' 
                        : isReadOnly 
                          ? 'bg-muted/20' 
                          : 'bg-muted/30'
                    }`}
                  >
                    <div 
                      className={`flex-1 ${!isReadOnly ? 'cursor-pointer' : ''}`}
                      onClick={() => !isReadOnly && onIncrementDhikr(dailyDhikr.date, dhikr.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{dhikr.title}</span>
                        {dhikr.arabic && (
                          <span className="text-xs text-accent font-arabic">{dhikr.arabic}</span>
                        )}
                        {dhikr.count >= dhikr.target && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                        {isActive && (
                          <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                            COUNTING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              dhikr.count >= dhikr.target ? 'bg-green-500' : 'bg-accent'
                            }`}
                            style={{ width: `${Math.min((dhikr.count / dhikr.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[50px] text-right">
                          {dhikr.count}/{dhikr.target}
                        </span>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <div className="flex items-center gap-1 ml-2">
                        {/* Select for Home Screen button */}
                        <button
                          onClick={() => handleSelectDhikr(dhikr.id)}
                          className={`p-1.5 rounded-full transition-colors ${
                            isActive 
                              ? 'bg-green-500 text-white' 
                              : 'hover:bg-accent/20 text-accent'
                          }`}
                          title="Count on Home Screen"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onResetDhikr(dailyDhikr.date, dhikr.id)}
                          className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground"
                          title="Reset"
                        >
                          <span className="text-xs">↺</span>
                        </button>
                        <button
                          onClick={() => onDeleteDhikr(dailyDhikr.date, dhikr.id)}
                          className="p-1.5 rounded-full hover:bg-destructive/20 text-destructive/60 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Dhikr Form - Only for today */}
          {isToday && (
            <>
              {showAddForm ? (
                <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                  <input
                    type="text"
                    placeholder="Dhikr name (e.g., SubhanAllah)"
                    value={newDhikr.title}
                    onChange={(e) => setNewDhikr(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Arabic text (optional)"
                    value={newDhikr.arabic}
                    onChange={(e) => setNewDhikr(prev => ({ ...prev, arabic: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground font-arabic"
                    dir="rtl"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <select
                      value={newDhikr.target}
                      onChange={(e) => setNewDhikr(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                      className="flex-1 px-2 py-1.5 text-sm rounded-lg bg-background border border-border/50 text-foreground"
                    >
                      <option value={33}>33</option>
                      <option value={99}>99</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2 text-sm rounded-lg bg-muted/50 text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddDhikr}
                      className="flex-1 py-2 text-sm rounded-lg bg-accent text-accent-foreground font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors border-2 border-dashed border-accent/30"
                >
                  <Plus className="w-4 h-4 text-accent" />
                  <span className="text-sm text-accent font-medium">Add Dhikr to Today</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}