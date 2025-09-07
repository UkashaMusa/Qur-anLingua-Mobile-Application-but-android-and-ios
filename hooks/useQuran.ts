import { useState, useEffect } from 'react';
import { Surah, Verse } from '@/types';
import QuranService from '@/services/QuranService';

export function useQuran() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  useEffect(() => {
    initializeQuran();
  }, []);

  const initializeQuran = async () => {
    try {
      const quranService = QuranService.getInstance();
      await quranService.initialize();
      
      const surahsData = quranService.getSurahs();
      setSurahs(surahsData);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing Quran:', error);
      setLoading(false);
    }
  };

  const loadSurahVerses = async (surahId: number) => {
    try {
      setLoading(true);
      const quranService = QuranService.getInstance();
      const versesData = await quranService.getVersesBySurah(surahId);
      setVerses(versesData);
      setSelectedSurah(surahId);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSurahById = (id: number): Surah | undefined => {
    return surahs.find(surah => surah.id === id);
  };

  const getVersesBySurah = (surahId: number): Verse[] => {
    if (selectedSurah === surahId) {
      return verses;
    }
    return [];
  };

  const searchVerses = async (query: string): Promise<Verse[]> => {
    try {
      const quranService = QuranService.getInstance();
      return await quranService.searchVerses(query);
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  };

  const toggleBookmark = async (verseId: number) => {
    try {
      const quranService = QuranService.getInstance();
      const isBookmarked = await quranService.toggleBookmark(verseId);
      
      // Update local state
      setVerses(prevVerses =>
        prevVerses.map(verse =>
          verse.id === verseId ? { ...verse, isBookmarked } : verse
        )
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const toggleHighlight = async (verseId: number) => {
    try {
      const quranService = QuranService.getInstance();
      const isHighlighted = await quranService.toggleHighlight(verseId);
      
      // Update local state
      setVerses(prevVerses =>
        prevVerses.map(verse =>
          verse.id === verseId ? { ...verse, isHighlighted } : verse
        )
      );
    } catch (error) {
      console.error('Error toggling highlight:', error);
    }
  };

  const getBookmarkedVerses = async (): Promise<Verse[]> => {
    try {
      const quranService = QuranService.getInstance();
      return await quranService.getBookmarkedVerses();
    } catch (error) {
      console.error('Error getting bookmarked verses:', error);
      return [];
    }
  };

  return {
    surahs,
    verses,
    loading,
    selectedSurah,
    loadSurahVerses,
    getSurahById,
    getVersesBySurah,
    searchVerses,
    toggleBookmark,
    toggleHighlight,
    getBookmarkedVerses,
  };
}