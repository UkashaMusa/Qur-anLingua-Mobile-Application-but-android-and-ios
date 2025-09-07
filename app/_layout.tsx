import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import QuranService from '@/services/QuranService';
import AudioService from '@/services/AudioService';
import NotificationService from '@/services/NotificationService';
import UserService from '@/services/UserService';
import QuizService from '@/services/QuizService';
import MemorizationService from '@/services/MemorizationService';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize all services
      await QuranService.getInstance().initialize();
      await AudioService.getInstance().initialize();
      await NotificationService.getInstance().initialize();
      await UserService.getInstance().initialize();
      await QuizService.getInstance().initialize();
      await MemorizationService.getInstance().initialize();
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
