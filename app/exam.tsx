import { useMemo, useRef, useState } from "react";
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
import data from "@/assets/questions.json"

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";
const TOTAL = 25;

type Question = {
  id: number,
  question: string,
  answers: string[],
  answerIndex: number,
  category: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildExam(): Question[] {
  const totalWeight = data.reduce((sum, s) => sum + s.weight, 0);
  const counts = data.map(s => ({
    section: s,
    count: Math.round((s.weight / totalWeight) * TOTAL),
  }));

  const diff = TOTAL - counts.reduce((sum, c) => sum + c.count, 0);
  counts[0].count += diff;

  const questions: Question[] = [];
  for (const { section, count } of counts) {
    shuffle(section.questions).slice(0, count).forEach(q => {
      const correct = q.answers[q.answerIndex];
      const shuffledAnswer = shuffle(q.answers);
      questions.push({
        ...q,
        category: section.category,
        answers: shuffledAnswer,
        answerIndex: shuffledAnswer.indexOf(correct),
      });
    });
  }
  return shuffle(questions)
}

export default function ExamScreen() {
  const router = useRouter();
  const [exam] = useState<Question[]>(() => buildExam());
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const answeredCount = Object.keys(selected).length;
  const score = useMemo(
    () => exam.filter((q, i) => selected[i] === q.answerIndex).length,
    [submitted]
  );

  const breakdown = useMemo(() => {
    if (!submitted) return [];
    const map: Record<string, { correct: number, total: number }> = {};
    exam.forEach((q, i) => {
      if (!map[q.category]) map[q.category] = { correct: 0, total: 0 };
      map[q.category].total++;
      if (selected[i] === q.answerIndex) map[q.category].correct++;
    });
    return Object.entries(map).map(([category, stats]) => ({ category, ...stats }))
  }, [submitted]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Practice Exam</Text>
        <Text style={styles.headerCount}>{answeredCount} / {TOTAL}</Text>
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
                  <Text style={styles.breakdownScore}>{correct} / {total}</Text>
                  <View style={styles.breakdownBarBg}>
                    <View style={[styles.breakdownBarFill, { width: `${Math.round((correct / total) * 100)}%` as any}]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {exam.map((q, qi) => {
          const picked = selected[qi];
          return (
            <View key={qi} style={styles.card}>
              <Text style={styles.cardCategory}>{q.category}</Text>
              <Text style={styles.cardQuestion}>{qi + 1}. {q.question}</Text>

              {q.answers.map((ans, ai) => {
                const isPicked = picked === ai;
                const isCorrect = ai === q.answerIndex;

                let rowExtra = {};
                let icon = <View style={{ width: 20}} />;

                if (submitted) {
                  if (isCorrect) {
                    rowExtra = styles.optionCorrect;
                    icon = <Ionicons name="checkmark-circle" size={20} color="#16a34a" />;
                  } else if (isPicked) {
                    rowExtra = styles.optionWrong;
                    icon = <Ionicons name="close-circle" size={20} color="#dc2626" />;
                  }
                }

                return (
                  <Pressable
                    key={ai}
                    style={[styles.option, rowExtra]}
                    onPress={() => !submitted && setSelected(s => ({ ...s, [qi]: ai}))}
                    disabled={submitted}
                  >
                    {submitted ? icon : (
                      <View style={[styles.radio, isPicked && styles.radioFilled]}>
                        {isPicked && <View style={styles.radioDot} />}
                      </View>
                    )}
                    <Text style={[styles.optionText, !submitted && isPicked && styles.optionTextSelected]}>
                      {ans}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )
        })}

        {!submitted && (
          <Pressable
            style={[styles.submitBtn, answeredCount < TOTAL && styles.submitBtnDisabled]}
            onPress={() => {
              setSubmitted(true);
              scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}
            disabled={answeredCount < TOTAL}
          >
            <Text style={styles.submitText}>
              {answeredCount < TOTAL
              ? `Answer all questions (${answeredCount}/${TOTAL})`
              : "Submit Exam"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9"},

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
  breakdownBarBg: { height: 4, backgroundColor: "rgba(255,255,255,0.2", borderRadius: 2 },
  breakdownBarFill: { height: 4, backgroundColor: "#fff", borderRadius: 2 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardCategory: { color: "#94a3b8", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  cardQuestion: { color: "#1e293b", fontSize: 15, fontWeight: "600", lineHeight: 22 },

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
  optionCorrect: { backgroundColor: "#f0fdf4", borderColor: "#16a34a" },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: "#dc2626" },
  optionText: { flex: 1, color: "#374151", fontSize: 14 },
  optionTextSelected: { color: BRAND, fontWeight: "600" },

  radio: { 
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center"
  },
  radioFilled: { borderColor: ACCENT },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },

  submitBtn: { backgroundColor: BRAND, borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});