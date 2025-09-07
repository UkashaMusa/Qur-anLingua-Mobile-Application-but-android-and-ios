import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bookmark, Heart, Volume2, Share } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { QuranText } from './QuranText';

interface VerseCardProps {
  verse: {
    id: number;
    surah: number;
    ayah: number;
    arabic: string;
    translation: string;
    isBookmarked: boolean;
    isHighlighted: boolean;
  };
  onBookmark: (id: number) => void;
  onHighlight: (id: number) => void;
  onPlay: (id: number) => void;
  onShare: (id: number) => void;
}

export function VerseCard({ verse, onBookmark, onHighlight, onPlay, onShare }: VerseCardProps) {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <View style={[styles.container, verse.isHighlighted && styles.highlightedContainer]}>
      <View style={styles.header}>
        <View style={styles.ayahBadge}>
          <Text style={styles.ayahNumber}>{verse.ayah}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onBookmark(verse.id)}
            style={[styles.actionButton, verse.isBookmarked && styles.activeAction]}
            accessibilityRole="button"
            accessibilityLabel={verse.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark 
              size={18} 
              color={verse.isBookmarked ? '#D97706' : (colorScheme === 'dark' ? '#9CA3AF' : '#6B7280')}
              fill={verse.isBookmarked ? '#D97706' : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onHighlight(verse.id)}
            style={[styles.actionButton, verse.isHighlighted && styles.activeAction]}
            accessibilityRole="button"
            accessibilityLabel={verse.isHighlighted ? 'Remove highlight' : 'Add highlight'}
          >
            <Heart 
              size={18} 
              color={verse.isHighlighted ? '#EF4444' : (colorScheme === 'dark' ? '#9CA3AF' : '#6B7280')}
              fill={verse.isHighlighted ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPlay(verse.id)}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Play audio"
          >
            <Volume2 size={18} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onShare(verse.id)}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Share verse"
          >
            <Share size={18} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <QuranText text={verse.arabic} style={styles.arabicText} />
      <Text style={styles.translationText}>{verse.translation}</Text>
    </View>
  );
}

function createStyles(colorScheme: 'light' | 'dark' | null | undefined) {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    highlightedContainer: {
      backgroundColor: isDark ? '#1E3A8A' : '#FEF3C7',
      borderColor: isDark ? '#3B82F6' : '#D97706',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    ayahBadge: {
      backgroundColor: '#059669',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    ayahNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
    },
    activeAction: {
      backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    arabicText: {
      marginBottom: 12,
    },
    translationText: {
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
  });
}