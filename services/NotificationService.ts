import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import QuranService from './QuranService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationSettings {
  enabled: boolean;
  dailyVerse: boolean;
  reminderTime: string;
  prayerReminders: boolean;
  studyReminders: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: true,
    dailyVerse: true,
    reminderTime: '09:00',
    prayerReminders: false,
    studyReminders: true,
  };

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    await this.requestPermissions();
    await this.loadSettings();
    await this.scheduleDailyNotifications();
  }

  private async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  private async loadSettings() {
    try {
      const settingsData = await AsyncStorage.getItem('notification_settings');
      if (settingsData) {
        this.settings = { ...this.settings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    if (newSettings.dailyVerse !== undefined || newSettings.reminderTime) {
      await this.scheduleDailyNotifications();
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private async scheduleDailyNotifications() {
    // Cancel existing notifications
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    if (!this.settings.enabled || !this.settings.dailyVerse) {
      return;
    }

    // Skip scheduling on web platform
    if (Platform.OS === 'web') {
      return;
    }

    const [hours, minutes] = this.settings.reminderTime.split(':').map(Number);

    // Schedule daily verse notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Verse 📖',
        body: 'Discover today\'s verse and continue your spiritual journey',
        data: { type: 'daily_verse' },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    // Schedule study reminder (if enabled)
    if (this.settings.studyReminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Study Reminder 🎓',
          body: 'Continue your memorization practice',
          data: { type: 'study_reminder' },
        },
        trigger: {
          hour: hours + 12 > 23 ? hours - 12 : hours + 12,
          minute: minutes,
          repeats: true,
        },
      });
    }
  }

  async sendDailyVerse() {
    if (!this.settings.enabled || !this.settings.dailyVerse) {
      return;
    }

    // Skip on web platform
    if (Platform.OS === 'web') {
      return;
    }

    const quranService = QuranService.getInstance();
    const surahs = quranService.getSurahs();
    const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Verse of the Day - ${randomSurah.name}`,
        body: 'Tap to read today\'s selected verse',
        data: { 
          type: 'daily_verse',
          surahId: randomSurah.id,
          ayah: Math.floor(Math.random() * randomSurah.verses) + 1,
        },
      },
      trigger: null, // Send immediately
    });
  }

  async scheduleMemorizationReminder(surahId: number, ayahNumber: number) {
    if (!this.settings.enabled || Platform.OS === 'web') return;

    const surah = QuranService.getInstance().getSurahById(surahId);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Memorization Review 🧠',
        body: `Time to review ${surah?.name} - Ayah ${ayahNumber}`,
        data: { 
          type: 'memorization_reminder',
          surahId,
          ayah: ayahNumber,
        },
      },
      trigger: {
        seconds: 60 * 60 * 2, // 2 hours from now
      },
    });
  }

  async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    switch (data.type) {
      case 'daily_verse':
        // Navigate to specific verse
        console.log('Navigate to daily verse:', data);
        break;
      case 'study_reminder':
        // Navigate to memorization screen
        console.log('Navigate to study screen');
        break;
      case 'memorization_reminder':
        // Navigate to specific memorization
        console.log('Navigate to memorization:', data);
        break;
    }
  }
}

export default NotificationService;