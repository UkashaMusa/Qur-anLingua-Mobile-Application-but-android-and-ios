import AsyncStorage from '@react-native-async-storage/async-storage';
import { Progress } from '@/types';
import QuranService from './QuranService';

interface MemorizationSession {
  surahId: number;
  ayahsToMemorize: number[];
  startTime: Date;
  endTime?: Date;
  accuracy: number;
  attempts: number;
}

interface MemorizationStats {
  totalAyahsMemorized: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // in minutes
  averageAccuracy: number;
  surahsCompleted: number[];
}

class MemorizationService {
  private static instance: MemorizationService;
  private progress: Map<number, Progress> = new Map();
  private sessions: MemorizationSession[] = [];
  private stats: MemorizationStats = {
    totalAyahsMemorized: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0,
    averageAccuracy: 0,
    surahsCompleted: [],
  };

  static getInstance(): MemorizationService {
    if (!MemorizationService.instance) {
      MemorizationService.instance = new MemorizationService();
    }
    return MemorizationService.instance;
  }

  async initialize() {
    await this.loadProgress();
    await this.loadStats();
    await this.loadSessions();
  }

  private async loadProgress() {
    try {
      const progressData = await AsyncStorage.getItem('memorization_progress');
      if (progressData) {
        const progressArray = JSON.parse(progressData);
        this.progress = new Map(progressArray.map((p: Progress) => [p.surahId, p]));
      }
    } catch (error) {
      console.error('Error loading memorization progress:', error);
    }
  }

  private async saveProgress() {
    try {
      const progressArray = Array.from(this.progress.values());
      await AsyncStorage.setItem('memorization_progress', JSON.stringify(progressArray));
    } catch (error) {
      console.error('Error saving memorization progress:', error);
    }
  }

  private async loadStats() {
    try {
      const statsData = await AsyncStorage.getItem('memorization_stats');
      if (statsData) {
        this.stats = { ...this.stats, ...JSON.parse(statsData) };
      }
    } catch (error) {
      console.error('Error loading memorization stats:', error);
    }
  }

  private async saveStats() {
    try {
      await AsyncStorage.setItem('memorization_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving memorization stats:', error);
    }
  }

  private async loadSessions() {
    try {
      const sessionsData = await AsyncStorage.getItem('memorization_sessions');
      if (sessionsData) {
        this.sessions = JSON.parse(sessionsData);
      }
    } catch (error) {
      console.error('Error loading memorization sessions:', error);
    }
  }

  private async saveSessions() {
    try {
      await AsyncStorage.setItem('memorization_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving memorization sessions:', error);
    }
  }

  async startMemorizationSession(surahId: number, ayahs: number[]): Promise<string> {
    const sessionId = Date.now().toString();
    const session: MemorizationSession = {
      surahId,
      ayahsToMemorize: ayahs,
      startTime: new Date(),
      accuracy: 0,
      attempts: 0,
    };

    this.sessions.push(session);
    await this.saveSessions();
    
    return sessionId;
  }

  async completeMemorizationSession(
    sessionId: string, 
    accuracy: number, 
    attempts: number
  ): Promise<void> {
    const sessionIndex = this.sessions.findIndex(s => 
      s.startTime.getTime().toString() === sessionId
    );

    if (sessionIndex !== -1) {
      const session = this.sessions[sessionIndex];
      session.endTime = new Date();
      session.accuracy = accuracy;
      session.attempts = attempts;

      // Update progress
      const progress = this.progress.get(session.surahId) || {
        userId: 'current_user',
        surahId: session.surahId,
        ayahsMemorized: [],
        lastStudied: new Date(),
        streak: 0,
      };

      // Add newly memorized ayahs
      session.ayahsToMemorize.forEach(ayah => {
        if (!progress.ayahsMemorized.includes(ayah)) {
          progress.ayahsMemorized.push(ayah);
        }
      });

      progress.lastStudied = new Date();
      this.progress.set(session.surahId, progress);

      // Update stats
      this.updateStats(session);

      await this.saveProgress();
      await this.saveSessions();
      await this.saveStats();
    }
  }

