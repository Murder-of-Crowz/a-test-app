import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CustomerInfo } from "react-native-purchases";
import { Paywall } from "@/src/components/Paywall";
import {
  getQuestionData,
  getQuestionBankSource,
  type QuestionSection,
} from "@/src/data/questionData";
import { useSubscription } from "@/src/hooks/useSubscription";
import { hasEsthiPro as customerHasEsthiPro } from "@/src/revenuecat/subscriptionManager";
import { useSettingsStore } from "@/src/settingsStore";
import { useStatsStore } from "@/src/statsStore";
import { BRAND, ACCENT, BG, TEXT, MUTED, SUBTLE, BORDER, SUCCESS, DANGER, WARNING } from "@/src/theme/colors";
import { SHADOW_MD } from "@/src/theme/shadows";

const TOTAL = 100;
const TIMER_SECONDS = 90 * 60;
const PASS_THRESHOLD = 0.75;

type Question = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
  source: "free" | "prem";
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMockExam(
  data: QuestionSection[],
  source: "free" | "prem",
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
    const pool = shuffle(
      section.questions.map((q) => ({
        ...q,
        category: section.category,
        source,
      })),
    );
    pool.slice(0, count).forEach((q) => {
      const correct = q.answers[q.answerIndex];
      const shuffled = shuffle(q.answers);
      questions.push({ ...q, answers: shuffled, answerIndex: shuffled.indexOf(correct) });
    });
  }
  return shuffle(questions);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MockExamScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const addExamResult = useStatsStore((s) => s.addExamResult);
  const spanish = useSettingsStore((state) => state.spanish);
  const {
    hasEsthiPro,
    isLoading: subscriptionLoading,
    refresh,
    updateCustomerInfo,
  } = useSubscription();
  const data = getQuestionData(spanish, hasEsthiPro);
  const source = getQuestionBankSource(hasEsthiPro);

  const [exam, setExam] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showMissedOnly, setShowMissedOnly] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setExam(buildMockExam(data, source));
  }, [data, source]);

  const startExam = useCallback(() => {
    setGateVisible(false);
    setExamStarted(true);
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setGateVisible(false);
      setPaywallVisible(false);
      return;
    }

    if (subscriptionLoading || examStarted || submitted) return;

    if (hasEsthiPro) {
      startExam();
      return;
    }

    setGateVisible(true);
  }, [examStarted, hasEsthiPro, isFocused, startExam, submitted, subscriptionLoading]);

  // Timer
  useEffect(() => {
    if (!examStarted || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [examStarted, submitted]);

  function handleSubmit() {
    clearInterval(timerRef.current!);
    setSubmitted(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handlePaywallSuccess(customerInfo?: CustomerInfo) {
    setPaywallVisible(false);
    useSettingsStore.setState({ forceFreeForTesting: false });

    if (customerInfo) {
      updateCustomerInfo(customerInfo);
      if (customerHasEsthiPro(customerInfo)) {
        startExam();
      }
      return;
    }

    refresh();
  }

  function handleCancelGate() {
    setGateVisible(false);
    router.replace("/dashboard");
  }

  const answeredCount = Object.keys(selected).length;
  const score = useMemo(() => 
    exam.filter((q, i) => selected[i] === q.answerIndex).length,
  [exam, selected]
  );
  const passed = score / TOTAL >= PASS_THRESHOLD;

  const breakdown = useMemo(() => {
    if (!submitted) return [];
    const map: Record<string, { correct: number, total: number }> = {};
    exam.forEach((q, i) => {
      if (!map[q.category]) map[q.category] = { correct: 0, total: 0 };
      map[q.category].total++;
      if (selected[i] === q.answerIndex) map[q.category].correct++;
    });
    return Object.entries(map).map(([category, stats]) => ({ category, ...stats }));
  }, [exam, selected, submitted]);

  useEffect(() => {
    if (!submitted) return;
    addExamResult({
      timestamp: Date.now(),
      score,
      total: TOTAL,
      type: "mock",
      breakdown,
      questions: exam.map((q, i) => ({
        questionId: q.id,
        source: q.source,
        correct: selected[i] === q.answerIndex,
        category: q.category,
        selectedAnswer: q.answers[selected[i]],
      })),
    });
  }, [addExamResult, breakdown, exam, score, selected, submitted]);

  const timerColor = timeLeft < 300 ? DANGER : timeLeft < 600 ? WARNING : "#94c5fd";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND} />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mock Exam</Text>
        <Text style={[styles.timer, { color: timerColor }]}>
          {examStarted && !submitted ? formatTime(timeLeft) : `${answeredCount}/${TOTAL}`}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={styles.scroll}
      >
        {/* Result */}
        {submitted && (
          <View style={[styles.resultBanner, { backgroundColor: passed ? SUCCESS : DANGER }]}>
            <Ionicons
              name={passed ? "checkmark-circle" : "close-circle"}
              size={40}
              color="#fff" 
            />
            <Text style={styles.resultLabel}>{passed ? "PASSED" : "FAILED"}</Text>
            <Text style={styles.resultScore}>
              {score} / {TOTAL} - {Math.round((score / TOTAL) * 100)}%
            </Text>
            <Text style={styles.resultSub}>
              {passed ? "Great job!" : `Need ${Math.round(PASS_THRESHOLD * 100)}% to pass.`}
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
              <Pressable
                style={[styles.missedToggle, showMissedOnly && styles.missedToggleActive]}
                onPress={() => setShowMissedOnly((v) => !v)}
              >
                <Ionicons name={showMissedOnly ? "eye-off-outline" : "eye-outline"} size={16} color={showMissedOnly ? BRAND : "#fff"} />
                <Text style={[styles.missedToggleText, showMissedOnly && styles.missedToggleTextActive]}>
                  {showMissedOnly ? "Show All" : `Show Missed (${TOTAL - score})`}
                </Text>
              </Pressable>
              <Pressable style={styles.doneBtn} onPress={() => router.replace("/dashboard")}>
                <Text style={styles.doneBtnText}>Back to Dashboard</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Questions */}
        {examStarted && exam.map((q, qi) => {
          if (showMissedOnly && selected[qi] === q.answerIndex) return null;
          const picked = selected[qi];
          return (
            <View key={qi} style={styles.card}>
              <Text style={styles.cardQuestion}>{qi + 1}. {q.question}</Text>
              {q.answers.map((ans, ai) => {
                const isPicked = picked === ai;
                const isCorrect = ai === q.answerIndex;
                let rowExtra = {};
                let icon = <View style={{ width: 20 }} />
                if (submitted) {
                  if (isCorrect) {
                    rowExtra = styles.optionCorrect;
                    icon = <Ionicons name="checkmark-circle" size={20} color={SUCCESS} />;
                  } else if (isPicked) {
                    rowExtra = styles.optionWrong;
                    icon = <Ionicons name="close-circle" size={20} color={DANGER} />;
                  }
                }
                  return (
                    <Pressable
                      key={ai}
                      style={[styles.option, rowExtra]}
                      onPress={() => { if (submitted) return; setSelected((s) => ({ ...s, [qi]: ai })); }}
                      disabled={submitted}
                    >
                      {submitted ? icon : (
                        <View style={[styles.radio, isPicked && styles.radioFilled]}>
                          {isPicked && <View style={styles.radioDot} />}
                        </View>
                      )}
                      <Text style={[styles.optionText, !submitted && isPicked && styles.optionTextSelected]}>{ans}</Text>
                    </Pressable>
                  );
              })}
            </View>
          );
        })}

        {/* Submit */}
        {examStarted && !submitted && (
          <Pressable
            style={[styles.submitBtn, answeredCount < TOTAL && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={answeredCount < TOTAL}
          >
            <Text style={styles.submitText}>
              {answeredCount < TOTAL ? `Answer all questions (${answeredCount}/${TOTAL})` : "Submit Exam"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Gate Modal */}
      <Modal visible={isFocused && gateVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Ionicons name="trophy-outline" size={40} color={BRAND} />
            <Text style={styles.modalTitle}>Mock Exam</Text>
            <Text style={styles.modalSub}>
              Simulate the real board exam - 100 questions, 90 minutes. Unlock unlimited mock exams with Esthi Pro.
            </Text>
            <Pressable style={styles.premBtn} onPress={() => setPaywallVisible(true)}>
              <Text style={styles.premBtnText}>Go Premium - Unlimited Access</Text>
            </Pressable>
            <Pressable onPress={handleCancelGate} hitSlop={12}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFocused && paywallVisible}
        animationType="slide"
        onRequestClose={() => setPaywallVisible(false)}
      >
        <Paywall
          onPurchaseSuccess={handlePaywallSuccess}
          onPurchaseError={(error) => {
            console.error("Mock exam purchase error:", error);
          }}
          onClose={() => setPaywallVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BRAND },

  content: { flex: 1, backgroundColor: BG },

  header: {
    backgroundColor: BRAND,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  timer: { fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },

  scroll: { padding: 20, gap: 16, paddingBottom: 40 },

  resultBanner: { borderRadius: 16, padding: 24, alignItems: "center", gap: 8 },
  resultLabel: { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: 1 },
  resultScore: { color: "#fff", fontSize: 20, fontWeight: "700" },
  resultSub: { color: "rgba(255,255,255,0.8)", fontSize: 14 },

  breakdown: { width: "100%", marginTop: 16, gap: 10 },
  breakdownRow: { gap: 4 },
  breakdownCategory: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  breakdownScore: { color: "#fff", fontSize: 14, fontWeight: "700" },
  breakdownBarBg: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2 },
  breakdownBarFill: { height: 4, backgroundColor: "#fff", borderRadius: 2 },

  missedToggle: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11, marginTop: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  missedToggleActive: { backgroundColor: "#fff" },
  missedToggleText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  missedToggleTextActive: { color: BRAND },

  doneBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  doneBtnText: { color: BRAND, fontWeight: "700", fontSize: 15 },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 10, ...SHADOW_MD },
  cardCategory: { color: MUTED, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  cardQuestion: { color: TEXT, fontSize: 15, fontWeight: "600", lineHeight: 22 },

  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: BORDER, backgroundColor: "#f8fafc" },
  optionCorrect: { backgroundColor: "#f0fdf4", borderColor: SUCCESS },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: DANGER },
  optionText: { flex: 1, color: "#374151", fontSize: 14 },
  optionTextSelected: { color: BRAND, fontWeight: "600" },

  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#cbd5e1", justifyContent: "center", alignItems: "center" },
  radioFilled: { borderColor: ACCENT },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },

  submitBtn: { backgroundColor: BRAND, borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 32 },
  modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 24, width: "100%", alignItems: "center", gap: 12 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: TEXT },
  modalSub: { fontSize: 14, color: SUBTLE, textAlign: "center", lineHeight: 20 },
  premBtn: { borderRadius: 14, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, borderColor: ACCENT },
  premBtnText: { color: ACCENT, fontWeight: "700", fontSize: 15 },
  cancelText: { color: MUTED, fontSize: 14, marginTop: 4 },
});
