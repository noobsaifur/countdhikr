import { useState, useEffect, useCallback } from 'react';
import { AppState, Dhikr, Dua, AppSettings, DailyDhikr, DailyDhikrItem, DailyDhikrStatus, DailyDhikrSettings } from '@/types/dhikr';

const STORAGE_KEY = 'dhikr-counter-state';

const defaultDailyDhikrSettings: DailyDhikrSettings = {
  trackingStartDate: null,
  activeDailyDhikrDate: null,
  activeDailyDhikrId: null,
  dayNumberOffset: 0,
};

const defaultState: AppState = {
  dhikrs: [],
  duas: [],
  dailyDhikrs: [],
  dailyDhikrSettings: defaultDailyDhikrSettings,
  activeDhikrId: null,
  generalCount: 0,
  settings: {
    vibrate: true,
    vibrateIntensity: 'medium' as const,
    sound: false,
    darkMode: false,
    reminderNotification: false,
    dhikrReminderEnabled: true,
    salatReminderEnabled: true,
    prayerNotifications: true,
    azanEnabled: false,
    azanSound: true,
    azanVibrate: true,
    prayerMethod: 8,
    customAzanUrl: null,
    selectedCountry: null,
    useAutoLocation: true,
  },
};

// Get Hijri date from API
async function fetchHijriDate(dateStr: string): Promise<string> {
  try {
    // Format date for API: DD-MM-YYYY
    const [year, month, day] = dateStr.split('-');
    const apiDate = `${day}-${month}-${year}`;
    const response = await fetch(`https://api.aladhan.com/v1/gToH/${apiDate}`);
    const data = await response.json();
    if (data.code === 200 && data.data) {
      const hijri = data.data.hijri;
      return `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
    }
  } catch (e) {
    console.error('Failed to fetch Hijri date:', e);
  }
  return 'Hijri Date';
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get formatted display date
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

// Calculate day number from start date with offset
function calculateDayNumber(startDate: string, currentDate: string, offset: number = 0): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1 + offset; // Day 1 is the start date, plus offset
}

// Calculate status based on dhikrs
function calculateStatus(dhikrs: DailyDhikrItem[]): DailyDhikrStatus {
  if (dhikrs.length === 0) return 'missed';
  
  const totalCount = dhikrs.reduce((sum, d) => sum + d.count, 0);
  if (totalCount === 0) return 'missed';
  
  const allCompleted = dhikrs.every(d => d.count >= d.target);
  if (allCompleted) return 'completed';
  
  return 'partial';
}

// Get all dates between two dates
function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function useDhikrStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          ...parsed,
          dailyDhikrSettings: { ...defaultDailyDhikrSettings, ...parsed.dailyDhikrSettings }
        };
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
    return defaultState;
  });

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  // Apply dark mode
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  // Handle notification permission
  useEffect(() => {
    if (state.settings.reminderNotification) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Dhikr Reminder', {
              body: 'Don\'t forget your daily dhikr!',
              icon: '/favicon.ico',
            });
          } else {
            setState(prev => ({
              ...prev,
              settings: { ...prev.settings, reminderNotification: false }
            }));
          }
        });
      }
    }
  }, [state.settings.reminderNotification]);

  // Initialize today's daily dhikr card and auto-create missed days synchronously on startup
  useEffect(() => {
    const todayStr = getTodayDateString();
    
    setState(prev => {
      const todayExists = prev.dailyDhikrs.some(d => d.date === todayStr);
      if (todayExists) return prev;

      const isFirstTime = !prev.dailyDhikrSettings.trackingStartDate;
      const trackingStartDate = prev.dailyDhikrSettings.trackingStartDate || todayStr;
      
      // Get all dates that should exist
      const allDates = getDatesBetween(trackingStartDate, todayStr);
      const existingDates = new Set(prev.dailyDhikrs.map(d => d.date));
      
      // Create missing date cards synchronously
      const newCards: DailyDhikr[] = [];
      const offset = prev.dailyDhikrSettings.dayNumberOffset || 0;
      
      for (const dateStr of allDates) {
        if (!existingDates.has(dateStr)) {
          const dayNumber = calculateDayNumber(trackingStartDate, dateStr, offset);
          const isToday = dateStr === todayStr;
          
          newCards.push({
            id: crypto.randomUUID(),
            date: dateStr,
            hijriDate: 'Hijri Date', // Default placeholder, fetched in background
            dayNumber,
            status: isToday ? 'partial' : 'missed', // Past days with no dhikr are missed
            dhikrs: [],
          });
        }
      }
      
      if (newCards.length > 0) {
        return {
          ...prev,
          dailyDhikrSettings: {
            ...prev.dailyDhikrSettings,
            trackingStartDate: isFirstTime ? todayStr : prev.dailyDhikrSettings.trackingStartDate,
            activeDailyDhikrDate: todayStr,
          },
          dailyDhikrs: [...prev.dailyDhikrs, ...newCards],
        };
      }
      
      return prev;
    });
  }, []);

  // Background fetch of Hijri dates for cards with placeholder
  useEffect(() => {
    const fetchMissingHijriDates = async () => {
      const cardsWithPlaceholder = state.dailyDhikrs.filter(d => d.hijriDate === 'Hijri Date');
      if (cardsWithPlaceholder.length === 0) return;
      
      // Prioritize today's date first, then newest history cards
      const todayStr = getTodayDateString();
      const sortedCards = [...cardsWithPlaceholder].sort((a, b) => {
        if (a.date === todayStr) return -1;
        if (b.date === todayStr) return 1;
        return b.date.localeCompare(a.date);
      });

      // Limit background updates to at most 3 cards per batch to avoid rate limiting and UI lag
      for (const card of sortedCards.slice(0, 3)) {
        const hijri = await fetchHijriDate(card.date);
        if (hijri && hijri !== 'Hijri Date') {
          setState(prev => ({
            ...prev,
            dailyDhikrs: prev.dailyDhikrs.map(d => 
              d.id === card.id ? { ...d, hijriDate: hijri } : d
            )
          }));
          // 500ms delay between fetches to respect API limits
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    };

    const hasPlaceholders = state.dailyDhikrs.some(d => d.hijriDate === 'Hijri Date');
    if (hasPlaceholders) {
      const timer = setTimeout(fetchMissingHijriDates, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.dailyDhikrs]);


  const getActiveDhikr = useCallback((): Dhikr | null => {
    if (!state.activeDhikrId) return null;
    return state.dhikrs.find(d => d.id === state.activeDhikrId) || null;
  }, [state.activeDhikrId, state.dhikrs]);

  const getActiveCount = useCallback((): number => {
    const active = getActiveDhikr();
    return active ? active.count : state.generalCount;
  }, [getActiveDhikr, state.generalCount]);

  const getActiveTarget = useCallback((): number => {
    const active = getActiveDhikr();
    return active ? active.target : 100;
  }, [getActiveDhikr]);

  const getActiveName = useCallback((): string => {
    const active = getActiveDhikr();
    return active ? active.title : 'General Counter';
  }, [getActiveDhikr]);

  const increment = useCallback(() => {
    setState(prev => {
      if (prev.activeDhikrId) {
        return {
          ...prev,
          dhikrs: prev.dhikrs.map(d =>
            d.id === prev.activeDhikrId ? { ...d, count: d.count + 1 } : d
          ),
        };
      }
      return { ...prev, generalCount: prev.generalCount + 1 };
    });
  }, []);

  const resetCounter = useCallback(() => {
    setState(prev => {
      if (prev.activeDhikrId) {
        return {
          ...prev,
          dhikrs: prev.dhikrs.map(d =>
            d.id === prev.activeDhikrId ? { ...d, count: 0 } : d
          ),
        };
      }
      return { ...prev, generalCount: 0 };
    });
  }, []);

  const saveCount = useCallback(() => {
    return;
  }, []);

  const setActiveDhikr = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeDhikrId: id }));
  }, []);

  const addDhikr = useCallback((dhikr: Omit<Dhikr, 'id' | 'count'>) => {
    const newDhikr: Dhikr = {
      ...dhikr,
      id: crypto.randomUUID(),
      count: 0,
    };
    setState(prev => ({
      ...prev,
      dhikrs: [...prev.dhikrs, newDhikr],
      activeDhikrId: newDhikr.id,
    }));
    return newDhikr.id;
  }, []);

  const deleteDhikr = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      dhikrs: prev.dhikrs.filter(d => d.id !== id),
      activeDhikrId: prev.activeDhikrId === id ? null : prev.activeDhikrId,
    }));
  }, []);

  const addDua = useCallback((dua: Omit<Dua, 'id'>) => {
    const newDua: Dua = {
      ...dua,
      id: crypto.randomUUID(),
    };
    setState(prev => ({
      ...prev,
      duas: [...prev.duas, newDua],
    }));
  }, []);

  const deleteDua = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      duas: prev.duas.filter(d => d.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const factoryReset = useCallback(() => {
    setState(defaultState);
  }, []);

  // Daily Dhikr functions
  const getTodayDhikr = useCallback((): DailyDhikr | null => {
    const todayStr = getTodayDateString();
    return state.dailyDhikrs.find(d => d.date === todayStr) || null;
  }, [state.dailyDhikrs]);

  const getDailyDhikrByDate = useCallback((date: string): DailyDhikr | null => {
    return state.dailyDhikrs.find(d => d.date === date) || null;
  }, [state.dailyDhikrs]);

  const addDhikrToDay = useCallback((date: string, dhikr: Omit<DailyDhikrItem, 'id'>) => {
    const todayStr = getTodayDateString();
    if (date !== todayStr) return; // Can only add to today
    
    const newDhikrItem: DailyDhikrItem = {
      ...dhikr,
      id: crypto.randomUUID(),
    };
    
    setState(prev => ({
      ...prev,
      dailyDhikrs: prev.dailyDhikrs.map(d => {
        if (d.date === date) {
          const newDhikrs = [...d.dhikrs, newDhikrItem];
          return { 
            ...d, 
            dhikrs: newDhikrs,
            status: calculateStatus(newDhikrs),
          };
        }
        return d;
      }),
    }));
  }, []);

  const deleteDhikrFromDay = useCallback((date: string, dhikrId: string) => {
    const todayStr = getTodayDateString();
    if (date !== todayStr) return; // Can only delete from today
    
    setState(prev => ({
      ...prev,
      dailyDhikrs: prev.dailyDhikrs.map(d => {
        if (d.date === date) {
          const newDhikrs = d.dhikrs.filter(dh => dh.id !== dhikrId);
          return { 
            ...d, 
            dhikrs: newDhikrs,
            status: calculateStatus(newDhikrs),
          };
        }
        return d;
      }),
    }));
  }, []);

  const incrementDayDhikr = useCallback((date: string, dhikrId: string) => {
    const todayStr = getTodayDateString();
    if (date !== todayStr) return; // Can only increment today
    
    setState(prev => ({
      ...prev,
      dailyDhikrs: prev.dailyDhikrs.map(d => {
        if (d.date === date) {
          const newDhikrs = d.dhikrs.map(dh =>
            dh.id === dhikrId ? { ...dh, count: dh.count + 1 } : dh
          );
          return {
            ...d,
            dhikrs: newDhikrs,
            status: calculateStatus(newDhikrs),
          };
        }
        return d;
      }),
    }));
  }, []);

  const resetDayDhikr = useCallback((date: string, dhikrId: string) => {
    const todayStr = getTodayDateString();
    if (date !== todayStr) return; // Can only reset today
    
    setState(prev => ({
      ...prev,
      dailyDhikrs: prev.dailyDhikrs.map(d => {
        if (d.date === date) {
          const newDhikrs = d.dhikrs.map(dh =>
            dh.id === dhikrId ? { ...dh, count: 0 } : dh
          );
          return {
            ...d,
            dhikrs: newDhikrs,
            status: calculateStatus(newDhikrs),
          };
        }
        return d;
      }),
    }));
  }, []);

  // Set active daily dhikr item for home screen counter
  const setActiveDailyDhikrItem = useCallback((dhikrId: string | null) => {
    setState(prev => ({
      ...prev,
      dailyDhikrSettings: {
        ...prev.dailyDhikrSettings,
        activeDailyDhikrId: dhikrId,
      },
      // Clear old system active dhikr when switching to daily mode
      activeDhikrId: dhikrId ? null : prev.activeDhikrId,
    }));
  }, []);

  // Get active daily dhikr item from today's card
  const getActiveDailyDhikrItem = useCallback((): DailyDhikrItem | null => {
    const activeDhikrId = state.dailyDhikrSettings.activeDailyDhikrId;
    if (!activeDhikrId) return null;
    
    const todayStr = getTodayDateString();
    const todayCard = state.dailyDhikrs.find(d => d.date === todayStr);
    if (!todayCard) return null;
    
    return todayCard.dhikrs.find(d => d.id === activeDhikrId) || null;
  }, [state.dailyDhikrSettings.activeDailyDhikrId, state.dailyDhikrs]);

  // Check if daily dhikr mode is active
  const isDailyDhikrMode = useCallback((): boolean => {
    return state.dailyDhikrSettings.activeDailyDhikrId !== null;
  }, [state.dailyDhikrSettings.activeDailyDhikrId]);

  // Set day number offset and recalculate all day numbers
  const setDayNumberOffset = useCallback((offset: number) => {
    setState(prev => {
      const trackingStartDate = prev.dailyDhikrSettings.trackingStartDate;
      if (!trackingStartDate) return prev;
      
      // Recalculate all day numbers with new offset
      const updatedDailyDhikrs = prev.dailyDhikrs.map(d => ({
        ...d,
        dayNumber: calculateDayNumber(trackingStartDate, d.date, offset),
      }));
      
      return {
        ...prev,
        dailyDhikrSettings: {
          ...prev.dailyDhikrSettings,
          dayNumberOffset: offset,
        },
        dailyDhikrs: updatedDailyDhikrs,
      };
    });
  }, []);

  return {
    state,
    getActiveDhikr,
    getActiveCount,
    getActiveTarget,
    getActiveName,
    increment,
    resetCounter,
    saveCount,
    setActiveDhikr,
    addDhikr,
    deleteDhikr,
    addDua,
    deleteDua,
    updateSettings,
    factoryReset,
    // Daily dhikr functions
    getTodayDhikr,
    getDailyDhikrByDate,
    addDhikrToDay,
    deleteDhikrFromDay,
    incrementDayDhikr,
    resetDayDhikr,
    setActiveDailyDhikrItem,
    getActiveDailyDhikrItem,
    isDailyDhikrMode,
    setDayNumberOffset,
    // Utilities
    getTodayDateString,
    formatDisplayDate,
  };
}