  private updateStats(session: MemorizationSession) {
    const studyTime = session.endTime && session.startTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      : 0;

    this.stats.totalStudyTime += studyTime;
    this.stats.totalAyahsMemorized += session.ayahsToMemorize.length;
    
    // Update streak
    const today = new Date().toDateString();
    const lastStudied = new Date(session.startTime).toDateString();
    
    if (today === lastStudied) {
      this.stats.currentStreak += 1;
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }
    }

    // Update average accuracy
    const totalSessions = this.sessions.filter(s => s.endTime).length;
    const totalAccuracy = this.sessions
      .filter(s => s.endTime)
      .reduce((sum, s) => sum + s.accuracy, 0);
    
    this.stats.averageAccuracy = totalSessions > 0 ? totalAccuracy / totalSessions : 0;
  }

  getProgressForSurah(surahId: number): Progress | null {
    return this.progress.get(surahId) || null;
  }

  getAllProgress(): Progress[] {
    return Array.from(this.progress.values());
  }

  getStats(): MemorizationStats {
    return { ...this.stats };
  }

  async markAyahMemorized(surahId: number, ayahNumber: number): Promise<void> {
    const progress = this.progress.get(surahId) || {
      userId: 'current_user',
      surahId,
      ayahsMemorized: [],
      lastStudied: new Date(),
      streak: 0,
    };

    if (!progress.ayahsMemorized.includes(ayahNumber)) {
      progress.ayahsMemorized.push(ayahNumber);
      progress.lastStudied = new Date();
      this.progress.set(surahId, progress);
      await this.saveProgress();
    }
  }

  async unmarkAyahMemorized(surahId: number, ayahNumber: number): Promise<void> {
    const progress = this.progress.get(surahId);
    if (progress) {
      progress.ayahsMemorized = progress.ayahsMemorized.filter(a => a !== ayahNumber);
      this.progress.set(surahId, progress);
      await this.saveProgress();
    }
  }

  isAyahMemorized(surahId: number, ayahNumber: number): boolean {
    const progress = this.progress.get(surahId);
    return progress ? progress.ayahsMemorized.includes(ayahNumber) : false;
  }

  getMemorizationPercentage(surahId: number, totalAyahs: number): number {
    const progress = this.progress.get(surahId);
    if (!progress) return 0;
    
    return Math.round((progress.ayahsMemorized.length / totalAyahs) * 100);
  }

  async getNextReviewTime(surahId: number): Promise<Date | null> {
    const progress = this.progress.get(surahId);
    if (!progress || progress.ayahsMemorized.length === 0) {
      return null;
    }

    // Simple spaced repetition: review after 1 day, then 3 days, then 7 days
    const lastStudied = new Date(progress.lastStudied);
    const daysSinceLastStudy = Math.floor(
      (Date.now() - lastStudied.getTime()) / (1000 * 60 * 60 * 24)
    );

    let nextReviewDays = 1;
    if (daysSinceLastStudy >= 7) {
      nextReviewDays = 7;
    } else if (daysSinceLastStudy >= 3) {
      nextReviewDays = 3;
    }

    const nextReview = new Date(lastStudied);
    nextReview.setDate(nextReview.getDate() + nextReviewDays);
    
    return nextReview;
  }

  async getDailyVerse(): Promise<{ surahId: number; ayah: number; text: string } | null> {
    try {
      const today = new Date().toDateString();
      const lastDailyVerse = await AsyncStorage.getItem('last_daily_verse_date');
      
      if (lastDailyVerse === today) {
        const savedVerse = await AsyncStorage.getItem('daily_verse');
        if (savedVerse) {
          return JSON.parse(savedVerse);
        }
      }

      // Generate new daily verse
      const quranService = QuranService.getInstance();
      const surahs = quranService.getSurahs();
      const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
      const randomAyah = Math.floor(Math.random() * randomSurah.verses) + 1;
      
      const verses = await quranService.getVersesBySurah(randomSurah.id);
      const verse = verses.find(v => v.ayah === randomAyah);
      
      const dailyVerse = {
        surahId: randomSurah.id,
        ayah: randomAyah,
        text: verse?.translation || 'Daily verse text',
      };

      await AsyncStorage.setItem('daily_verse', JSON.stringify(dailyVerse));
      await AsyncStorage.setItem('last_daily_verse_date', today);
      
      return dailyVerse;
    } catch (error) {
      console.error('Error getting daily verse:', error);
      return null;
    }
  }
}

export default MemorizationService;