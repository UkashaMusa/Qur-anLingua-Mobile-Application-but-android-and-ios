export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  type: 'Meccan' | 'Medinan';
  revelation_order: number;
}

export interface Verse {
  id: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  isBookmarked: boolean;
  isHighlighted: boolean;
}

export interface Qari {
  id: number;
  name: string;
  country: string;
  style: string;
  image?: string;
  isDownloaded: boolean;
}

export interface Translation {
  id: number;
  language: string;
  author: string;
  name: string;
}

export interface Bookmark {
  id: number;
  verseId: number;
  userId: string;
  createdAt: Date;
  note?: string;
}

export interface Progress {
  userId: string;
  surahId: number;
  ayahsMemorized: number[];
  lastStudied: Date;
  streak: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  category: string;
  completed?: boolean;
  bestScore?: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  notifications: boolean;
  autoPlay: boolean;
  reminderTime: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinDate: Date;
  settings: UserSettings;
}