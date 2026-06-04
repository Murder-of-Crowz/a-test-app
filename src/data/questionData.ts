import freeEnglishData from "../../assets/freeQuestions.json";
import premiumEnglishData from "../../assets/premQustions.json";
import freeSpanishData from "../../assets/freeSpanishQuesions.json";
import premiumSpanishData from "../../assets/premSpanishQuestions.json";

export type QuestionBankSource = "free" | "prem";

export type QuestionData = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
};

export type QuestionSection = {
  sectionId: number;
  category: string;
  weight: number;
  questions: QuestionData[];
};

export function getQuestionData(
  spanish: boolean,
  hasEsthiPro: boolean,
): QuestionSection[] {
  if (spanish) {
    return (hasEsthiPro ? premiumSpanishData : freeSpanishData) as QuestionSection[];
  }

  return (hasEsthiPro ? premiumEnglishData : freeEnglishData) as QuestionSection[];
}

export function getQuestionBankSource(hasEsthiPro: boolean): QuestionBankSource {
  return hasEsthiPro ? "prem" : "free";
}

export function getQuizSubjects(spanish: boolean, hasEsthiPro: boolean) {
  return getQuestionData(spanish, hasEsthiPro).map((section, index) => ({
    id: section.sectionId,
    title: section.category,
    index,
    weight: section.weight,
    questionCount: section.questions.length,
  }));
}

export function getQuestionBank(
  index: number,
  spanish: boolean,
  hasEsthiPro: boolean,
): QuestionData[] {
  return getQuestionData(spanish, hasEsthiPro)[index]?.questions ?? [];
}
