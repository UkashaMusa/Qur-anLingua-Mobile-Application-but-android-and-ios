import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Sun, Type, Volume2, Bell, Cloud, User, LogOut, Info, Heart, DollarSign, Users, BookOpen as BookOpenIcon } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { AuthModal } from '@/components/AuthModal';
import UserService from '@/services/UserService';
import NotificationService from '@/services/NotificationService';

export default function ProfileScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fontSize, setFontSize] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [syncing, setSyncing] = useState(false);
  
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    try {
      const userService = UserService.getInstance();
      const notificationService = NotificationService.getInstance();
      
      await userService.initialize();
      await notificationService.initialize();
      
      setAuthState(userService.getAuthState());
      setNotifications(notificationService.getSettings().enabled);
      
      // Subscribe to auth changes
      userService.subscribe((state) => {
        setAuthState(state);
      });
    } catch (error) {
      console.error('Error initializing profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const userService = UserService.getInstance();
      await userService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthSuccess = () => {
    // Auth state will be updated via subscription
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const userService = UserService.getInstance();
      const result = await userService.syncData();
      if (!result.success) {
        console.error('Sync failed:', result.error);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotifications(enabled);
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ enabled });
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleDonation = (cause: string, amount?: number) => {
    // In a real app, this would integrate with payment processing
    console.log(`Donating ${amount ? `$${amount}` : 'custom amount'} to ${cause}`);
    // For now, just show an alert
    alert(`Thank you for your interest in donating to ${cause}. Payment integration would be implemented here.`);
  };

  if (!authState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {authState.isAuthenticated ? (
          <>
            {/* User Profile */}
            <View style={styles.profileCard}>
              <Image source={{ uri: authState.user.avatar }} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{authState.user.name}</Text>
                <Text style={styles.userEmail}>{authState.user.email}</Text>
                <Text style={styles.joinDate}>
                  Joined {new Date(authState.user.joinDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>15</Text>
                <Text style={styles.statLabel}>Surahs Read</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2,847</Text>
                <Text style={styles.statLabel}>Ayahs Read</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>25</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.signInPrompt}>
            <User size={48} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Text style={styles.signInTitle}>Sign in to sync your progress</Text>
            <Text style={styles.signInDescription}>
              Create an account to save your bookmarks, track your progress, and sync across devices.
            </Text>
            <TouchableOpacity style={styles.signInButton} onPress={() => setShowAuthModal(true)}>
              <Text style={styles.signInButtonText}>Sign In / Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Type size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
              <Text style={styles.settingTitle}>Font Size</Text>
            </View>
            <Text style={styles.settingValue}>{fontSize}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Audio & Reading</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Volume2 size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
              <Text style={styles.settingTitle}>Auto-play Audio</Text>
            </View>
            <Switch
              value={autoPlay}
              onValueChange={setAutoPlay}
              trackColor={{ false: '#D1D5DB', true: '#059669' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <Text style={styles.settingTitle}>Translation Language</Text>
            </View>
            <Text style={styles.settingValue}>{language}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
              <Text style={styles.settingTitle}>Daily Reminders</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#D1D5DB', true: '#059669' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🕰️</Text>
              <Text style={styles.settingTitle}>Reminder Time</Text>
            </View>
            <Text style={styles.settingValue}>9:00 AM</Text>
          </TouchableOpacity>
        </View>

        {authState.isAuthenticated && (
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleSyncData}>
              <View style={styles.settingLeft}>
                <Cloud size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
                <Text style={styles.settingTitle}>Sync Data</Text>
              </View>
              <Text style={styles.settingValue}>
                {syncing ? 'Syncing...' : 'Last synced: 2 hrs ago'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={styles.settingLeft}>
                <LogOut size={20} color="#EF4444" />
                <Text style={[styles.settingTitle, { color: '#EF4444' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Info size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
              <Text style={styles.settingTitle}>App Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📖</Text>
              <Text style={styles.settingTitle}>Terms & Privacy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💬</Text>
              <Text style={styles.settingTitle}>Contact Support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </SafeAreaView>
  );
}

function createStyles(colorScheme: 'light' | 'dark' | null | undefined) {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#F9FAFB',
    },
    header: {
      padding: 20,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 16,
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 4,
    },
    joinDate: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
    },
    signInPrompt: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    signInTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    signInDescription: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    signInButton: {
      backgroundColor: '#059669',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    signInButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    settingsSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      fontSize: 20,
      marginRight: 12,
      width: 20,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginLeft: 12,
    },
    settingValue: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    charityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    charityIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#059669',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    charityContent: {
      flex: 1,
    },
    charityTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    charityDescription: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      lineHeight: 18,
    },
    quickDonationContainer: {
      backgroundColor: isDark ? '#374151' : '#F9FAFB',
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    quickDonationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 12,
      textAlign: 'center',
    },
    donationAmounts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    donationAmountButton: {
      backgroundColor: '#059669',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
    },
    donationAmountText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    customDonationButton: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderWidth: 2,
      borderColor: '#059669',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    customDonationText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#059669',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
  });
}