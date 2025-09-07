import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quiz, QuizQuestion } from '@/types';

interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  answers: { questionId: number; selectedAnswer: number; correct: boolean }[];
}

interface QuizStats {
  totalQuizzesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  bestScore: number;
  categoriesCompleted: string[];
}

const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 1,
    title: 'Surah Al-Fatiha Knowledge',
    description: 'Test your understanding of the opening chapter',
    difficulty: 'Beginner',
    category: 'Surahs',
    questions: [
      {
        id: 1,
        question: 'How many verses are in Surah Al-Fatiha?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        explanation: 'Surah Al-Fatiha contains 7 verses and is known as the opening chapter of the Quran.',
      },
      {
        id: 2,
        question: 'What does "Al-Fatiha" mean in English?',
        options: ['The Opening', 'The Beginning', 'The First', 'The Start'],
        correctAnswer: 0,
        explanation: 'Al-Fatiha means "The Opening" and it opens the Quran.',
      },
      {
        id: 3,
        question: 'Which prayer position is Surah Al-Fatiha recited in?',
        options: ['Only standing', 'Only sitting', 'Every rakah', 'Only in the first rakah'],
        correctAnswer: 2,
        explanation: 'Surah Al-Fatiha is recited in every rakah of the prayer.',
      },
    ],
  },
  {
    id: 2,
    title: 'Names of Allah (Asma ul-Husna)',
    description: 'Learn the 99 beautiful names of Allah',
    difficulty: 'Intermediate',
    category: 'Names of Allah',
    questions: [
      {
        id: 4,
        question: 'What does "Ar-Rahman" mean?',
        options: ['The Merciful', 'The Compassionate', 'The Entirely Merciful', 'The Kind'],
        correctAnswer: 2,
        explanation: 'Ar-Rahman means "The Entirely Merciful" and refers to Allah\'s mercy to all creation.',
      },
      {
        id: 5,
        question: 'How many beautiful names of Allah are traditionally recognized?',
        options: ['77', '88', '99', '100'],
        correctAnswer: 2,
        explanation: 'There are 99 beautiful names of Allah (Asma ul-Husna) traditionally recognized.',
      },
    ],
  },
  {
    id: 3,
    title: 'Prophets in the Quran',
    description: 'Stories and lessons from the prophets',
    difficulty: 'Advanced',
    category: 'Prophets',
    questions: [
      {
        id: 6,
        question: 'Which prophet is mentioned most frequently in the Quran?',
        options: ['Prophet Muhammad (PBUH)', 'Prophet Ibrahim (AS)', 'Prophet Musa (AS)', 'Prophet Isa (AS)'],
        correctAnswer: 2,
        explanation: 'Prophet Musa (Moses) is mentioned most frequently in the Quran, appearing in many chapters.',
      },
      {
        id: 7,
        question: 'How many prophets are mentioned by name in the Quran?',
        options: ['20', '25', '30', '35'],
        correctAnswer: 1,
        explanation: 'There are 25 prophets mentioned by name in the Quran.',
      },
    ],
  },
];

class QuizService {
  private static instance: QuizService;
  private quizResults: QuizResult[] = [];
  private stats: QuizStats = {
    totalQuizzesCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0,
    categoriesCompleted: [],
  };

  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  async initialize() {
    await this.loadResults();
    await this.loadStats();
  }

  private async loadResults() {
    try {
      const resultsData = await AsyncStorage.getItem('quiz_results');
      if (resultsData) {
        this.quizResults = JSON.parse(resultsData);
      }
    } catch (error) {
      console.error('Error loading quiz results:', error);
    }
  }

  private async saveResults() {
    try {
      await AsyncStorage.setItem('quiz_results', JSON.stringify(this.quizResults));
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  }

  private async loadStats() {
    try {
      const statsData = await AsyncStorage.getItem('quiz_stats');
      if (statsData) {
        this.stats = { ...this.stats, ...JSON.parse(statsData) };
      }
    } catch (error) {
      console.error('Error loading quiz stats:', error);
    }
  }

  private async saveStats() {
    try {
      await AsyncStorage.setItem('quiz_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving quiz stats:', error);
    }
  }

  getQuizzes(): Quiz[] {
    return SAMPLE_QUIZZES.map(quiz => ({
      ...quiz,
      completed: this.isQuizCompleted(quiz.id),
      bestScore: this.getBestScore(quiz.id),
    }));
  }

  getQuizById(id: number): Quiz | undefined {
    const quiz = SAMPLE_QUIZZES.find(q => q.id === id);
    if (quiz) {
      return {
        ...quiz,
        completed: this.isQuizCompleted(id),
        bestScore: this.getBestScore(id),
      };
    }
    return undefined;
  }

  getQuizzesByCategory(category: string): Quiz[] {
    return SAMPLE_QUIZZES.filter(quiz => quiz.category === category);
  }

  getQuizzesByDifficulty(difficulty: 'Beginner' | 'Intermediate' | 'Advanced'): Quiz[] {
    return SAMPLE_QUIZZES.filter(quiz => quiz.difficulty === difficulty);
  }

  isQuizCompleted(quizId: number): boolean {
    return this.quizResults.some(result => result.quizId === quizId);
  }

  getBestScore(quizId: number): number {
    const results = this.quizResults.filter(result => result.quizId === quizId);
    if (results.length === 0) return 0;
    
    return Math.max(...results.map(result => result.score));
  }

  async submitQuizResult(result: Omit<QuizResult, 'completedAt'>): Promise<void> {
    const quizResult: QuizResult = {
      ...result,
      completedAt: new Date(),
    };

    this.quizResults.push(quizResult);
    await this.updateStats(quizResult);
    await this.saveResults();
  }

  private async updateStats(result: QuizResult) {
    this.stats.totalQuizzesCompleted += 1;
    this.stats.totalTimeSpent += result.timeSpent;
    
    if (result.score > this.stats.bestScore) {
      this.stats.bestScore = result.score;
    }

    // Update average score
    const totalScore = this.quizResults.reduce((sum, r) => sum + r.score, 0);
    this.stats.averageScore = totalScore / this.quizResults.length;

    // Update categories completed
    const quiz = this.getQuizById(result.quizId);
    if (quiz && !this.stats.categoriesCompleted.includes(quiz.category)) {
      this.stats.categoriesCompleted.push(quiz.category);
    }

    await this.saveStats();
  }

  getQuizResults(): QuizResult[] {
    return [...this.quizResults];
  }

  getStats(): QuizStats {
    return { ...this.stats };
  }

  async resetProgress(): Promise<void> {
    this.quizResults = [];
    this.stats = {
      totalQuizzesCompleted: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      bestScore: 0,
      categoriesCompleted: [],
    };
    
    await AsyncStorage.removeItem('quiz_results');
    await AsyncStorage.removeItem('quiz_stats');
  }

  getRecommendedQuizzes(): Quiz[] {
    // Return quizzes based on user's progress and difficulty
    const completedQuizzes = new Set(this.quizResults.map(r => r.quizId));
    const availableQuizzes = SAMPLE_QUIZZES.filter(q => !completedQuizzes.has(q.id));
    
    // Sort by difficulty (beginner first)
    return availableQuizzes.sort((a, b) => {
      const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }
}

export default QuizService;