import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import englishData from "@/assets/questions.json";
import spanishData from "@/assets/spanishQuestions.json";

import { useSettingsStore } from "@/src/settingsStore";
// @ts-ignore
import { getPremQuestions } from "@/src/premDB";
import { useStatsStore } from "@/src/statsStore";
import {
  BRAND,
  ACCENT,
  BG,
  TEXT,
  MUTED,
  BORDER,
  SUCCESS,
  DANGER,
} from "@/src/theme/colors";
import { SHADOW_MD } from "@/src/theme/shadows";

const TOTAL = 25;

type Question = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
  source: "free" | "prem";
};

type QuestionSection = {
  category: string;
  weight: number;
  questions: Omit<Question, "category" | "source">[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function buildExam(
  data: QuestionSection[],
  premQuestions: Question[] = [],
): Question[] {
  const totalWeight = data.reduce((sum, s) => sum + s.weight, 0);

  const counts = data.map((s) => ({
    section: s,
    count: Math.round((s.weight / totalWeight) * TOTAL),
  }));

  const diff = TOTAL - counts.reduce((sum, c) => sum + c.count, 0);
  counts[0].count += diff;

  const questions: Question[] = [];

  for (const { section, count } of counts) {
    const premForSection = premQuestions.filter(
      (q) => q.category === section.category,
    );

    const pool = shuffle([
      ...section.questions.map((q) => ({
        ...q,
        category: section.category,
        source: "free" as const,
      })),
      ...premForSection.map((q) => ({
        ...q,
        source: "prem" as const,
      })),
    ]);

    pool.slice(0, count).forEach((q) => {
      const correct = q.answers[q.answerIndex];
      const shuffledAnswers = shuffle(q.answers);

      questions.push({
        ...q,
        answers: shuffledAnswers,
        answerIndex: shuffledAnswers.indexOf(correct),
      });
    });
  }

  return shuffle(questions);
}

export default function ExamScreen() {
  const router = useRouter();
  const spanish = useSettingsStore((state) => state.spanish);
  const data = (spanish ? spanishData : englishData) as QuestionSection[];

  const [exam, setExam] = useState<Question[]>([]);
  const [premCards, setPremCards] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showMissedOnly, setShowMissedOnly] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const savedExam = useStatsStore((s) => s.savedExam);
  const saveExamProgress = useStatsStore((s) => s.saveExamProgress);
  const clearSavedExam = useStatsStore((s) => s.clearSavedExam);
  const addExamResult = useStatsStore((s) => s.addExamResult);

  useEffect(() => {
    try {
      const prem = getPremQuestions() as Question[];
      setPremCards(prem);

      if (savedExam && savedExam.questions.length > 0) {
        setExam(savedExam.questions);
        setSelected(savedExam.answers);
      } else {
        setExam(buildExam(data, prem));
      }
    } catch {
      if (savedExam && savedExam.questions.length > 0) {
        setExam(savedExam.questions);
        setSelected(savedExam.answers);
      } else {
        setExam(buildExam(data));
      }
    }

    setSubmitted(false);
    setShowMissedOnly(false);
  }, [spanish]);

  const answeredCount = Object.keys(selected).length;

  const score = useMemo(
    () => exam.filter((q, i) => selected[i] === q.answerIndex).length,
    [exam, selected],
  );

  const breakdown = useMemo(() => {
    if (!submitted) return [];

    const map: Record<string, { correct: number; total: number }> = {};

    exam.forEach((q, i) => {
      if (!map[q.category]) map[q.category] = { correct: 0, total: 0 };

      map[q.category].total++;

      if (selected[i] === q.answerIndex) {
        map[q.category].correct++;
      }
    });

    return Object.entries(map).map(([category, stats]) => ({
      category,
      ...stats,
    }));
  }, [submitted, exam, selected]);

  useEffect(() => {
    if (!submitted) return;

    addExamResult({
      timestamp: Date.now(),
      score,
      total: TOTAL,
      breakdown,
      questions: exam.map((q, i) => ({
        questionId: q.id,
        source: q.source,
        correct: selected[i] === q.answerIndex,
        category: q.category,
        selectedAnswer: q.answers[selected[i]],
      })),
    });
  }, [submitted]);

  function handleNewExam() {
    setExam(buildExam(data, premCards));
    setSelected({});
    setSubmitted(false);
    setShowMissedOnly(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    clearSavedExam();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {spanish ? "Examen de práctica" : "Practice Exam"}
        </Text>

        <Text style={styles.headerCount}>
          {answeredCount} / {TOTAL}
        </Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        {submitted && (
          <View style={styles.resultBanner}>
            <Text style={styles.resultText}>
              {score} / {TOTAL} = {Math.round((score / TOTAL) * 100)}%
            </Text>

            <View style={styles.breakdown}>
              {breakdown.map(({ category, correct, total }) => (
                <View key={category} style={styles.breakdownRow}>
                  <Text style={styles.breakdownCategory}>{category}</Text>
                  <Text style={styles.breakdownScore}>
                    {correct} / {total}
                  </Text>

                  <View style={styles.breakdownBarBg}>
                    <View
                      style={[
                        styles.breakdownBarFill,
                        {
                          width: `${Math.round(
                            (correct / total) * 100,
                          )}%` as any,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}

              <Pressable
                style={[
                  styles.missedToggle,
                  showMissedOnly && styles.missedToggleActive,
                ]}
                onPress={() => setShowMissedOnly((v) => !v)}
              >
                <Ionicons
                  name={showMissedOnly ? "eye-off-outline" : "eye-outline"}
                  size={16}
                  color={showMissedOnly ? BRAND : "#fff"}
                />

                <Text
                  style={[
                    styles.missedtoggleText,
                    showMissedOnly && styles.missedToggleTextActive,
                  ]}
                >
                  {showMissedOnly
                    ? spanish
                      ? "Mostrar todo"
                      : "Show All"
                    : spanish
                      ? `Mostrar solo falladas (${TOTAL - score})`
                      : `Show Missed Only (${TOTAL - score})`}
                </Text>
              </Pressable>

              <Pressable style={styles.newExamBtn} onPress={handleNewExam}>
                <Ionicons name="refresh" size={18} color={BRAND} />
                <Text style={styles.newExamText}>
                  {spanish ? "Nuevo examen" : "New Exam"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {exam.map((q, qi) => {
          if (showMissedOnly && selected[qi] === q.answerIndex) return null;

          const picked = selected[qi];

          return (
            <View key={`${q.source}-${q.id}-${qi}`} style={styles.card}>
              <Text style={styles.cardCategory}>{q.category}</Text>

              <Text style={styles.cardQuestion}>
                {qi + 1}. {q.question}
              </Text>

              {q.answers.map((ans, ai) => {
                const isPicked = picked === ai;
                const isCorrect = ai === q.answerIndex;

                let rowExtra = {};
                let icon = <View style={{ width: 20 }} />;

                if (submitted) {
                  if (isCorrect) {
                    rowExtra = styles.optionCorrect;
                    icon = (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={SUCCESS}
                      />
                    );
                  } else if (isPicked) {
                    rowExtra = styles.optionWrong;
                    icon = (
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={DANGER}
                      />
                    );
                  }
                }

                return (
                  <Pressable
                    key={ai}
                    style={[styles.option, rowExtra]}
                    onPress={() => {
                      if (submitted) return;

                      const next = { ...selected, [qi]: ai };
                      setSelected(next);

                      saveExamProgress({
                        questions: exam,
                        answers: next,
                        startedAt: Date.now(),
                      });
                    }}
                    disabled={submitted}
                  >
                    {submitted ? (
                      icon
                    ) : (
                      <View
                        style={[styles.radio, isPicked && styles.radioFilled]}
                      >
                        {isPicked && <View style={styles.radioDot} />}
                      </View>
                    )}

                    <Text
                      style={[
                        styles.optionText,
                        !submitted && isPicked && styles.optionTextSelected,
                      ]}
                    >
                      {ans}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {!submitted && (
          <Pressable
            style={[
              styles.submitBtn,
              answeredCount < TOTAL && styles.submitBtnDisabled,
            ]}
            onPress={() => {
              clearSavedExam();
              setSubmitted(true);
              scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}
            disabled={answeredCount < TOTAL}
          >
            <Text style={styles.submitText}>
              {answeredCount < TOTAL
                ? spanish
                  ? `Responde todas las preguntas (${answeredCount}/${TOTAL})`
                  : `Answer all questions (${answeredCount}/${TOTAL})`
                : spanish
                  ? "Enviar examen"
                  : "Submit Exam"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    backgroundColor: BRAND,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerCount: { color: "#94c5fd", fontSize: 14 },

  scroll: { padding: 20, gap: 16, paddingBottom: 40 },

  resultBanner: {
    backgroundColor: BRAND,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  resultText: { color: "#fff", fontSize: 20, fontWeight: "800" },

  breakdown: { width: "100%", marginTop: 16, gap: 10 },
  breakdownRow: { gap: 4 },
  breakdownCategory: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  breakdownScore: { color: "#fff", fontSize: 14, fontWeight: "700" },
  breakdownBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
  },
  breakdownBarFill: { height: 4, backgroundColor: "#fff", borderRadius: 2 },

  missedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  missedToggleActive: { backgroundColor: "#fff" },
  missedtoggleText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  missedToggleTextActive: { color: BRAND },

  newExamBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  newExamText: { color: BRAND, fontSize: 15, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
    ...SHADOW_MD,
  },
  cardCategory: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardQuestion: {
    color: TEXT,
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
    borderColor: BORDER,
    backgroundColor: "#f8fafc",
  },
  optionCorrect: { backgroundColor: "#f0fdf4", borderColor: SUCCESS },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: DANGER },
  optionText: { flex: 1, color: "#374151", fontSize: 14 },
  optionTextSelected: { color: BRAND, fontWeight: "600" },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioFilled: { borderColor: ACCENT },
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
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});