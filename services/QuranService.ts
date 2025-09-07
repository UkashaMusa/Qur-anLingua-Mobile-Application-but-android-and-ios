import AsyncStorage from '@react-native-async-storage/async-storage';
import { Surah, Verse, Translation } from '@/types';

// Complete Quran data - This would typically come from an API
const COMPLETE_SURAHS: Surah[] = [
  { id: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', verses: 7, type: 'Meccan', revelation_order: 5 },
  { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286, type: 'Medinan', revelation_order: 87 },
  { id: 3, name: 'Ali Imran', arabicName: 'آل عمران', verses: 200, type: 'Medinan', revelation_order: 89 },
  { id: 4, name: 'An-Nisa', arabicName: 'النساء', verses: 176, type: 'Medinan', revelation_order: 92 },
  { id: 5, name: 'Al-Maidah', arabicName: 'المائدة', verses: 120, type: 'Medinan', revelation_order: 112 },
  { id: 6, name: 'Al-Anam', arabicName: 'الأنعام', verses: 165, type: 'Meccan', revelation_order: 55 },
  { id: 7, name: 'Al-Araf', arabicName: 'الأعراف', verses: 206, type: 'Meccan', revelation_order: 39 },
  { id: 8, name: 'Al-Anfal', arabicName: 'الأنفال', verses: 75, type: 'Medinan', revelation_order: 88 },
  { id: 9, name: 'At-Tawbah', arabicName: 'التوبة', verses: 129, type: 'Medinan', revelation_order: 113 },
  { id: 10, name: 'Yunus', arabicName: 'يونس', verses: 109, type: 'Meccan', revelation_order: 51 },
];

// Sample verses for demonstration
const SAMPLE_VERSES: Verse[] = [
  {
    id: 1,
    surah: 1,
    ayah: 1,
    arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    transliteration: 'Bismillahir-Rahmanir-Raheem',
    isBookmarked: false,
    isHighlighted: false,
  },
  {
    id: 2,
    surah: 1,
    ayah: 2,
    arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    translation: '[All] praise is [due] to Allah, Lord of the worlds -',
    transliteration: 'Alhamdu lillahi rabbil-alameen',
    isBookmarked: false,
    isHighlighted: false,
  },
  {
    id: 3,
    surah: 1,
    ayah: 3,
    arabic: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'The Entirely Merciful, the Especially Merciful,',
    transliteration: 'Ar-Rahmanir-Raheem',
    isBookmarked: false,
    isHighlighted: false,
  },
  {
    id: 4,
    surah: 1,
    ayah: 4,
    arabic: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
    translation: 'Sovereign of the Day of Recompense.',
    transliteration: 'Maliki yawmid-deen',
    isBookmarked: false,
    isHighlighted: false,
  },
  {
    id: 5,
    surah: 1,
    ayah: 5,
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    translation: 'It is You we worship and You we ask for help.',
    transliteration: 'Iyyaka na\'budu wa iyyaka nasta\'een',
    isBookmarked: false,
    isHighlighted: false,
  },
  {
    id: 6,
    surah: 1,
    ayah: 6,
    arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    translation: 'Guide us to the straight path -',
    transliteration: 'Ihdinassiratal-mustaqeem',
    isBookmarked: false,
    isHighlighted: false,
  },
  {
    id: 7,
    surah: 1,
    ayah: 7,
    arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
    transliteration: 'Siratal-lazeena an\'amta alayhim ghayril-maghdoobi alayhim wa lad-dalleen',
    isBookmarked: false,
    isHighlighted: false,
  },
];

const TRANSLATIONS: Translation[] = [
  { id: 1, language: 'English', author: 'Sahih International', name: 'Sahih International' },
  { id: 2, language: 'Hausa', author: 'Abubakar Mahmud Gumi', name: 'Tafsir Gumi' },
  { id: 3, language: 'Arabic', author: 'Original Text', name: 'Arabic Original' },
  { id: 4, language: 'Italian', author: 'Hamza Roberto Piccardo', name: 'Italian Translation' },
];

class QuranService {
  private static instance: QuranService;
  private verses: Map<string, Verse[]> = new Map();
  private bookmarks: Set<number> = new Set();
  private highlights: Set<number> = new Set();

  static getInstance(): QuranService {
    if (!QuranService.instance) {
      QuranService.instance = new QuranService();
    }
    return QuranService.instance;
  }

  async initialize() {
    await this.loadBookmarks();
    await this.loadHighlights();
    await this.loadVerses();
  }

  private async loadVerses() {
    // In a real app, this would load from a local database or API
    const surahKey = '1';
    this.verses.set(surahKey, SAMPLE_VERSES);
  }

  private async loadBookmarks() {
    try {
      const bookmarksData = await AsyncStorage.getItem('bookmarks');
      if (bookmarksData) {
        const bookmarkIds = JSON.parse(bookmarksData);
        this.bookmarks = new Set(bookmarkIds);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }

  private async loadHighlights() {
    try {
      const highlightsData = await AsyncStorage.getItem('highlights');
      if (highlightsData) {
        const highlightIds = JSON.parse(highlightsData);
        this.highlights = new Set(highlightIds);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  }

  private async saveBookmarks() {
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify([...this.bookmarks]));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  private async saveHighlights() {
    try {
      await AsyncStorage.setItem('highlights', JSON.stringify([...this.highlights]));
    } catch (error) {
      console.error('Error saving highlights:', error);
    }
  }

  getSurahs(): Surah[] {
    return COMPLETE_SURAHS;
  }

  getSurahById(id: number): Surah | undefined {
    return COMPLETE_SURAHS.find(surah => surah.id === id);
  }

  async getVersesBySurah(surahId: number): Promise<Verse[]> {
    const surahKey = surahId.toString();
    let verses = this.verses.get(surahKey);
    
    if (!verses) {
      // Generate sample verses for other surahs
      const surah = this.getSurahById(surahId);
      if (surah) {
        verses = this.generateSampleVerses(surahId, surah.verses);
        this.verses.set(surahKey, verses);
      } else {
        return [];
      }
    }

    // Apply bookmark and highlight states
    return verses.map(verse => ({
      ...verse,
      isBookmarked: this.bookmarks.has(verse.id),
      isHighlighted: this.highlights.has(verse.id),
    }));
  }

  private generateSampleVerses(surahId: number, verseCount: number): Verse[] {
    const verses: Verse[] = [];
    for (let i = 1; i <= Math.min(verseCount, 10); i++) {
      verses.push({
        id: surahId * 1000 + i,
        surah: surahId,
        ayah: i,
        arabic: 'نص عربي تجريبي للآية',
        translation: `Sample translation for Surah ${surahId}, Verse ${i}`,
        transliteration: `Sample transliteration ${i}`,
        isBookmarked: false,
        isHighlighted: false,
      });
    }
    return verses;
  }

  async searchVerses(query: string): Promise<Verse[]> {
    const allVerses: Verse[] = [];
    
    // Search through all loaded verses
    for (const verses of this.verses.values()) {
      allVerses.push(...verses);
    }

    const lowercaseQuery = query.toLowerCase();
    return allVerses.filter(verse =>
      verse.translation.toLowerCase().includes(lowercaseQuery) ||
      verse.arabic.includes(query) ||
      (verse.transliteration && verse.transliteration.toLowerCase().includes(lowercaseQuery))
    );
  }

  async toggleBookmark(verseId: number): Promise<boolean> {
    if (this.bookmarks.has(verseId)) {
      this.bookmarks.delete(verseId);
    } else {
      this.bookmarks.add(verseId);
    }
    await this.saveBookmarks();
    return this.bookmarks.has(verseId);
  }

  async toggleHighlight(verseId: number): Promise<boolean> {
    if (this.highlights.has(verseId)) {
      this.highlights.delete(verseId);
    } else {
      this.highlights.add(verseId);
    }
    await this.saveHighlights();
    return this.highlights.has(verseId);
  }

  async getBookmarkedVerses(): Promise<Verse[]> {
    const allVerses: Verse[] = [];
    
    for (const verses of this.verses.values()) {
      allVerses.push(...verses.filter(verse => this.bookmarks.has(verse.id)));
    }
    
    return allVerses;
  }

  getTranslations(): Translation[] {
    return TRANSLATIONS;
  }

  async getVerseTranslation(verseId: number, translationId: number): Promise<string> {
    // In a real app, this would fetch from API or database
    const translation = TRANSLATIONS.find(t => t.id === translationId);
    return `Translation in ${translation?.language || 'Unknown'} for verse ${verseId}`;
  }

  async getTafsir(verseId: number): Promise<string> {
    // Mock tafsir data
    return `This is a detailed explanation (tafsir) for verse ${verseId}. In a real implementation, this would contain scholarly commentary and interpretation of the verse's meaning, context, and significance.`;
  }
}

export default QuranService;