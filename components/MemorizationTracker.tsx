import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Brain, CircleCheck as CheckCircle, Circle, Target, Calendar, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Verse } from '@/types';
import MemorizationService from '@/services/MemorizationService';

interface MemorizationTrackerProps {
  visible: boolean;
  surahId: number;
  verses: Verse[];
  onClose: () => void;
}

export function MemorizationTracker({ visible, surahId, verses, onClose }: MemorizationTrackerProps) {
  const [memorizedAyahs, setMemorizedAyahs] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (visible) {
      loadMemorizationProgress();
    }
  }, [visible, surahId]);

  const loadMemorizationProgress = async () => {
    try {
      const memorizationService = MemorizationService.getInstance();
      const progressData = memorizationService.getProgressForSurah(surahId);
      
      if (progressData) {
        setMemorizedAyahs(new Set(progressData.ayahsMemorized));
        setProgress(memorizationService.getMemorizationPercentage(surahId, verses.length));
      } else {
        setMemorizedAyahs(new Set());
        setProgress(0);
      }
    } catch (error) {
      console.error('Error loading memorization progress:', error);
    }
  };

  const toggleAyahMemorization = async (ayahNumber: number) => {
    try {
      const memorizationService = MemorizationService.getInstance();
      
      if (memorizedAyahs.has(ayahNumber)) {
        await memorizationService.unmarkAyahMemorized(surahId, ayahNumber);
        setMemorizedAyahs(prev => {
          const newSet = new Set(prev);
          newSet.delete(ayahNumber);
          return newSet;
        });
      } else {
        await memorizationService.markAyahMemorized(surahId, ayahNumber);
        setMemorizedAyahs(prev => new Set([...prev, ayahNumber]));
      }
      
      // Update progress
      const newProgress = memorizationService.getMemorizationPercentage(surahId, verses.length);
      setProgress(newProgress);
    } catch (error) {
      console.error('Error toggling ayah memorization:', error);
    }
  };

  const startMemorizationSession = async () => {
    try {
      const unmemorizedAyahs = verses
        .filter(verse => !memorizedAyahs.has(verse.ayah))
        .map(verse => verse.ayah)
        .slice(0, 3); // Start with 3 ayahs

      if (unmemorizedAyahs.length === 0) {
        console.log('All ayahs already memorized!');
        return;
      }

      const memorizationService = MemorizationService.getInstance();
      const sessionId = await memorizationService.startMemorizationSession(surahId, unmemorizedAyahs);
      
      // In a real app, this would navigate to a memorization practice screen
      console.log('Started memorization session:', sessionId);
      
      // Simulate completion after 5 seconds
      setTimeout(async () => {
        await memorizationService.completeMemorizationSession(sessionId, 85, 3);
        loadMemorizationProgress();
      }, 5000);
      
    } catch (error) {
      console.error('Error starting memorization session:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Memorization Tracker</Text>
            <Text style={styles.subtitle}>Track your progress</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Brain size={24} color="#059669" />
            <Text style={styles.progressTitle}>Progress: {progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {memorizedAyahs.size} of {verses.length} ayahs memorized
          </Text>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={startMemorizationSession}
          >
            <Target size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Practice Session</Text>
          </TouchableOpacity>
        </View>

        {/* Ayah List */}
        <View style={styles.ayahList}>
          <Text style={styles.sectionTitle}>Mark Memorized Ayahs</Text>
          {verses.map((verse) => (
            <TouchableOpacity
              key={verse.id}
              style={styles.ayahItem}
              onPress={() => toggleAyahMemorization(verse.ayah)}
            >
              <View style={styles.ayahHeader}>
                <Text style={styles.ayahNumber}>Ayah {verse.ayah}</Text>
                {memorizedAyahs.has(verse.ayah) ? (
                  <CheckCircle size={24} color="#059669" />
                ) : (
                  <Circle size={24} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
                )}
              </View>
              <Text style={styles.ayahText} numberOfLines={2}>
                {verse.translation}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    closeButton: {
      padding: 8,
    },
    progressCard: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      margin: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    progressBar: {
      height: 8,
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      borderRadius: 4,
      marginBottom: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#059669',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      marginBottom: 16,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#059669',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    startButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    ayahList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 16,
    },
    ayahItem: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    ayahHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    ayahNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: '#059669',
    },
    ayahText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
  });
}