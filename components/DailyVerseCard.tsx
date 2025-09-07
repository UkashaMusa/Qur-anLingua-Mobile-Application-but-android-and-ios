import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, BookOpen } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import MemorizationService from '@/services/MemorizationService';
import QuranService from '@/services/QuranService';

interface DailyVerseCardProps {
  onVersePress: (surahId: number, ayah: number) => void;
}

export function DailyVerseCard({ onVersePress }: DailyVerseCardProps) {
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    try {
      const memorizationService = MemorizationService.getInstance();
      const verse = await memorizationService.getDailyVerse();
      setDailyVerse(verse);
    } catch (error) {
      console.error('Error loading daily verse:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dailyVerse) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onVersePress(dailyVerse.surahId, dailyVerse.ayah)}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Calendar size={20} color="#059669" />
        </View>
        <Text style={styles.title}>Verse of the Day</Text>
      </View>
      
      <Text style={styles.verseText} numberOfLines={3}>
        {dailyVerse.text}
      </Text>
      
      <View style={styles.footer}>
        <BookOpen size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
        <Text style={styles.reference}>
          Surah {dailyVerse.surahId} - Ayah {dailyVerse.ayah}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colorScheme: 'light' | 'dark' | null | undefined) {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      borderLeftWidth: 4,
      borderLeftColor: '#059669',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#ECFDF5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    verseText: {
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 16,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    reference: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontWeight: '500',
    },
  });
}