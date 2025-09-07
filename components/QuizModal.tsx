import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, CircleCheck as CheckCircle, Circle as XCircle, Clock, Trophy } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Quiz, QuizQuestion } from '@/types';
import QuizService from '@/services/QuizService';

interface QuizModalProps {
  visible: boolean;
  quiz: Quiz | null;
  onClose: () => void;
  onComplete: (score: number, totalQuestions: number) => void;
}

export function QuizModal({ visible, quiz, onClose, onComplete }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (visible && quiz) {
      resetQuiz();
    }
  }, [visible, quiz]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setStartTime(new Date());
    setTimeSpent(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    if (!quiz || !startTime) return;

    const endTime = new Date();
    const timeSpentSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    setTimeSpent(timeSpentSeconds);

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    // Save result
    const quizService = QuizService.getInstance();
    await quizService.submitQuizResult({
      quizId: quiz.id,
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      timeSpent: timeSpentSeconds,
      answers: quiz.questions.map((question, index) => ({
        questionId: question.id,
        selectedAnswer: selectedAnswers[index] || -1,
        correct: selectedAnswers[index] === question.correctAnswer,
      })),
    });

    setShowResults(true);
    onComplete(correctAnswers, quiz.questions.length);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetQuiz, 300);
  };

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasSelectedAnswer = selectedAnswers[currentQuestionIndex] !== undefined;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{quiz.title}</Text>
            <Text style={styles.subtitle}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {!showResults ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedAnswers[currentQuestionIndex] === index && styles.selectedOption,
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText,
                    ]}>
                      {String.fromCharCode(65 + index)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Trophy size={48} color="#D97706" />
                <Text style={styles.resultsTitle}>Quiz Complete!</Text>
                <Text style={styles.resultsScore}>
                  {selectedAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length} / {quiz.questions.length}
                </Text>
                <Text style={styles.resultsTime}>
                  <Clock size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </Text>
              </View>

              <View style={styles.answersReview}>
                <Text style={styles.reviewTitle}>Review Answers</Text>
                {quiz.questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <View key={question.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewQuestionNumber}>Q{index + 1}</Text>
                        {isCorrect ? (
                          <CheckCircle size={20} color="#059669" />
                        ) : (
                          <XCircle size={20} color="#EF4444" />
                        )}
                      </View>
                      <Text style={styles.reviewQuestion}>{question.question}</Text>
                      <Text style={[
                        styles.reviewAnswer,
                        isCorrect ? styles.correctAnswer : styles.incorrectAnswer,
                      ]}>
                        Your answer: {question.options[userAnswer] || 'Not answered'}
                      </Text>
                      {!isCorrect && (
                        <Text style={styles.correctAnswerText}>
                          Correct: {question.options[question.correctAnswer]}
                        </Text>
                      )}
                      {question.explanation && (
                        <Text style={styles.explanation}>{question.explanation}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        )}

        {!showResults && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={[
                styles.navButtonText,
                currentQuestionIndex === 0 && styles.disabledButtonText,
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.primaryButton,
                !hasSelectedAnswer && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!hasSelectedAnswer}
            >
              <Text style={[
                styles.navButtonText,
                styles.primaryButtonText,
                !hasSelectedAnswer && styles.disabledButtonText,
              ]}>
                {isLastQuestion ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
      alignItems: 'flex-start',
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    closeButton: {
      padding: 8,
    },
    progressContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    progressBar: {
      height: 6,
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#059669',
      borderRadius: 3,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    questionContainer: {
      paddingVertical: 20,
    },
    questionText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      lineHeight: 28,
      marginBottom: 24,
    },
    optionsContainer: {
      gap: 12,
    },
    optionButton: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    selectedOption: {
      borderColor: '#059669',
      backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
    },
    optionText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#1F2937',
      lineHeight: 22,
    },
    selectedOptionText: {
      color: '#059669',
      fontWeight: '600',
    },
    navigationContainer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#E5E7EB',
    },
    navButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    primaryButton: {
      backgroundColor: '#059669',
      borderColor: '#059669',
    },
    disabledButton: {
      opacity: 0.5,
    },
    navButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    primaryButtonText: {
      color: '#FFFFFF',
    },
    disabledButtonText: {
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
    resultsContainer: {
      paddingVertical: 20,
    },
    resultsHeader: {
      alignItems: 'center',
      marginBottom: 32,
    },
    resultsTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginTop: 16,
      marginBottom: 8,
    },
    resultsScore: {
      fontSize: 48,
      fontWeight: '700',
      color: '#059669',
      marginBottom: 8,
    },
    resultsTime: {
      fontSize: 16,
      color: isDark ? '#9CA3AF' : '#6B7280',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    answersReview: {
      gap: 16,
    },
    reviewTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 16,
    },
    reviewItem: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewQuestionNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: '#059669',
    },
    reviewQuestion: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 8,
    },
    reviewAnswer: {
      fontSize: 14,
      marginBottom: 4,
    },
    correctAnswer: {
      color: '#059669',
    },
    incorrectAnswer: {
      color: '#EF4444',
    },
    correctAnswerText: {
      fontSize: 14,
      color: '#059669',
      marginBottom: 8,
    },
    explanation: {
      fontSize: 14,
      color: isDark ? '#D1D5DB' : '#4B5563',
      fontStyle: 'italic',
      lineHeight: 20,
    },
  });
}