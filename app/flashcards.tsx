import { forwardRef, useEffect, useMemo, useState, useRef, useImperativeHandle } from "react";
import { useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import data from "@/assets/questions.json";
// @ts-ignore
import { PremQuestion, getPremQuestions } from "@/src/premDB";

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";

type Card = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
};

type CardState = "known" | "learning";

type FlashCardRef = {
  animateForward: (cb: () => void) => void;
  animateBackward: (cb: () => void) => void;
};

const freeCards: Card[] = data.flatMap(section =>
  section.questions.map(q => ({ ...q, category: section.category }))
);
const freeCategories = data.map(s => s.category);

function shuffleDeck<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FlashCard = forwardRef<FlashCardRef, {
  card: Card;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}>(function FlashCard({ card, onNext, onPrev, canGoNext, canGoPrev }, ref) {
  const [flipped, setFlipped] = useState(false);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const toggleFlipped = () => setFlipped(f => !f);

  const runForward = (cb: () => void) => {
    'worklet';
    opacity.value = withTiming(0, { duration: 150 });
    translateX.value = withTiming(-500, { duration: 220 }, () => {
      'worklet';
      translateX.value = 0;
      runOnJS(cb)();
      opacity.value = withTiming(1, { duration: 200 });
    })
  };

  const runBackward = (cb: () => void) => {
    'worklet';
    opacity.value = withTiming(0, { duration: 150 });
    translateX.value = withTiming(500, { duration: 220 }, () => {
      'worklet';
      translateX.value = 0;
      runOnJS(cb)();
      opacity.value = withTiming(1, { duration: 200 });
    })
  };

  useImperativeHandle(ref, () => ({
    animateForward: runForward,
    animateBackward: runBackward,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const pan = Gesture.Pan()
  .activeOffsetX([-10, 10])
  .failOffsetY([-10, 10])
  .onUpdate((e) => { translateX.value = e.translationX; })
  .onEnd((e) => {
    if (e.translationX < -80 && canGoNext) runForward(onNext);
    else if (e.translationX > 80 && canGoPrev) runBackward(onPrev);
    else translateX.value = withSpring(0);
  });

  const tap = Gesture.Tap()
    .onEnd(() => {
      scale.value = withTiming(0.96, { duration: 80 }, () => {
        scale.value = withTiming(1, { duration: 80 });
        runOnJS(toggleFlipped)();
      });
    })

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text style={styles.cardHint}>{flipped ? "Answer" : "Question - tap to flip"}</Text>
        {flipped
          ? <Text style={styles.cardQuestion}>{card.answers[card.answerIndex]}</Text>
          : <Text style={styles.cardAnswer}>{card.question}   </Text>
        }
      </Animated.View>
    </GestureDetector>
  );
});

export default function FlashCardsScreen() {
  const router = useRouter();
  const flashCardRef = useRef<FlashCardRef>(null)
  const [index, setIndex] = useState(0);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(() => new Set(freeCategories));
  const [pendingSections, setPendingSections] = useState<Set<string>>(() => new Set(freeCategories));
  const [cardStates, setCardStates] = useState<Record<number, CardState>>({});
  const [reviewDeck, setReviewDeck] = useState<Card[] | null>(null);
  const [premCards, setPremCards] = useState<Card[]>([]);

  useEffect(() => {
    try { 
      const prem = getPremQuestions();
      setPremCards(prem);
      const premCats= [...new Set(prem.map((c: PremQuestion) => c.category))] as string[];
      setSelectedSections(prev => new Set<string>([...prev, ...premCats]));
      setPendingSections(prev => new Set<string>([...prev, ...premCats]));
    } catch {}
  }, []);

  const allCards = useMemo(() => {
    const combined = [...freeCards, ...premCards];
    const categoryOrder = [...new Set(combined.map(c => c.category))];
    return combined.sort((a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    );
  }, [premCards]);

  const categories = useMemo(() => [...new Set(allCards.map(c => c.category))], [allCards])
  const categoryCounts = useMemo(
    () => Object.fromEntries(categories.map(cat => [cat, allCards.filter(c => c.category === cat).length])),
    [allCards, categories]
  );

  const filteredCards = useMemo(
    () => allCards.filter(c => selectedSections.has(c.category)),
    [selectedSections]
  );

  const deck = useMemo(() => {
    if (reviewDeck !== null ) return shuffleOn ? shuffleDeck([...reviewDeck]) : reviewDeck;
    return shuffleOn ? shuffleDeck([...filteredCards]) : filteredCards;
  }, [reviewDeck, filteredCards, shuffleOn]);

  useEffect(() => { setIndex(0); }, [deck]);

  const current = deck[index];
  const total = deck.length;
  const reviewedCount = deck.filter(c => cardStates[c.id] !== undefined).length;

  const markCard = (id: number, state: CardState) => {
    const alreadyMarked = cardStates[id] !== undefined;
    setCardStates(prev => ({ ...prev, [id]: state }));
    if (!alreadyMarked && index < total - 1) flashCardRef.current?.animateForward(() => setIndex(i => i + 1));
  };

  const enterReviewMode = () => {
    const missed = allCards.filter(c =>
      selectedSections.has(c.category) && cardStates[c.id] === "learning"
    );
    setReviewDeck(missed);
    setIndex(0);
    setStatsVisible(false);
  };

  const exitReviewMode = () => {
    setReviewDeck(null);
    setIndex(0);
  };

  const sectionStats = useMemo(() => {
    return categories
      .filter(cat => selectedSections.has(cat))
      .map(cat => {
        const cards = allCards.filter(c => c.category === cat);
        const known = cards.filter(c => cardStates[c.id] === "known").length;
        const learning = cards.filter(c => cardStates[c.id] === "learning").length;
        return { category: cat, known, learning, unreviewed: cards.length - known - learning, total: cards.length };
      });
  }, [cardStates, selectedSections]);

  const togglePending = (category: string) => {
    setPendingSections(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const allSelected = pendingSections.size === categories.length;

  const applySelection = () => {
    setSelectedSections(new Set(pendingSections));
    setModalVisible(false);
  }

  const openModal = () => {
    setPendingSections(new Set(selectedSections));
    setModalVisible(true);
  }

  const uniqueSections = useMemo(() => [...new Set(deck.map(c => c.category))], [deck]);
  const currentSectionIndex = current ? uniqueSections.indexOf(current.category) : -1;
  const hasPrevSection = currentSectionIndex > 0;
  const hasNextSection = currentSectionIndex < uniqueSections.length -1;

  const handlePrev = () =>
    flashCardRef.current?.animateBackward(() => setIndex(i => i - 1));

  const handleNext = () =>
    flashCardRef.current?.animateForward(() => setIndex(i => i + 1));  

  const handleRestart = () =>
    flashCardRef.current?.animateBackward(() => setIndex(0));

  const goToPrevSection = () => {
    const first = deck.findIndex(c => c.category === uniqueSections[currentSectionIndex - 1]);
    if (first !== -1) flashCardRef.current?.animateBackward(() => setIndex(first));
  };

  const goToNextSection = () => {
    const first = deck.findIndex(c => c.category === uniqueSections[currentSectionIndex + 1]);
    if (first !== -1) flashCardRef.current?.animateForward(() => setIndex(first));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => setStatsVisible(true)} hitSlop={12}>
            <Ionicons name="bar-chart-outline" size={22} color="#93c5fd" />
          </Pressable>
          <Pressable onPress={openModal} hitSlop={12}>
            <Ionicons name="options-outline" size={22} color="#93c5fd" />
          </Pressable>
          <Text style={styles.headerCount}>{index + 1} / {total}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${(reviewedCount / total) * 100}%` as any }]} />
      </View>

      {/* Review Mode */}
      {reviewDeck !== null && (
        <View style={styles.reviewBanner}>
          <Ionicons name="refresh-circle-outline" size={16} color="#fff" />
          <Text style={styles.reviewBannerText}>
            Reviewing {reviewDeck.length} missed card{reviewDeck.length !== 1 ? "s" : ""}
          </Text>
          <Pressable onPress={exitReviewMode} hitSlop={12}>
            <Text style={styles.reviewBannerExit}>Exit</Text>
          </Pressable>
        </View>
      )}

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.shuffleBody}>
          <Text style={styles.chapterLabel}>{current.category}</Text>
          <View style={styles.shuffleRow}>
            <Text style={styles.shuffleLabel}>Shuffle</Text>
            <Switch
              value={shuffleOn}
              onValueChange={setShuffleOn}
              trackColor={{ false: "#cbd5e1", true: ACCENT }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {current && (
          <FlashCard
            ref={flashCardRef}
            key={index}
            card={current}
            onNext={() => setIndex(i => i + 1)}
            onPrev={() => setIndex(i => i - 1)}
            canGoNext={index < total - 1}
            canGoPrev={index > 0} 
          />
        )}

        {/* Rating buttons */}
        {current && (
          <View style={styles.ratingRow}>
            <Pressable
              style={[styles.ratingBtn, styles.ratingLearning, cardStates[current.id] === "learning" && styles.ratingLearningActive]}
              onPress={() => markCard(current.id, "learning")}
            >
              <Ionicons name="close" size={18} color={cardStates[current.id] === "learning" ? "#fff" : "#dc2626"} />
              <Text style={[styles.ratingText, cardStates[current.id] === "learning" && styles.ratingTextActive]}>
                Still Learning
              </Text>
            </Pressable>

            <Pressable
              style={[styles.ratingBtn, styles.ratingKnown, cardStates[current.id] === "known" && styles.ratingKnownActive]}
              onPress={() => markCard(current.id, "known")}
            >
              <Ionicons name="checkmark" size={18} color={cardStates[current.id] === "known" ? "#fff" : "#16a34a"} />
              <Text style={[styles.ratingText, cardStates[current.id] === "known" && styles.ratingTextActive]}>
                Know it
              </Text>
            </Pressable>
          </View>  
        )}

        {/* Nav */}
        <View style={styles.nav}>
          <Pressable
            style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={index === 0}
          >
            <Ionicons name="chevron-back" size={22} color={index === 0 ? "#cbd5e1" : BRAND} />
            <Text style={[styles.navText, index === 0 && styles.navTextDisabled]}>Prev</Text>
          </Pressable>

          <Pressable style={styles.navBtn} onPress={handleRestart}>
            <Ionicons name="refresh-outline" size={20} color={BRAND} />
          </Pressable>

          <Pressable
            style={[styles.navBtn, index === total - 1 && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={index === total - 1}
          >
            <Text style={[styles.navText, index === total - 1 && styles.navTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={22} color={index === total - 1 ? "#cbd5e1" : BRAND} />
          </Pressable>
        </View>

        {/* Section Nav */}
        <View style={styles.sectionNav}>
            <Pressable
              style={[styles.sectionNavBtn, !hasPrevSection && styles.navBtnDisabled]}
              onPress={goToPrevSection}
              disabled={!hasPrevSection}
            >
              <Ionicons name="chevron-back" size={16} color={!hasPrevSection ? "#cbd5e1" : "#94a3b8"} />
              <Text style={[styles.sectionNavText, !hasPrevSection && styles.navTextDisabled]}>Prev Section</Text>
            </Pressable>

            <Pressable
              style={[styles.sectionNavBtn, !hasNextSection && styles.navBtnDisabled]}
              onPress={goToNextSection}
              disabled={!hasNextSection}
            >
              <Text style={[styles.sectionNavText, !hasNextSection && styles.navTextDisabled]}>Next Section</Text>
              <Ionicons name="chevron-forward" size={16} color={!hasNextSection ? "#cbd5e1" : "#94a3b8"} />
            </Pressable>
          </View>
      </View>

      {/* Section selector modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Sections</Text>
            <Text style={styles.modalSub}>{pendingSections.size} of {categories.length} selected</Text>

            <Pressable onPress={() => setPendingSections(allSelected ? new Set() : new Set(categories))}>
              <Text style={styles.selectAllText}>{allSelected ? "Deselect All" : "Select All"}</Text>
            </Pressable>

            <ScrollView style={styles.modalList}>
              {categories.map(cat => {
                const checked = pendingSections.has(cat);
                return (
                  <Pressable key={cat} style={styles.checkRow} onPress={() => togglePending(cat)}>
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkLabel}>{cat}</Text>
                    <Text style={styles.checkCount}>{categoryCounts[cat]}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <Pressable style={[styles.applyBtn, pendingSections.size === 0 && styles.applyBtnDisabled]}
              onPress={applySelection}
              disabled={pendingSections.size === 0}
            >
              <Text style={styles.applyText}>Start Studying</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Stats modal */}
      <Modal visible={statsVisible} transparent animationType="slide" onRequestClose={() => setStatsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.modalTitle}>Progress</Text>
              <Pressable onPress={() => setStatsVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="#64748b" />
              </Pressable>
            </View>

            {/* Overall summary */}
            <View style={styles.overallRow}>
              <View style={styles.overallBadge}>
                <Text style={styles.overallNum}>
                  {Object.values(cardStates).filter(s => s === "known").length}
                </Text>
                <Text style={styles.overallLabel}>Know It</Text>
              </View>
              <View style={styles.overallBadge}>
                <Text style={[styles.overallNum, { color: "#dc2626" }]}>
                  {Object.values(cardStates).filter(s => s === "learning").length}
                </Text>
                <Text style={styles.overallLabel}>Still Learning</Text>
              </View>
              <View style={styles.overallBadge}>
                <Text style={[styles.overallNum, { color: "#94a3b8" }]}>
                  {deck.filter(c => cardStates[c.id] === undefined).length}
                </Text>
                <Text style={styles.overallLabel}>Unreviewed</Text>
              </View>
            </View>

            {/* Per-section breakdown */}
            <ScrollView style={styles.statsList}>
              {sectionStats.map(({ category, known, learning, unreviewed, total: sTotal }) => (
                <View key={category} style={styles.statRow}>
                  <Text style={styles.statCategory}>{category}</Text>
                  <View style={styles.statBarBg}>
                    <View style={[styles.statBarSegment, { flex: known, backgroundColor: "#16a34a" }]} />
                    <View style={[styles.statBarSegment, { flex: learning, backgroundColor: "#dc2626" }]} />
                    <View style={[styles.statBarSegment, { flex: unreviewed, backgroundColor: "#e2e8f0" }]} />
                  </View>
                  <View style={styles.statCounts}>
                    <Text style={[styles.statCount, { color: "#16a34a" }]}>{known} known</Text>
                    <Text style={[styles.statCount, { color: "#dc2626" }]}>{learning} learning</Text>
                    <Text style={[styles.statCount, { color: "#94a3b8" }]}>{unreviewed} left</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {Object.values(cardStates).some(s => s === "learning") && (
              <Pressable style={styles.applyBtn} onPress={enterReviewMode}>
                <Text style={styles.applyText}>
                  Review Missed Cards ({Object.values(cardStates).filter(s => s === "learning").length})
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.applyBtn}
              onPress={() => { setCardStates({}); setStatsVisible(false); }}
            >
              <Text style={styles.applyText}>Reset Progress</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },

  header: {
    backgroundColor: BRAND,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCount: { color: "#93c5fd", fontSize: 14 },

  progressBg:   { height: 3, backgroundColor: "#e2e8f0" },
  progressFill: { height: 3, backgroundColor: ACCENT },

  reviewBanner: {
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  reviewBannerText: { flex: 1, color: "#fff", fontSize: 13, fontWeight: "600" },
  reviewBannerExit: { color: "#fff", fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },

  body:         { flex: 1, padding: 20, gap: 12 },
  chapterLabel: { color: "#64748b", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  shuffleBody:  { flexDirection: "row", justifyContent: "space-between"},
  shuffleRow:   { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  shuffleLabel: { color: "#64748b", fontSize: 13, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    minHeight: 280,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    gap: 16,
  },
  cardHint:        { color: "#94a3b8", fontSize: 12, textAlign: "center" },
  cardQuestion:    { color: "#1e293b", fontSize: 20, fontWeight: "700", textAlign: "center", lineHeight: 30 },
  cardAnswer:      { color: ACCENT,   fontSize: 20, fontWeight: "700", textAlign: "center" },

  ratingBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  ratingRow:            { flexDirection: "row", gap: 10 },
  ratingLearning:       { borderColor: "#dc2626", backgroundColor: "#fff" },
  ratingLearningActive: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  ratingKnown:          { borderColor: "#16a34a", backgroundColor: "#fff" },
  ratingKnownActive:    { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  ratingText:           { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  ratingTextActive:     { color: "#fff" },

  nav:            { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  navBtn:         { flexDirection: "row", alignItems: "center", gap: 4, padding: 10 },
  navBtnDisabled: { opacity: 0.4 },
  navText:        { color: BRAND, fontWeight: "600", fontSize: 15 },
  navTextDisabled:{ color: "#cbd5e1" },

  sectionNav:     { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  sectionNavBtn:  { flexDirection: "row", alignItems: "center", gap: 4, padding: 8 },
  sectionNavText: { color: "#94a3b8", fontWeight: "600", fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    gap: 12,
  },
  modalTitle:    { color: "#1e293b", fontSize: 20, fontWeight: "800" },
  modalSub:      { color: "#94a3b8", fontSize: 13 },

  selectAllText: { color: ACCENT, fontWeight: "600", fontSize: 14 },
  modalList:     { maxHeight: 320 },
  checkRow: { 
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 14
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked:  { backgroundColor: ACCENT, borderColor: ACCENT },
  checkLabel:       { color: "#1e293b", fontSize: 15, flex: 1 },
  checkCount:       { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  applyBtn:         { backgroundColor: BRAND, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 4 },
  applyBtnDisabled: { backgroundColor: "#cbd5e1" },
  applyText:        { color: "#fff", fontWeight: "700", fontSize: 16 },

  statsHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  overallRow:   { flexDirection: "row", gap: 8 },
  overallBadge: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  overallNum:  { fontSize: 22, fontWeight: "800", color: "#16a34a" },
  overallLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", textAlign: "center" },

  statsList:    { maxHeight: 300 },
  statRow:      { paddingVertical: 12, gap: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  statCategory: { color: "#1e293b", fontSize: 13, fontWeight: "700" },
  statBarBg:    { flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "#e2e8f0" },
  statBarSegment: { height: 6 },
  statCounts:   { flexDirection: "row", gap: 12 },
  statCount:    { fontSize: 11, fontWeight: "600" },
});