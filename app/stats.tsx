import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useStatsStore } from "@/src/statsStore";
import { useSettingsStore } from "@/src/settingsStore";
import { useSubscription } from "@/src/hooks/useSubscription";
import {
  getQuestionData,
  getQuestionBankSource,
} from "@/src/data/questionData";
import {
  BRAND,
  ACCENT,
  BG,
  TEXT,
  MUTED,
  SUBTLE,
  BORDER,
  SUCCESS,
  DANGER,
} from "@/src/theme/colors";
import { SHADOW_SM } from "@/src/theme/shadows";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function formatDate(ts: number, spanish: boolean) {
  return new Date(ts).toLocaleDateString(spanish ? "es-US" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CollapsibleBody({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const maxHeight = useSharedValue(0);

  useEffect(() => {
    maxHeight.value = withTiming(isOpen ? 600 : 0, { duration: 280 });
  }, [isOpen, maxHeight]);

  const animStyle = useAnimatedStyle(() => ({
    maxHeight: maxHeight.value,
    overflow: "hidden",
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

export default function StatsScreen() {
  const router = useRouter();
  const spanish = useSettingsStore((state) => state.spanish);
  const { hasEsthiPro } = useSubscription();
  const data = getQuestionData(spanish, hasEsthiPro);
  const source = getQuestionBankSource(hasEsthiPro);

  const TABS = spanish ? ["Tarjetas", "Quiz", "Examen"] : ["Flashcards", "Quiz", "Exam"];

  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [expandedQuizSections, setExpandedQuizSections] = useState<string | null>(null);
  const [examTypeFilter, setExamTypeFilter] = useState<"practice" | "mock">("practice");
  const [resetConfirm, setResetConfirm] = useState<number | null>(null);

  const flashcardRatings = useStatsStore((s) => s.flashcardRatings);
  const examHistory = useStatsStore((s) => s.examHistory);
  const quizHistory = useStatsStore((s) => s.quizHistory);
  const resetFlashcardRatings = useStatsStore((s) => s.resetFlashcardRatings);
  const resetExamHistory = useStatsStore((s) => s.resetExamHistory);
  const resetQuizHistory = useStatsStore((s) => s.resetQuizHistory);

  const idToCategoryLookup = useMemo(() => {
    const lookup: Record<string, string> = {};

    data.forEach((section) => {
      section.questions.forEach((q) => {
        lookup[`${source}_${q.id}`] = section.category;
      });
    });

    return lookup;
  }, [data, source]);

  const flashcardSectionStats = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    data.forEach((s) => {
      categoryTotals[s.category] = s.questions.length;
    });

    const categoryRatings: Record<string, { known: number; learning: number }> = {};

    Object.entries(flashcardRatings).forEach(([key, rating]) => {
      const category = idToCategoryLookup[key];
      if (!category) return;

      if (!categoryRatings[category]) {
        categoryRatings[category] = { known: 0, learning: 0 };
      }

      if (rating === "know") categoryRatings[category].known++;
      else categoryRatings[category].learning++;
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      known: categoryRatings[category]?.known ?? 0,
      learning: categoryRatings[category]?.learning ?? 0,
      unreviewed:
        total -
        (categoryRatings[category]?.known ?? 0) -
        (categoryRatings[category]?.learning ?? 0),
    }));
  }, [flashcardRatings, idToCategoryLookup, data]);

  const currentBankRatings = Object.entries(flashcardRatings).filter(
    ([key]) => idToCategoryLookup[key] !== undefined,
  );
  const totalKnown = currentBankRatings.filter(([, rating]) => rating === "know").length;
  const totalLearning = currentBankRatings.filter(([, rating]) => rating === "learning").length;
  const totalCards = data.reduce((sum, s) => sum + s.questions.length, 0);
  const totalUnreviewed = totalCards - totalKnown - totalLearning;

  const quizBySection = useMemo(() => {
    const map: Record<string, typeof quizHistory> = {};

    quizHistory.forEach((q) => {
      if (!map[q.section]) map[q.section] = [];
      map[q.section].push(q);
    });

    return map;
  }, [quizHistory]);

  const filteredExams = useMemo(
    () => examHistory.filter((e) => (e.type ?? "practice") === examTypeFilter),
    [examHistory, examTypeFilter]
  )

  const goToTab = (i: number) => {
    setActiveTab(i);
    setResetConfirm(null);
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
  };

  const handleReset = (tabIndex: number) => {
    if (resetConfirm === tabIndex) {
      if (tabIndex === 0) resetFlashcardRatings();
      else if (tabIndex === 1) resetQuizHistory();
      else resetExamHistory();

      setResetConfirm(null);
    } else {
      setResetConfirm(tabIndex);
    }
  };

  const toggleExam = (id: string) => {
    setExpandedExam((prev) => (prev === id ? null : id));
  };

  const toggleQuizSection = (section: string) => {
    setExpandedQuizSections((prev) => (prev === section ? null : section));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND} />
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>{spanish ? "Progreso" : "Stats"}</Text>

        <Text style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === i && styles.tabBtnActive]}
            onPress={() => goToTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveTab(page);
          setResetConfirm(null);
        }}
      >
        <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
          <View style={styles.overallRow}>
            <View style={styles.overallBadge}>
              <Text style={[styles.overallNum, { color: SUCCESS }]}>{totalKnown}</Text>
              <Text style={styles.overallLabel}>{spanish ? "Lo sé" : "Know It"}</Text>
            </View>

            <View style={styles.overallBadge}>
              <Text style={[styles.overallNum, { color: DANGER }]}>{totalLearning}</Text>
              <Text style={styles.overallLabel}>
                {spanish ? "Aprendiendo" : "Still Learning"}
              </Text>
            </View>

            <View style={styles.overallBadge}>
              <Text style={[styles.overallNum, { color: MUTED }]}>{totalUnreviewed}</Text>
              <Text style={styles.overallLabel}>
                {spanish ? "Sin repasar" : "Unreviewed"}
              </Text>
            </View>
          </View>

          {flashcardSectionStats.map(({ category, known, learning, unreviewed }) => (
            <View key={category} style={styles.statRow}>
              <Text style={styles.statCategory}>{category}</Text>

              <View style={styles.statBarBg}>
                <View style={[styles.statBarSegment, { flex: known, backgroundColor: SUCCESS }]} />
                <View style={[styles.statBarSegment, { flex: learning, backgroundColor: DANGER }]} />
                <View style={[styles.statBarSegment, { flex: unreviewed, backgroundColor: MUTED }]} />
              </View>

              <View style={styles.statCounts}>
                <Text style={[styles.statCount, { color: SUCCESS }]}>
                  {known} {spanish ? "sabidas" : "known"}
                </Text>
                <Text style={[styles.statCount, { color: DANGER }]}>
                  {learning} {spanish ? "aprendiendo" : "learning"}
                </Text>
                <Text style={[styles.statCount, { color: MUTED }]}>
                  {unreviewed} {spanish ? "restantes" : "left"}
                </Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.resetBtn} onPress={() => handleReset(0)}>
            <Text style={styles.resetText}>
              {resetConfirm === 0
                ? spanish
                  ? "Toca otra vez para confirmar"
                  : "Tap again to confirm reset"
                : spanish
                  ? "Restablecer progreso de tarjetas"
                  : "Reset Flashcard Progress"}
            </Text>
          </Pressable>
        </ScrollView>

        <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
          {Object.keys(quizBySection).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {spanish ? "Aún no has tomado quizzes" : "No quizzes taken yet"}
              </Text>
            </View>
          ) : (
            Object.entries(quizBySection).map(([section, attempts]) => {
              const isOpen = expandedQuizSections === section;

              return (
                <View key={section} style={styles.collapseCard}>
                  <Pressable
                    style={styles.collapseHeader}
                    onPress={() => toggleQuizSection(section)}
                  >
                    <View style={styles.collapseHeaderLeft}>
                      <Text style={styles.collapseTitle}>{section}</Text>
                      <Text style={styles.collapseScore}>
                        {attempts.length}{" "}
                        {spanish
                          ? `intento${attempts.length !== 1 ? "s" : ""}`
                          : `attempt${attempts.length !== 1 ? "s" : ""}`}
                      </Text>
                    </View>

                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={MUTED}
                    />
                  </Pressable>

                  <CollapsibleBody isOpen={isOpen}>
                    <View style={styles.collapseBody}>
                      {attempts.map((attempt) => {
                        const pct = Math.round((attempt.score / attempt.total) * 100);

                        return (
                          <View key={attempt.id} style={styles.quizAttemptRow}>
                            <View style={{ gap: 2 }}>
                              <Text style={styles.quizAttemptDate}>
                                {formatDate(attempt.timestamp, spanish)}
                              </Text>
                              <Text style={styles.quizAttemptScore}>
                                {attempt.score}/{attempt.total} - {pct}%
                              </Text>
                            </View>

                            {attempt.questions?.length > 0 && (
                              <Pressable
                                onPress={() =>
                                  router.push({
                                    pathname: "/results",
                                    params: { type: "quiz", id: attempt.id },
                                  })
                                }
                                style={styles.reviewBtn}
                              >
                                <Text style={styles.reviewBtnText}>
                                  {spanish ? "Revisar" : "Review"}
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </CollapsibleBody>
                </View>
              );
            })
          )}

          <Pressable style={styles.resetBtn} onPress={() => handleReset(1)}>
            <Text style={styles.resetText}>
              {resetConfirm === 1
                ? spanish
                  ? "Toca otra vez para confirmar"
                  : "Tap again to confirm reset"
                : spanish
                  ? "Restablecer historial de quizzes"
                  : "Reset Quiz History"}
            </Text>
          </Pressable>
        </ScrollView>

        <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
          <View style={styles.segmentRow}>
            <Pressable
              style={[styles.segmentBtn, examTypeFilter === "practice" && styles.segmentBtnActive]}
              onPress={() => setExamTypeFilter("practice")}
            >
              <Text style={[styles.segmentText, examTypeFilter === "practice" && styles.segmentTextActive]}>
                {spanish ? "Práctica" : "Practice"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, examTypeFilter === "mock" && styles.segmentBtnActive]}
              onPress={() => setExamTypeFilter("mock")}
            >
              <Text style={[styles.segmentText, examTypeFilter === "mock" && styles.segmentTextActive]}>
                Mock
              </Text>
            </Pressable>
          </View>
          {filteredExams.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {spanish ? "Aún no has tomado exámenes" : "No exams taken yet"}
              </Text>
            </View>
          ) : (
            filteredExams.map((exam) => {
              const isOpen = expandedExam === exam.id;
              const pct = Math.round((exam.score / exam.total) * 100);

              return (
                <View key={exam.id} style={styles.collapseCard}>
                  <Pressable
                    style={styles.collapseHeader}
                    onPress={() => toggleExam(exam.id)}
                  >
                    <View style={styles.collapseHeaderLeft}>
                      <Text style={styles.collapseTitle}>
                        {formatDate(exam.timestamp, spanish)}
                      </Text>
                      <Text style={styles.collapseScore}>
                        {exam.score}/{exam.total} - {pct}%
                      </Text>
                    </View>

                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={MUTED}
                    />
                  </Pressable>

                  <CollapsibleBody isOpen={isOpen}>
                    <View style={styles.collapseBody}>
                      {exam.breakdown.map(({ category, correct, total }) => (
                        <View key={category} style={styles.breakdownRow}>
                          <Text style={styles.breakdownCategory}>{category}</Text>
                          <Text style={styles.breakdownScore}>
                            {correct}/{total}
                          </Text>
                          <View style={styles.breakdownBarBg}>
                            <View
                              style={[
                                styles.breakdownBarFill,
                                {
                                  width: `${Math.round((correct / total) * 100)}%` as any,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}

                      {exam.questions?.length > 0 && (
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: "/results",
                              params: { type: "exam", id: exam.id },
                            })
                          }
                          style={styles.reviewBtn}
                        >
                          <Text style={styles.reviewBtnText}>
                            {spanish ? "Revisar preguntas" : "Review Questions"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </CollapsibleBody>
                </View>
              );
            })
          )}

          <Pressable style={styles.resetBtn} onPress={() => handleReset(2)}>
            <Text style={styles.resetText}>
              {resetConfirm === 2
                ? spanish
                  ? "Toca otra vez para confirmar"
                  : "Tap again to confirm reset"
                : spanish
                  ? "Restablecer historial de exámenes"
                  : "Reset Exam History"}
            </Text>
          </Pressable>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BRAND },

  header: {
    backgroundColor: BRAND,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },

  pager: { flex: 1, backgroundColor: BG },

  page: { padding: 20, gap: 12, paddingBottom: 40 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: BRAND },
  tabText: { color: MUTED, fontSize: 14, fontWeight: "800" },
  tabTextActive: { color: BRAND },

  overallRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  overallBadge: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    ...SHADOW_SM,
  },
  overallNum: { fontSize: 22, fontWeight: "800" },
  overallLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
    textAlign: "center",
  },

  statRow: { backgroundColor: "#fff", borderRadius: 12, padding: 14, gap: 6 },
  statCategory: { color: TEXT, fontSize: 13, fontWeight: "700" },
  statBarBg: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: BORDER,
  },
  statBarSegment: { height: 6 },
  statCounts: { flexDirection: "row", gap: 12 },
  statCount: { fontSize: 11, fontWeight: "600" },

  collapseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    ...SHADOW_SM,
  },
  collapseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  collapseHeaderLeft: { gap: 2 },
  collapseTitle: { color: TEXT, fontSize: 14, fontWeight: "700" },
  collapseScore: { color: SUBTLE, fontSize: 13 },
  collapseBody: {
    borderTopWidth: 1,
    borderTopColor: BG,
    padding: 16,
    gap: 10,
  },

  breakdownRow: { gap: 4 },
  breakdownCategory: {
    color: SUBTLE,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  breakdownScore: { color: TEXT, fontSize: 13, fontWeight: "700" },
  breakdownBarBg: { height: 4, backgroundColor: BORDER, borderRadius: 2 },
  breakdownBarFill: { height: 4, backgroundColor: ACCENT, borderRadius: 2 },

  quizAttemptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BG,
  },
  quizAttemptDate: { color: SUBTLE, fontSize: 13 },
  quizAttemptScore: { color: TEXT, fontSize: 13, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: MUTED, fontSize: 15, fontWeight: "600" },

  resetBtn: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DANGER,
    padding: 14,
    alignItems: "center",
  },
  resetText: { color: DANGER, fontSize: 14, fontWeight: "600" },

  reviewBtn: {
    backgroundColor: BRAND,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reviewBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  
  segmentRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 4, ...SHADOW_SM },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  segmentBtnActive: { backgroundColor: BRAND },
  segmentText: { fontSize: 13, fontWeight: "700", color: MUTED },
  segmentTextActive: { color: "#fff" }
});
