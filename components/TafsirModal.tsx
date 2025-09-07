import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { X, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Verse } from '@/types';
import QuranService from '@/services/QuranService';

interface TafsirModalProps {
  visible: boolean;
  verse: Verse | null;
  onClose: () => void;
}

export function TafsirModal({ visible, verse, onClose }: TafsirModalProps) {
  const [tafsir, setTafsir] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (visible && verse) {
      loadTafsir();
    }
  }, [visible, verse]);

  const loadTafsir = async () => {
    if (!verse) return;
    
    setLoading(true);
    try {
      const quranService = QuranService.getInstance();
      const tafsirText = await quranService.getTafsir(verse.id);
      setTafsir(tafsirText);
    } catch (error) {
      console.error('Error loading tafsir:', error);
      setTafsir('Unable to load tafsir at this time.');
    } finally {
      setLoading(false);
    }
  };

  if (!verse) return null;

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
            <Text style={styles.title}>Tafsir</Text>
            <Text style={styles.subtitle}>
              Surah {verse.surah} - Ayah {verse.ayah}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Verse Display */}
          <View style={styles.verseContainer}>
            <Text style={styles.arabicText}>{verse.arabic}</Text>
            <Text style={styles.translationText}>{verse.translation}</Text>
            {verse.transliteration && (
              <Text style={styles.transliterationText}>{verse.transliteration}</Text>
            )}
          </View>

          {/* Tafsir Content */}
          <View style={styles.tafsirContainer}>
            <View style={styles.tafsirHeader}>
              <BookOpen size={24} color="#059669" />
              <Text style={styles.tafsirTitle}>Commentary & Explanation</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading tafsir...</Text>
              </View>
            ) : (
              <Text style={styles.tafsirText}>{tafsir}</Text>
            )}
          </View>

          {/* Additional Information */}
          <View style={styles.additionalInfo}>
            <Text style={styles.infoTitle}>Verse Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Revelation:</Text>
              <Text style={styles.infoValue}>Meccan</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Theme:</Text>
              <Text style={styles.infoValue}>Worship and Guidance</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Related Verses:</Text>
              <Text style={styles.infoValue}>2:21, 3:102, 4:1</Text>
            </View>
          </View>
        </ScrollView>
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
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    verseContainer: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    arabicText: {
      fontSize: 22,
      lineHeight: 36,
      textAlign: 'right',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 16,
      fontWeight: '500',
    },
    translationText: {
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 12,
    },
    transliterationText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontStyle: 'italic',
    },
    tafsirContainer: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    tafsirHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    tafsirTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    tafsirText: {
      fontSize: 16,
      lineHeight: 26,
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
    additionalInfo: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 16,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
  });
}