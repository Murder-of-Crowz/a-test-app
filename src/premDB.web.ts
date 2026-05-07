export async function initPremDB() {}

export type PremQuestion = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
};

export function getPremQuestions(): PremQuestion[] { return []; }

export default { initPremDB, getPremQuestions };