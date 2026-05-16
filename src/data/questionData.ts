import englishData from "../../assets/questions.json";
import spanishData from "../../assets/spanishQuestions.json";
import { useSettingsStore } from "@/src/settingsStore";

export type PremQuestion = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
};

function getQuestionData() {
  return useSettingsStore.getState().spanish ? spanishData : englishData;
}

export function getQuizSubjects() {
  const data = getQuestionData();

  type Category = {
    id: number;
    title: string;
    index: number;
    weight?: number;
  };

  const categories: Category[] = [];

  (data as { category: string; weight?: number }[]).forEach((item) => {
    const existingCategory = categories.find(
      (cat) => cat.title.toLowerCase() === item.category.toLowerCase()
    );

    if (!existingCategory) {
      categories.push({
        id: categories.length + 1,
        title: item.category,
        index: categories.length,
        weight: item.weight,
      });
    }
  });

  return categories;
}

export function getQuestionBank(
  index: number,
  premQuestions: PremQuestion[] = []
) {
  const data = getQuestionData();

  const section = data[index];

  if (!section) return [];

  const premForCategory = premQuestions.filter(
    (q) => q.category === section.category
  );

  return [...section.questions, ...premForCategory];
}