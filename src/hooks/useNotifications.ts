import { useEffect, useCallback, useRef } from 'react';
import { LocalNotifications, ScheduleOptions, PermissionStatus } from '@capacitor/local-notifications';
import { Haptics } from '@capacitor/haptics';
import { PrayerTimes } from './usePrayerTimes';

interface NotificationSettings {
  dhikrReminderEnabled: boolean;
  salatReminderEnabled: boolean;
  prayerTimes: PrayerTimes | null;
  hasDoneDhikrToday: boolean;
  vibrate: boolean;
}

// Check if running in Capacitor native environment
const isNative = (): boolean => {
  const cap = (window as { Capacitor?: object }).Capacitor;
  return typeof cap !== 'undefined' && (cap as { isNativePlatform?: () => boolean }).isNativePlatform?.();
};

// Request exact alarm permission for Android 12+ (API 31+)
const requestExactAlarmPermission = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    // Check if we have permission to schedule exact alarms
    const permStatus: PermissionStatus = await LocalNotifications.checkPermissions();
    console.log('Notification permission status:', permStatus);

    if (permStatus.display !== 'granted') {
      const result: PermissionStatus = await LocalNotifications.requestPermissions();
      console.log('Permission request result:', result);
    }
  } catch (error) {
    console.error('Failed to request exact alarm permission:', error);
  }
};

