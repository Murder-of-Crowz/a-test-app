import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getQuestionBank, type PremQuestion } from "../questionData";
// @ts-ignore
import { getPremQuestions } from "@/src/premDB";

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";
const QUIZ_QUESTION_LIMIT = 20;

type QuestionFromJson = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
};

type QuizQuestion = QuestionFromJson & {
  category: string;
};

function shuffle<T>(items: T[]): T[] {
  const shuffledItems = [...items];

  for (let i = shuffledItems.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffledItems[i], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[i],
    ];
  }

  return shuffledItems;
}

function buildQuiz(index: number, title: string, premQuestions: PremQuestion[] = []): QuizQuestion[] {
  const questionBank = getQuestionBank(index, premQuestions) as QuestionFromJson[] | undefined;

  if (!questionBank || questionBank.length === 0) {
    return [];
  }

  const selectedQuestions = shuffle(questionBank).slice(0, QUIZ_QUESTION_LIMIT);

  return selectedQuestions.map((question) => {
    const correctAnswer = question.answers[question.answerIndex];
    const shuffledAnswers = shuffle(question.answers);

    return {
      ...question,
      category: title,
      answers: shuffledAnswers,
      answerIndex: shuffledAnswers.indexOf(correctAnswer),
    };
  });
}

export default function SubjectQuiz() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { title, index, subjectId } = useLocalSearchParams<{
    title?: string;
    index?: string;
    subjectId?: string;
  }>();

  const quizTitle = title ?? "Quiz";

  const questionBankIndex = Number(index ?? subjectId);

  const [quiz, setQuiz] = useState<QuizQuestion[]>(() => {
    if (Number.isNaN(questionBankIndex)) {
      return [];
    }

    return buildQuiz(questionBankIndex, quizTitle);
  });

  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [premQuestions, setPremQuestions] = useState<PremQuestion[]>([]);

  const answeredCount = Object.keys(selected).length;
  const totalQuestions = quiz.length;

  const score = useMemo(() => {
    return quiz.filter((question, questionIndex) => {
      return selected[questionIndex] === question.answerIndex;
    }).length;
  }, [quiz, selected]);

  useEffect(() => {
    try {
      const prem = getPremQuestions() as PremQuestion[];
      setPremQuestions(prem);
      if (!Number.isNaN(questionBankIndex)) {
        setQuiz(buildQuiz(questionBankIndex, quizTitle, prem));
      }
    } catch {

    }
  }, [])

  const scorePercent =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleRetakeQuiz = () => {
    if (!Number.isNaN(questionBankIndex)) {
      setQuiz(buildQuiz(questionBankIndex, quizTitle, premQuestions));
    }
  
    setSelected({});
    setSubmitted(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNewQuiz = () => {
    router.push("/quizSelection");
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable
            onPress={() => {
              router.push("/dashboard");
            }}
            hitSlop={12}>
            <Ionicons name='arrow-back' size={24} color='#ffffff' />
          </Pressable>
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {quizTitle}
        </Text>

        <View style={styles.headerSideRight}>
          <Text style={styles.headerCount}>
            {answeredCount} / {totalQuestions}
          </Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        {totalQuestions === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardQuestion}>
              No questions found for this subject.
            </Text>
          </View>
        )}

        {submitted && totalQuestions > 0 && (
          <View style={styles.resultBanner}>
            <Text style={styles.resultText}>
              {score} / {totalQuestions} = {scorePercent}%
            </Text>
            <View style={styles.breakdownBtnOptions}>
              <Pressable
                style={styles.resultBtnOptions}
                onPress={handleRetakeQuiz}>
                <Ionicons name='refresh' size={16} color={BRAND} />
                <Text>Retake Quiz</Text>
              </Pressable>
              <Pressable
                style={styles.resultBtnOptions}
                onPress={handleNewQuiz}>
                <Ionicons name='newspaper' size={16} color={BRAND} />
                <Text>New Quiz</Text>
              </Pressable>
              <Pressable style={styles.resultBtnOptions} onPress={handleGoHome}>
                <Ionicons name='home' size={16} color={BRAND} />
                <Text>Home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {quiz.map((question, questionIndex) => {
          const pickedAnswer = selected[questionIndex];

          return (
            <View key={`${question.id}-${questionIndex}`} style={styles.card}>
              <Text style={styles.cardCategory}>{question.category}</Text>

              <Text style={styles.cardQuestion}>
                {questionIndex + 1}. {question.question}
              </Text>

              {question.answers.map((answer, answerIndex) => {
                const isPicked = pickedAnswer === answerIndex;
                const isCorrect = answerIndex === question.answerIndex;

                let optionStyle = {};
                let icon = <View style={styles.iconPlaceholder} />;

                if (submitted) {
                  if (isCorrect) {
                    optionStyle = styles.optionCorrect;
                    icon = (
                      <Ionicons
                        name='checkmark-circle'
                        size={20}
                        color='#16a34a'
                      />
                    );
                  } else if (isPicked) {
                    optionStyle = styles.optionWrong;
                    icon = (
                      <Ionicons name='close-circle' size={20} color='#dc2626' />
                    );
                  }
                }

                return (
                  <Pressable
                    key={`${question.id}-${answerIndex}`}
                    style={[styles.option, optionStyle]}
                    disabled={submitted}
                    onPress={() =>
                      setSelected((currentSelected) => ({
                        ...currentSelected,
                        [questionIndex]: answerIndex,
                      }))
                    }>
                    {submitted ? (
                      icon
                    ) : (
                      <View
                        style={[styles.radio, isPicked && styles.radioFilled]}>
                        {isPicked && <View style={styles.radioDot} />}
                      </View>
                    )}

                    <Text
                      style={[
                        styles.optionText,
                        !submitted && isPicked && styles.optionTextSelected,
                      ]}>
                      {answer}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {!submitted && totalQuestions > 0 && (
          <Pressable
            style={[
              styles.submitBtn,
              answeredCount < totalQuestions && styles.submitBtnDisabled,
            ]}
            disabled={answeredCount < totalQuestions}
            onPress={() => {
              setSubmitted(true);
              scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}>
            <Text style={styles.submitText}>
              {answeredCount < totalQuestions
                ? `Answer all questions (${answeredCount}/${totalQuestions})`
                : "Submit Quiz"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    backgroundColor: BRAND,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerSide: {
    width: 56,
    alignItems: "flex-start",
  },

  headerSideRight: {
    width: 56,
    alignItems: "flex-end",
  },

  headerTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  headerCount: {
    color: "#93c5fd",
    fontSize: 14,
    fontWeight: "600",
  },

  scroll: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },

  resultBanner: {
    backgroundColor: BRAND,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  resultText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardCategory: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  cardQuestion: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },

  optionCorrect: {
    backgroundColor: "#f0fdf4",
    borderColor: "#16a34a",
  },

  optionWrong: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
  },

  optionText: {
    flex: 1,
    color: "#374151",
    fontSize: 14,
  },

  optionTextSelected: {
    color: BRAND,
    fontWeight: "600",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },

  radioFilled: {
    borderColor: ACCENT,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },

  iconPlaceholder: {
    width: 20,
  },

  submitBtn: {
    backgroundColor: BRAND,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },

  submitBtnDisabled: {
    opacity: 0.45,
  },

  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  resultBtnOptions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    width: "100%",
    paddingHorizontal: 24,
  },
  breakdownBtnOptions: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginTop: 12,
  },
});
