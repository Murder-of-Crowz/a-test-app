import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FlashcardRating = "know" | "learning";

type ExamResult = {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  breakdown: { category: string, correct: number, total: number }[];
};

type QuizResult = {
  id: string;
  timestamp: number;
  section: string;
  score: number;
  total: number;
}

type StatsState = {
  flashcardRatings: Record<string, FlashcardRating>;
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
      examHistory: [],
      quizHistory: [],
      markCard: (source, id, rating) =>
        set((state) => ({
          flashcardRatings: {
            ...state.flashcardRatings,
            [`${source}_${id}`]: rating,
          },
        })),
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
      resetStats: () => set({ flashcardRatings: {}, examHistory: [], quizHistory: [] })
    }),
    {
      name: "user-stats",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);