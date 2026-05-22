import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FlashcardRating = "know" | "learning";

type QuestionResult = {
  questionId: number;
  source: "free" | "prem";
  correct: boolean;
  category: string;
  selectedAnswer: string;
};

type ExamResult = {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  type: "practice" | "mock"
  breakdown: { category: string, correct: number, total: number }[];
  questions: QuestionResult[];
};

type QuizResult = {
  id: string;
  timestamp: number;
  section: string;
  score: number;
  total: number;
  questions: QuestionResult[];
};

type SavedExam = {
  questions: any[];
  answers: Record<number, number>;
  startedAt: number;
};

type StatsState = {
  flashcardRatings: Record<string, FlashcardRating>;
  flashcardNextReview: Record<string, number>;
  savedExam: SavedExam | null;
  setNextReview: (source: "free" | "prem", id: number, nextdate: number) => void;
  saveExamProgress: (progress: SavedExam) => void;
  clearSavedExam: () => void;
  examHistory: ExamResult[];
  quizHistory: QuizResult[];
  markCard: (source: "free" | "prem", id: number, rating: FlashcardRating) => void;
  addExamResult: (result: Omit<ExamResult, "id">) => void;
  addQuizResult: (result: Omit<QuizResult, "id">) => void;
  resetFlashcardRatings: () => void;
  resetExamHistory: () => void;
  resetQuizHistory: () => void;
  resetStats: () => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      flashcardRatings: {},
      flashcardNextReview: {},
      savedExam: null,
      examHistory: [],
      quizHistory: [],
      markCard: (source, id, rating) =>
        set((state) => ({
          flashcardRatings: {
            ...state.flashcardRatings,
            [`${source}_${id}`]: rating,
          },
        })),
      setNextReview: (source, id, nextDate) =>
        set((state) => ({
          flashcardNextReview: {
            ...state.flashcardNextReview,
            [`${source}_${id}`]: nextDate,
          },
        })),
      saveExamProgress: (progress) => set({ savedExam: progress }),
      clearSavedExam: () => set({ savedExam: null }),
      addExamResult: (result) =>
        set((state) => ({
          examHistory: [
            { ...result, id: Date.now().toString() },
            ...state.examHistory,
          ],
        })),
      addQuizResult: (result) =>
        set((state) => ({
          quizHistory: [
            { ...result, id: Date.now().toString() },
            ...state.quizHistory,
          ],
        })),
      resetFlashcardRatings: () => set({ flashcardRatings: {} }),
      resetExamHistory: () => set ({ examHistory: [] }),
      resetQuizHistory: () => set({ quizHistory: [] }),
      resetStats: () => set({ flashcardRatings: {}, flashcardNextReview: {}, savedExam: null, examHistory: [], quizHistory: [] })
    }),
    {
      name: "user-stats",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);