export function useNotifications(settings: NotificationSettings) {
  const scheduledNotificationsRef = useRef<Set<string>>(new Set());
  const lastScheduledDateRef = useRef<string>('');

  // Request permission for notifications
  const requestPermission = useCallback(async () => {
    if (!isNative()) {
      // Web fallback
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      return;
    }

    try {
      const result: PermissionStatus = await LocalNotifications.requestPermissions();
      console.log('Notification permission:', result.display);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }, []);

  // Schedule dhikr reminder notification
  const scheduleDhikrReminder = useCallback(async () => {
    if (!settings.dhikrReminderEnabled) return;

    const now = new Date();
    const today = now.toDateString();

    // Skip if already scheduled today
    if (scheduledNotificationsRef.current.has(`dhikr-${today}`)) return;

    // Schedule for 8 PM if user hasn't done dhikr
    const reminderTime = new Date(now);
    reminderTime.setHours(20, 0, 0, 0); // 8 PM

    // If it's already past 8 PM, schedule for next day
    if (now > reminderTime) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    if (isNative()) {
      try {
        const options: ScheduleOptions = {
          notifications: [
            {
              id: 1001,
              title: "Dhikr Reminder 🕌",
              body: "You haven't done dhikr today. Take a moment to remember Allah.",
              schedule: { at: reminderTime },
              sound: 'beep.wav',
              smallIcon: 'ic_stat_icon',
              actionTypeId: 'OPEN_APP',
            }
          ]
        };
        await LocalNotifications.schedule(options);
        if (settings.vibrate) {
          Haptics.vibrate();
        }
        scheduledNotificationsRef.current.add(`dhikr-${today}`);
        console.log('Dhikr reminder scheduled for:', reminderTime);
      } catch (error) {
        console.error('Failed to schedule dhikr reminder:', error);
      }
    } else {
      // Web fallback using setTimeout
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          if (!settings.hasDoneDhikrToday && 'Notification' in window && Notification.permission === 'granted') {
            new Notification("Dhikr Reminder 🕌", {
              body: "You haven't done dhikr today. Take a moment to remember Allah.",
              icon: '/favicon.ico',
              tag: 'dhikr-reminder',
            } as NotificationOptions);
          }
        }, timeUntilReminder);
        scheduledNotificationsRef.current.add(`dhikr-${today}`);
      }
    }
  }, [settings.dhikrReminderEnabled, settings.hasDoneDhikrToday, settings.vibrate]);

  // Cancel dhikr reminder if user has done dhikr
  const cancelDhikrReminder = useCallback(async () => {
    if (!isNative()) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
      console.log('Dhikr reminder cancelled - user completed dhikr');
    } catch (error) {
      console.error('Failed to cancel dhikr reminder:', error);
    }
  }, []);

  // Schedule salat reminders (10 min after azan, 2 min for Maghrib)
  const scheduleSalatReminders = useCallback(async () => {
    if (!settings.salatReminderEnabled || !settings.prayerTimes) return;

    const now = new Date();
    const today = now.toDateString();

    // Reset scheduled notifications at midnight
    if (lastScheduledDateRef.current !== today) {
      scheduledNotificationsRef.current.clear();
      lastScheduledDateRef.current = today;
    }

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
    const notifications: ScheduleOptions['notifications'] = [];

    prayers.forEach((prayer, index) => {
      const key = `salat-${prayer}-${today}`;
      if (scheduledNotificationsRef.current.has(key)) return;

      const prayerTime = settings.prayerTimes![prayer];
      const [h, m] = prayerTime.split(':').map(Number);

      const reminderTime = new Date(now);
      reminderTime.setHours(h, m, 0, 0);

      // Add delay: 2 minutes for Maghrib, 10 minutes for others
      const delayMinutes = prayer === 'Maghrib' ? 2 : 10;
      reminderTime.setMinutes(reminderTime.getMinutes() + delayMinutes);

      // Skip if time has passed
      if (reminderTime <= now) return;

      scheduledNotificationsRef.current.add(key);

      const prayerNames: Record<string, string> = {
        Fajr: 'Fajr (Dawn)',
        Dhuhr: 'Dhuhr (Noon)',
        Asr: 'Asr (Afternoon)',
        Maghrib: 'Maghrib (Sunset)',
        Isha: 'Isha (Night)'
      };

      if (notifications) {
        notifications.push({
          id: 2001 + index,
          title: `${prayerNames[prayer]} Prayer Time 🕌`,
          body: `It's time for ${prayerNames[prayer]} prayer. May Allah accept your prayers.`,
          schedule: { at: reminderTime },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon',
          actionTypeId: 'OPEN_APP',
        });
      }
    });

    if (notifications?.length === 0) return;

    if (isNative()) {
      try {
        await LocalNotifications.schedule({ notifications });
        if (settings.vibrate) {
          Haptics.vibrate();
        }
        console.log('Salat reminders scheduled:', notifications?.length);
      } catch (error) {
        console.error('Failed to schedule salat reminders:', error);
      }
    } else {
      // Web fallback
      notifications?.forEach((notif) => {
        if (notif.schedule?.at) {
          const timeUntil = notif.schedule.at.getTime() - now.getTime();
          if (timeUntil > 0) {
            setTimeout(() => {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notif.title, {
                  body: notif.body,
                  icon: '/favicon.ico',
                  tag: `salat-${notif.id}`,
                } as NotificationOptions);
              }
            }, timeUntil);
          }
        }
      });
    }
  }, [settings.salatReminderEnabled, settings.prayerTimes, settings.vibrate]);

  // Initialize and schedule notifications
  useEffect(() => {
    const initNotifications = async () => {
      await requestPermission();
      await requestExactAlarmPermission();

      // Reschedule all notifications on app startup for reliability
      if (settings.salatReminderEnabled && settings.prayerTimes) {
        scheduleSalatReminders();
      }
      if (settings.dhikrReminderEnabled && !settings.hasDoneDhikrToday) {
        scheduleDhikrReminder();
      }
    };

    initNotifications();
  }, [requestPermission, scheduleDhikrReminder, scheduleSalatReminders, settings.dhikrReminderEnabled, settings.hasDoneDhikrToday, settings.prayerTimes, settings.salatReminderEnabled]);

  // Schedule dhikr reminder
  useEffect(() => {
    if (settings.dhikrReminderEnabled && !settings.hasDoneDhikrToday) {
      scheduleDhikrReminder();
    } else if (settings.hasDoneDhikrToday) {
      cancelDhikrReminder();
    }
  }, [settings.dhikrReminderEnabled, settings.hasDoneDhikrToday, scheduleDhikrReminder, cancelDhikrReminder]);

  // Schedule salat reminders
  useEffect(() => {
    if (settings.salatReminderEnabled && settings.prayerTimes) {
      scheduleSalatReminders();
    }
  }, [settings.salatReminderEnabled, settings.prayerTimes, scheduleSalatReminders]);

  return {
    requestPermission,
    scheduleDhikrReminder,
    scheduleSalatReminders,
    cancelDhikrReminder,
    isNative: isNative(),
  };
}
