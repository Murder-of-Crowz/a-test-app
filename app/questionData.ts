import data from "../assets/questions.json";

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
// console.log(getQuizSubjects());

export function getQuestionBank(index: number) {
  const questionBank = data[index];

  return questionBank.questions;
}

// console.log(getQuestionBank(0));
