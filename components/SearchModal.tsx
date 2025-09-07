import { View, Text, Modal, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Verse } from '@/types';
import QuranService from '@/services/QuranService';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onVerseSelect: (verse: Verse) => void;
}

export function SearchModal({ visible, onClose, onVerseSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (query.length >= 2) {
      searchVerses();
    } else {
      setResults([]);
    }
  }, [query]);

  const searchVerses = async () => {
    setLoading(true);
    try {
      const quranService = QuranService.getInstance();
      const searchResults = await quranService.searchVerses(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerseSelect = (verse: Verse) => {
    onVerseSelect(verse);
    onClose();
    setQuery('');
    setResults([]);
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
          <Text style={styles.title}>Search Quran</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search verses, keywords..."
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
        </View>

        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <View style={styles.noResultsContainer}>
              <BookOpen size={48} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
              <Text style={styles.noResultsText}>No verses found</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords or check spelling</Text>
            </View>
          )}

          {results.map((verse) => (
            <TouchableOpacity
              key={verse.id}
              style={styles.resultItem}
              onPress={() => handleVerseSelect(verse)}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultSurah}>
                  Surah {verse.surah} - Ayah {verse.ayah}
                </Text>
              </View>
              <Text style={styles.resultArabic}>{verse.arabic}</Text>
              <Text style={styles.resultTranslation}>{verse.translation}</Text>
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
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    closeButton: {
      padding: 8,
    },
    searchContainer: {
      padding: 20,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    results: {
      flex: 1,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    noResultsContainer: {
      padding: 40,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginTop: 16,
      marginBottom: 8,
    },
    noResultsSubtext: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
    },
    resultItem: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    resultHeader: {
      marginBottom: 8,
    },
    resultSurah: {
      fontSize: 14,
      fontWeight: '600',
      color: '#059669',
    },
    resultArabic: {
      fontSize: 18,
      lineHeight: 28,
      textAlign: 'right',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 8,
    },
    resultTranslation: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
  });
}