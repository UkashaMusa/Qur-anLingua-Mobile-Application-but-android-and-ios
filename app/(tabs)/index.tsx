import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bookmark, Settings, Volume2, Share2, Brain, BookOpen, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useQuran } from '@/hooks/useQuran';
import { useAudio } from '@/hooks/useAudio';
import { SurahCard } from '@/components/SurahCard';
import { VerseCard } from '@/components/VerseCard';
import { SearchModal } from '@/components/SearchModal';
import { BookmarksModal } from '@/components/BookmarksModal';
import { TafsirModal } from '@/components/TafsirModal';
import { DailyVerseCard } from '@/components/DailyVerseCard';
import { MemorizationTracker } from '@/components/MemorizationTracker';
import { TranslationSelector } from '@/components/TranslationSelector';
import { Verse, Surah } from '@/types';

export default function ReadScreen() {
  const [currentView, setCurrentView] = useState<'surahs' | 'verses'>('surahs');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showMemorization, setShowMemorization] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const colorScheme = useColorScheme();
  const { 
    surahs, 
    verses, 
    loading, 
    loadSurahVerses, 
    toggleBookmark, 
    toggleHighlight,
    searchVerses 
  } = useQuran();
  const { playVerse } = useAudio();
  
  const styles = createStyles(colorScheme);

  const handleSurahPress = async (surahId: number) => {
    const surah = surahs.find(s => s.id === surahId);
    if (surah) {
      setSelectedSurah(surah);
      await loadSurahVerses(surahId);
      setCurrentView('verses');
    }
  };

  const handleBackToSurahs = () => {
    setCurrentView('surahs');
    setSelectedSurah(null);
  };

  const handleVerseBookmark = async (verseId: number) => {
    await toggleBookmark(verseId);
  };

  const handleVerseHighlight = async (verseId: number) => {
    await toggleHighlight(verseId);
  };

  const handleVersePlay = async (verseId: number) => {
    if (selectedSurah) {
      await playVerse(selectedSurah.id, verseId);
    }
  };

  const handleVerseShare = (verseId: number) => {
    const verse = verses.find(v => v.id === verseId);
    if (verse && selectedSurah) {
      const shareText = `${verse.arabic}\n\n"${verse.translation}"\n\n- Quran ${selectedSurah.name} ${verse.ayah}`;
      
      // For web, we'll use the Web Share API or fallback to clipboard
      if (navigator.share) {
        navigator.share({
          title: `Quran ${selectedSurah.name} ${verse.ayah}`,
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          Alert.alert('Copied', 'Verse copied to clipboard');
        });
      }
    }
  };

  const handleVerseTafsir = (verse: Verse) => {
    setSelectedVerse(verse);
    setShowTafsir(true);
  };

  const handleVerseSelect = (verse: Verse) => {
    // Navigate to the verse's surah if not already there
    if (!selectedSurah || selectedSurah.id !== verse.surah) {
      handleSurahPress(verse.surah);
    }
    // Scroll to verse would be implemented here
  };

  const handleDailyVersePress = (surahId: number, ayah: number) => {
    handleSurahPress(surahId);
    // Would scroll to specific ayah
  };

  const handleMemorizationPress = () => {
    if (selectedSurah) {
      setShowMemorization(true);
    } else {
      Alert.alert('Select Surah', 'Please select a surah first to track memorization');
    }
  };

  const filteredSurahs = searchQuery 
    ? surahs.filter(surah => 
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.arabicName.includes(searchQuery)
      )
    : surahs;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Quran...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentView === 'verses' && selectedSurah ? (
            <>
              <TouchableOpacity onPress={handleBackToSurahs} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Surahs</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{selectedSurah.name}</Text>
              <Text style={styles.headerSubtitle}>{selectedSurah.arabicName}</Text>
            </>
          ) : (
            <>
              <Text style={styles.headerTitle}>Qur'anLingua</Text>
              <Text style={styles.headerSubtitle}>Read & Study</Text>
            </>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSearch(true)}
          >
            <Search size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowBookmarks(true)}
          >
            <Bookmark size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
          {currentView === 'verses' && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowTranslations(true)}
            >
              <Settings size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar for Surahs */}
      {currentView === 'surahs' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search surahs..."
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Verse Actions Bar */}
      {currentView === 'verses' && (
        <View style={styles.verseActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleMemorizationPress}
          >
            <Brain size={20} color="#059669" />
            <Text style={styles.actionButtonText}>Memorize</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowTranslations(true)}
          >
            <BookOpen size={20} color="#059669" />
            <Text style={styles.actionButtonText}>Translate</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentView === 'surahs' ? (
          <>
            {/* Daily Verse Card */}
            <DailyVerseCard onVersePress={handleDailyVersePress} />

            {/* Surahs List */}
            <View style={styles.surahsList}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? `Search Results (${filteredSurahs.length})` : 'Surahs'}
              </Text>
              {filteredSurahs.map((surah) => (
                <SurahCard
                  key={surah.id}
                  surah={surah}
                  onPress={handleSurahPress}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Surah Info */}
            {selectedSurah && (
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{selectedSurah.name}</Text>
                <Text style={styles.surahArabicName}>{selectedSurah.arabicName}</Text>
                <Text style={styles.surahMeta}>
                  {selectedSurah.verses} verses • {selectedSurah.type}
                </Text>
              </View>
            )}

            {/* Verses List */}
            <View style={styles.versesList}>
              {verses.map((verse) => (
                <View key={verse.id} style={styles.verseContainer}>
                  <VerseCard
                    verse={verse}
                    onBookmark={handleVerseBookmark}
                    onHighlight={handleVerseHighlight}
                    onPlay={handleVersePlay}
                    onShare={handleVerseShare}
                  />
                  <TouchableOpacity
                    style={styles.tafsirButton}
                    onPress={() => handleVerseTafsir(verse)}
                  >
                    <Text style={styles.tafsirButtonText}>View Tafsir</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onVerseSelect={handleVerseSelect}
      />

      <BookmarksModal
        visible={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onVerseSelect={handleVerseSelect}
      />

      <TafsirModal
        visible={showTafsir}
        verse={selectedVerse}
        onClose={() => setShowTafsir(false)}
      />

      <MemorizationTracker
        visible={showMemorization}
        surahId={selectedSurah?.id || 0}
        verses={verses}
        onClose={() => setShowMemorization(false)}
      />

      <TranslationSelector
        visible={showTranslations}
        selectedTranslationId={selectedTranslation}
        onClose={() => setShowTranslations(false)}
        onSelect={setSelectedTranslation}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      paddingBottom: 12,
    },
    headerLeft: {
      flex: 1,
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
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    backButton: {
      marginBottom: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: '#059669',
      fontWeight: '500',
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingBottom: 16,
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
    verseActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#059669',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 16,
    },
    surahsList: {
      paddingBottom: 20,
    },
    surahInfo: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    surahName: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 8,
    },
    surahArabicName: {
      fontSize: 20,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 8,
      textAlign: 'center',
    },
    surahMeta: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    versesList: {
      paddingBottom: 20,
    },
    verseContainer: {
      marginBottom: 16,
    },
    tafsirButton: {
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      borderRadius: 8,
    },
    tafsirButtonText: {
      fontSize: 12,
      color: '#059669',
      fontWeight: '500',
    },
  });
}