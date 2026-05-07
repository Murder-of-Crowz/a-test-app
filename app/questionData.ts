import data from "../assets/questions.json";

export type PremQuestion = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
}

export function getQuizSubjects() {
  type Category = {
    id: number;
    title: string;
    index: number;
    weight?: number;
  };

  const categories: Category[] = [];

  (data as { category: string }[]).forEach((item) => {
    const existingCategory = categories.find(
      (cat) => cat.title.toLowerCase() === item.category.toLowerCase(),
    );
    if (!existingCategory) {
      categories.push({
        id: categories.length + 1,
        title: item.category,
        index: categories.length,
        weight: (item as any).weight,
      });
    }
  });
  return categories;
}

export function getQuestionBank(index: number, premQuestions: PremQuestion[] = []) {
  const section = data[index];
  const premForCategory = premQuestions.filter(q => q.category === section.category);
  return [...section.questions, ...premForCategory]
}
