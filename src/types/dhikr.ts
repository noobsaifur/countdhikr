export interface Dhikr {
  id: string;
  title: string;
  arabic?: string;
  target: number;
  count: number;
}

export interface Dua {
  id: string;
  arabic: string;
  desc: string;
}

export interface DailyDhikrItem {
  id: string;
  title: string;
  arabic?: string;
  count: number;
  target: number;
}

export type DailyDhikrStatus = 'completed' | 'partial' | 'missed';

export interface DailyDhikr {
  id: string;
  date: string; // YYYY-MM-DD
  hijriDate: string;
  dayNumber: number; // Auto-calculated: days since tracking started
  status: DailyDhikrStatus;
  dhikrs: DailyDhikrItem[];
}

export interface DailyDhikrSettings {
  trackingStartDate: string | null; // YYYY-MM-DD when user started tracking
  activeDailyDhikrDate: string | null; // Currently active daily dhikr date for home screen
  activeDailyDhikrId: string | null; // Currently active dhikr item ID within today's card for home screen counter
  dayNumberOffset: number; // Offset to add to day number (e.g., 172 means Day 1 becomes Day 173)
}

export interface SelectedCountry {
  name: string;
  code: string;
  lat: number;
  lng: number;
  method: number;
}

export interface AppSettings {
  vibrate: boolean;
  vibrateIntensity: 'light' | 'medium' | 'strong';
  sound: boolean;
  darkMode: boolean;
  reminderNotification: boolean;
  dhikrReminderEnabled: boolean;
  salatReminderEnabled: boolean;
  prayerNotifications: boolean;
  azanEnabled: boolean;
  azanSound: boolean;
  azanVibrate: boolean;
  prayerMethod: number;
  customAzanUrl: string | null;
  selectedCountry: SelectedCountry | null;
  useAutoLocation: boolean;
}

export const PRAYER_METHODS = [
  { id: 0, name: 'Shia Ithna-Ashari' },
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 7, name: 'Institute of Geophysics, Tehran' },
  { id: 8, name: 'Gulf Region (UAE, Qatar, Bahrain)' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Singapore' },
  { id: 12, name: 'France' },
  { id: 13, name: 'Turkey' },
  { id: 14, name: 'Russia' },
  { id: 16, name: 'Dubai (UAE)' },
] as const;

export const AZAN_SOUNDS = [
  { id: 'makkah', name: 'Makkah Azan', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'medina', name: 'Medina Azan', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'mishary', name: 'Mishary Rashid', url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  { id: 'egypt', name: 'Egyptian Style', url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
] as const;

export interface AppState {
  dhikrs: Dhikr[];
  duas: Dua[];
  dailyDhikrs: DailyDhikr[];
  dailyDhikrSettings: DailyDhikrSettings;
  activeDhikrId: string | null;
  generalCount: number;
  settings: AppSettings;
}
