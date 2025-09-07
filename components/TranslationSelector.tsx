import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, Check, Globe } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Translation } from '@/types';
import QuranService from '@/services/QuranService';

interface TranslationSelectorProps {
  visible: boolean;
  selectedTranslationId: number;
  onClose: () => void;
  onSelect: (translationId: number) => void;
}

export function TranslationSelector({ 
  visible, 
  selectedTranslationId, 
  onClose, 
  onSelect 
}: TranslationSelectorProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (visible) {
      loadTranslations();
    }
  }, [visible]);

  const loadTranslations = () => {
    const quranService = QuranService.getInstance();
    setTranslations(quranService.getTranslations());
  };

  const handleSelect = (translationId: number) => {
    onSelect(translationId);
    onClose();
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
            <Globe size={24} color="#059669" />
            <Text style={styles.title}>Select Translation</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {translations.map((translation) => (
            <TouchableOpacity
              key={translation.id}
              style={[
                styles.translationItem,
                selectedTranslationId === translation.id && styles.selectedItem,
              ]}
              onPress={() => handleSelect(translation.id)}
            >
              <View style={styles.translationInfo}>
                <Text style={styles.translationName}>{translation.name}</Text>
                <Text style={styles.translationAuthor}>by {translation.author}</Text>
                <Text style={styles.translationLanguage}>{translation.language}</Text>
              </View>
              {selectedTranslationId === translation.id && (
                <Check size={24} color="#059669" />
              )}
            </TouchableOpacity>
          ))}
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
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    closeButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    translationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    selectedItem: {
      borderColor: '#059669',
      backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
    },
    translationInfo: {
      flex: 1,
    },
    translationName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    translationAuthor: {
      fontSize: 14,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 2,
    },
    translationLanguage: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontWeight: '500',
    },
  });
}