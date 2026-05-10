import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { 
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolate } from "react-native-reanimated";
import { useStatsStore } from "@/src/statsStore";
import data from "@/assets/questions.json";
// @ts-ignore
import { getPremQuestions, PremQuestion } from "@/src/premDB";
import { BRAND, ACCENT, BG, TEXT, MUTED, SUBTLE, BORDER, SUCCESS, DANGER } from "@/app/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TABS = ["Flashcards", "Quiz", "Exam" ] as const;

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CollapsibleBody({ isOpen, children }: { isOpen: boolean; children: React.ReactNode}) {
  const maxHeight = useSharedValue(0);

  useEffect(() => {
    maxHeight.value = withTiming(isOpen ? 600 : 0, { duration: 280 });
  }, [isOpen]);

  const animStyle = useAnimatedStyle(() => ({
    maxHeight: maxHeight.value,
    overflow: "hidden",
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>
}

export default function StatsScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [premCards, setPremCards] = useState<PremQuestion[]>([]);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [expandedQuizSections, setExpandedQuizSections] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState<number | null>(null);

  const flashcardRatings = useStatsStore((s) => s.flashcardRatings);
  const examHistory = useStatsStore((s) => s.examHistory);
  const quizHistory = useStatsStore((s) => s.quizHistory);
  const resetFlashcardRatings = useStatsStore((s) => s.resetFlashcardRatings);
  const resetExamHistory = useStatsStore((s) => s.resetExamHistory);
  const resetQuizHistory = useStatsStore((s) => s.resetQuizHistory);
  const resetStats = useStatsStore((s) => s.resetStats);

  useEffect(() => {
    try { setPremCards(getPremQuestions()); } catch {}
  }, []);

  const idToCategoryLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    data.forEach(section => {
      section.questions.forEach(q => {
        lookup[`free_${q.id}`] = section.category;
      });
    });
    premCards.forEach(q => {
      lookup[`prem_${q.id}`] = q.category
    });
    return lookup;
  }, [premCards]);

  const flashcardSectionStats = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    data.forEach(s => { categoryTotals[s.category] = s.questions.length; });
    premCards.forEach(q => {
      categoryTotals[q.category] = (categoryTotals[q.category] || 0) + 1;
    });

    const categoryRatings: Record<string, { known: number, learning: number }> = {};
    Object.entries(flashcardRatings).forEach(([key, rating]) => {
      const category = idToCategoryLookup[key];
      if (!category) return;

      if (!categoryRatings[category]) categoryRatings[category] = { known: 0, learning: 0 };
      if (rating === "know") categoryRatings[category].known++;
      else categoryRatings[category].learning++;
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      known: categoryRatings[category]?.known ?? 0,
      learning: categoryRatings[category]?.learning ?? 0,
      unreviewed: total - (categoryRatings[category]?.known ?? 0) - (categoryRatings[category]?.learning ?? 0),
    }));
  }, [flashcardRatings, idToCategoryLookup, premCards])

  const totalKnown = Object.values(flashcardRatings).filter(r => r === "know").length;
  const totalLearning = Object.values(flashcardRatings).filter(r => r === "learning").length;
  const totalCards = data.reduce((sum, s) => sum + s.questions.length, 0) + premCards.length;
  const totalUnreviewed = totalCards - totalKnown - totalLearning

  const quizBySection = useMemo(() => {
    const map: Record<string, typeof quizHistory> = {};
    quizHistory.forEach(q => {
      if (!map[q.section]) map[q.section] = [];
      map[q.section].push(q);
    });
    return map;
  }, [quizHistory]);

  const goToTab = (i: number) => {
    setActiveTab(i);
    setResetConfirm(null);
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
  };

  const handleReset = (tabIndex: number) => {
    if (resetConfirm === tabIndex) {
      if (tabIndex === 0) resetFlashcardRatings();
      else if (tabIndex === 1) resetQuizHistory();
      else resetExamHistory;
      setResetConfirm(null);
    } else {
      setResetConfirm(tabIndex);
    }
  };

  const toggleExam = (id: string) => {
    setExpandedExam(prev => prev === id ? null : id);
  };

  const toggleQuizSection = (section: string) => {
    setExpandedQuizSections(prev => prev === section ? null : section);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Stats</Text>
        <Text style={{ width: 24 }} />
      </View>

      {/* Tab bar */}
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

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveTab(page);
          setResetConfirm(null);
        }}
      >

        {/* Flashcards tab */}
        <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
          <View style={styles.overallRow}>
            <View style={styles.overallBadge}>
              <Text style={[styles.overallNum, { color: SUCCESS }]}>{totalKnown}</Text>
              <Text style={styles.overallLabel}>Know It</Text>
            </View>
            <View style={styles.overallBadge}>
              <Text style={[styles.overallNum, { color: DANGER }]}>{totalLearning}</Text>
              <Text style={styles.overallLabel}>Still Learning</Text>
            </View>
            <View style={styles.overallBadge}>
              <Text style={[styles.overallNum, { color: MUTED }]}>{totalUnreviewed}</Text>
              <Text style={styles.overallLabel}>Unreviewed</Text>
            </View>
          </View>

          {flashcardSectionStats.map(({ category, known, learning, unreviewed }) => (
            <View key={category} style={styles.statRow}>
              <Text style={styles.statCategory}>{category}</Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarSegment, { flex: known, backgroundColor: SUCCESS}]} />
                <View style={[styles.statBarSegment, { flex: learning, backgroundColor: DANGER}]} />
                <View style={[styles.statBarSegment, { flex: unreviewed, backgroundColor: MUTED}]} />
              </View>
              <View style={styles.statCounts}>
                <Text style={[styles.statCount, { color: SUCCESS }]}>{known} known</Text>
                <Text style={[styles.statCount, { color: DANGER }]}>{learning} learning</Text>
                <Text style={[styles.statCount, { color: MUTED }]}>{unreviewed} left</Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.resetBtn} onPress={() => handleReset(0)}>
            <Text style={styles.resetText}>
              {resetConfirm === 0 ? "Tap again to confirm reset" : "Reset Flashcard Progress"}
            </Text>
          </Pressable>
        </ScrollView>

        {/* Quiz tab */}
        <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
          {Object.keys(quizBySection).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No quizzes taken yet</Text>
            </View>
          ) : (
            Object.entries(quizBySection).map(([section, attempts]) => {
              const isOpen = expandedQuizSections === section;
              return (
                <View key={section} style={styles.collapseCard}>
                  <Pressable style={styles.collapseHeader} onPress={() => toggleQuizSection(section)}>
                    <View style={styles.collapseHeaderLeft}>
                      <Text style={styles.collapseTitle}>{section}</Text>
                      <Text style={styles.collapseScore}>
                        {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={MUTED} />
                  </Pressable>
                  <CollapsibleBody isOpen={isOpen}>
                    <View style={styles.collapseBody}>
                      {attempts.map((attempt) => {
                        const pct = Math.round((attempt.score / attempt.total) * 100);
                        return (
                          <View key={attempt.id} style={styles.quizAttemptRow}>
                            <View style={{ gap: 2 }}>
                              <Text style={styles.quizAttemptDate}>{formatDate(attempt.timestamp)}</Text>
                              <Text style={styles.quizAttemptScore}>{attempt.score}/{attempt.total} - {pct}%</Text>
                            </View>
                            {attempt.questions?.length > 0 && (
                              <Pressable
                                onPress={() => router.push({ pathname: "/results", params: { type: "quiz", id: attempt.id } })}
                                style={styles.reviewBtn}
                              >
                                <Text style={styles.reviewBtnText}>Review</Text>
                              </Pressable>
                            )}
                          </View>
                        )
                      })}
                    </View>
                  </CollapsibleBody>
                </View>
              );
            })
          )}
          <Pressable style={styles.resetBtn} onPress={() => handleReset(1)}>
            <Text style={styles.resetText}>
              {resetConfirm === 1 ? "Tap again to confirm reset" : "Reset Quiz History"}
            </Text>
          </Pressable>
        </ScrollView>

        {/* Exam tab */}
        <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
          {examHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No exams taken yet</Text>
            </View>
          ) : (
            examHistory.map((exam) => {
              const isOpen = expandedExam === exam.id;
              const pct = Math.round((exam.score / exam.total) * 100);
              return (
                <View key={exam.id} style={styles.collapseCard}>
                  <Pressable style={styles.collapseHeader} onPress={() => toggleExam(exam.id)}>
                    <View style={styles.collapseHeaderLeft}>
                      <Text style={styles.collapseTitle}>{formatDate(exam.timestamp)}</Text>
                      <Text style={styles.collapseScore}>{exam.score}/{exam.total} - {pct}%</Text>
                    </View>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={MUTED} />
                  </Pressable>
                  <CollapsibleBody isOpen={isOpen}>
                    <View style={styles.collapseBody}>
                      {exam.breakdown.map(({ category, correct, total }) => (
                        <View key={category} style={styles.breakdownRow}>
                          <Text style={styles.breakdownCategory}>{category}</Text>
                          <Text style={styles.breakdownScore}>{correct}/{total}</Text>
                          <View style={styles.breakdownBarBg}>
                            <View style={[styles.breakdownBarFill, { width: `${Math.round((correct / total) * 100)}%` as any}]} />
                          </View>
                        </View>
                      ))}
                      {exam.questions?.length > 0 && (
                        <Pressable
                          onPress={() => router.push({ pathname: "/results", params: { type: "exam", id: exam.id } })}
                          style={styles.reviewBtn}
                        >
                          <Text style={styles.reviewBtnText}>Review Questions</Text>
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
              {resetConfirm === 2 ? "Tap again to confirm reset" : "Reset Exam History"}
            </Text>
          </Pressable>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  )
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
    borderBottomColor: "transparent"
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
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  overallNum: { fontSize: 22, fontWeight: "800" },
  overallLabel: { fontSize: 11, color: MUTED, fontWeight: "600", textAlign: "center" },

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
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
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
});