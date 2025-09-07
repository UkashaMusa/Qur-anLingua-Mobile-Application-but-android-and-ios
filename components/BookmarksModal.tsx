import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Bookmark, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Verse } from '@/types';
import { useQuran } from '@/hooks/useQuran';

interface BookmarksModalProps {
  visible: boolean;
  onClose: () => void;
  onVerseSelect: (verse: Verse) => void;
}

export function BookmarksModal({ visible, onClose, onVerseSelect }: BookmarksModalProps) {
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { getBookmarkedVerses, toggleBookmark } = useQuran();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (visible) {
      loadBookmarks();
    }
  }, [visible]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const verses = await getBookmarkedVerses();
      setBookmarkedVerses(verses);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (verseId: number) => {
    await toggleBookmark(verseId);
    await loadBookmarks(); // Refresh the list
  };

  const handleVerseSelect = (verse: Verse) => {
    onVerseSelect(verse);
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
          <Text style={styles.title}>Bookmarked Verses</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading bookmarks...</Text>
            </View>
          )}

          {!loading && bookmarkedVerses.length === 0 && (
            <View style={styles.emptyContainer}>
              <Bookmark size={48} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
              <Text style={styles.emptyText}>No bookmarks yet</Text>
              <Text style={styles.emptySubtext}>
                Bookmark verses while reading to save them here
              </Text>
            </View>
          )}

          {bookmarkedVerses.map((verse) => (
            <TouchableOpacity
              key={verse.id}
              style={styles.verseItem}
              onPress={() => handleVerseSelect(verse)}
            >
              <View style={styles.verseContent}>
                <View style={styles.verseHeader}>
                  <Text style={styles.verseReference}>
                    Surah {verse.surah} - Ayah {verse.ayah}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveBookmark(verse.id)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.arabicText}>{verse.arabic}</Text>
                <Text style={styles.translationText}>{verse.translation}</Text>
              </View>
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
    content: {
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
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
    },
    verseItem: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    verseContent: {
      gap: 8,
    },
    verseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    verseReference: {
      fontSize: 14,
      fontWeight: '600',
      color: '#059669',
    },
    removeButton: {
      padding: 4,
    },
    arabicText: {
      fontSize: 18,
      lineHeight: 28,
      textAlign: 'right',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    translationText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
  });
}