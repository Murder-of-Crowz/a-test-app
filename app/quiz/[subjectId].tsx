import { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import data from "@/assets/questions.json";

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";

type Question = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
};

type QuestionFromJson = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
};

type QuizSection = {
  sectionId: number;
  categoryId?: string;
  category: string;
  weight: number;
  questions: QuestionFromJson[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

function buildSubjectQuiz(categoryTitle: string): Question[] {
  const sections = data as QuizSection[];

  const selectedSection = sections.find((section) => {
    return (
      normalizeCategory(section.category) === normalizeCategory(categoryTitle)
    );
  });

  if (!selectedSection) {
    return [];
  }

  return shuffle(selectedSection.questions).map((question) => {
    const correctAnswer = question.answers[question.answerIndex];
    const shuffledAnswers = shuffle(question.answers);

    return {
      ...question,
      category: selectedSection.category,
      answers: shuffledAnswers,
      answerIndex: shuffledAnswers.indexOf(correctAnswer),
    };
  });
}

export default function SubjectQuiz() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { subject, title } = useLocalSearchParams<{
    subject: string;
    title: string;
  }>();

  const [quiz] = useState<Question[]>(() => buildSubjectQuiz(title));
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(selected).length;
  const totalQuestions = quiz.length;

  const score = useMemo(() => {
    return quiz.filter((question, index) => {
      return selected[index] === question.answerIndex;
    }).length;
  }, [quiz, selected]);

  const quizTitle = quiz[0]?.category ?? "Quiz";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name='arrow-back' size={24} color='#ffffff' />
        </Pressable>

        <Text style={styles.headerTitle}>{quizTitle}</Text>

        <Text style={styles.headerCount}>
          {answeredCount} / {totalQuestions}
        </Text>
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
              {score} / {totalQuestions} ={" "}
              {Math.round((score / totalQuestions) * 100)}%
            </Text>
          </View>
        )}

        {quiz.map((question, questionIndex) => {
          const pickedAnswer = selected[questionIndex];

          return (
            <View key={question.id} style={styles.card}>
              <Text style={styles.cardCategory}>{question.category}</Text>

              <Text style={styles.cardQuestion}>
                {questionIndex + 1}. {question.question}
              </Text>

              {question.answers.map((answer, answerIndex) => {
                const isPicked = pickedAnswer === answerIndex;
                const isCorrect = answerIndex === question.answerIndex;

                let optionStyle = {};
                let icon = <View style={{ width: 20 }} />;

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
                    key={answerIndex}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 12,
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
});
