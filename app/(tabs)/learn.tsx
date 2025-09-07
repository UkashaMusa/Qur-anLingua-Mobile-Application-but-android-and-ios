import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Book, Clock, Target, Trophy, Bell } from 'lucide-react-native';

interface NotificationSettings {
  enabled: boolean;
  dailyVerse: boolean;
  studyReminders: boolean;
}

export default function LearnScreen() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    dailyVerse: true,
    studyReminders: true,
  });

  const [memorizationStats] = useState({
    memorizedVerses: 15,
    currentStreak: 5,
    achievements: ['First Verse Memorized', '7 Day Streak'],
  });

  const handleNotificationToggle = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [key]: value });
  };

  const startQuiz = () => {
    Alert.alert('Quiz', 'Quiz feature coming soon!');
  };

  const viewProgress = () => {
    Alert.alert('Progress', 'Detailed progress view coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Center</Text>
        <Text style={styles.subtitle}>Track your progress and customize your experience</Text>
      </View>

      {/* Memorization Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Book color="#4F46E5" size={24} />
            <Text style={styles.statNumber}>{memorizationStats.memorizedVerses}</Text>
            <Text style={styles.statLabel}>Verses Memorized</Text>
          </View>
          <View style={styles.statCard}>
            <Target color="#059669" size={24} />
            <Text style={styles.statNumber}>{memorizationStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy color="#D97706" size={24} />
            <Text style={styles.statNumber}>{memorizationStats.achievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={startQuiz}>
          <Book color="#4F46E5" size={20} />
          <Text style={styles.actionButtonText}>Start Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={viewProgress}>
          <Target color="#059669" size={20} />
          <Text style={styles.actionButtonText}>View Detailed Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Bell color="#6B7280" size={20} />
            <Text style={styles.settingLabel}>Enable Notifications</Text>
          </View>
          <Switch
            value={notificationSettings.enabled}
            onValueChange={(value) => handleNotificationToggle('enabled', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Book color="#6B7280" size={20} />
            <Text style={styles.settingLabel}>Daily Verse</Text>
          </View>
          <Switch
            value={notificationSettings.dailyVerse}
            onValueChange={(value) => handleNotificationToggle('dailyVerse', value)}
            disabled={!notificationSettings.enabled}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Clock color="#6B7280" size={20} />
            <Text style={styles.settingLabel}>Study Reminders</Text>
          </View>
          <Switch
            value={notificationSettings.studyReminders}
            onValueChange={(value) => handleNotificationToggle('studyReminders', value)}
            disabled={!notificationSettings.enabled}
          />
        </View>
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeText}>
            📱 Notifications are not available in web preview. 
            Install the app on your device to receive notifications.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#4F46E5' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#E0E7FF' },
  section: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    alignItems: 'center',
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: { fontSize: 16, fontWeight: '500', color: '#1F2937', marginLeft: 12 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { fontSize: 16, color: '#1F2937', marginLeft: 12 },
  webNotice: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  webNoticeText: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});
