import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import data from "@/assets/questions.json";

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";

type Card = {
  id: number;
  question: string;
  answers: string[];
  answerIndex: number;
  category: string;
};

const allCards: Card[] = data.flatMap(section => section.questions.map(q => ({ ...q, category: section.category })));
const categories = data.map(s => s.category);

function shuffledeck<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FlashCard({ card }: { card: Card }) {
  const [flipped, setFlipped] = useState(false)
  const anim = useRef(new Animated.Value(1)).current

  const handleFlip = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => setFlipped(f => !f));
  };

  return (
    <Pressable onPress={handleFlip}>
      <Animated.View style={[styles.card, { transform: [{ scale: anim }]}]}>
        <Text style={styles.cardHint}>{flipped ? "Answer" : "Question - tap to flip"}</Text>
        {flipped
          ? <Text style={styles.cardQuestion}>{card.answers[card.answerIndex]}</Text>
          : <Text style={styles.cardAnswer}>{card.question}</Text>
        }
      </Animated.View>
    </Pressable>
  )
}

export default function FlashCardsScreen({ card }: { card: Card }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(() => new Set(categories));
  const [pendingSections, setPendingSections] = useState<Set<string>>(() => new Set(categories));

  const filteredCards = useMemo(
    () => allCards.filter(c => selectedSections.has(c.category)),
    [selectedSections]
  );

  const deck = useMemo(
    () => shuffleOn ? shuffledeck([...filteredCards]) : filteredCards,
    [filteredCards, shuffleOn]
  );

  useEffect(() => { setIndex(0); }, [deck]);

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

  const current = deck[index];
  const total = deck.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={openModal} hitSlop={12}>
            <Ionicons name="options-outline" size={22} color="#93c5fd" />
          </Pressable>
          <Text style={styles.headerCount}>{index + 1} / {total}</Text>
        </View>

      </View>

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

        

        {current && <FlashCard key={index} card={current} />}

        <View style={styles.nav}>
          <Pressable
            style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
            onPress={() => setIndex(i => i - 1)}
            disabled={index === 0}
          >
            <Ionicons name="chevron-back" size={22} color={index === 0 ? "#cbd5e1" : BRAND} />
            <Text style={[styles.navText, index === 0 && styles.navTextDisabled]}>Prev</Text>
          </Pressable>

          <Pressable
            style={[styles.navBtn, index === total - 1 && styles.navBtnDisabled]}
            onPress={() => setIndex(i => i + 1)}
            disabled={index === total - 1}
          >
            <Text style={[styles.navText, index === total - 1 && styles.navTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={22} color={index === total - 1 ? "#cbd5e1" : BRAND} />
          </Pressable>
        </View>
      </View>

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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: "#f1f5f9" },

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

  body:         { flex: 1, padding: 20, gap: 12 },
  chapterLabel: { color: "#64748b", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  shuffleBody: { flexDirection: "row", justifyContent: "space-between"},
  shuffleRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
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
  cardExplanation: { color: "#64748b", fontSize: 14, textAlign: "center", lineHeight: 22 },

  nav:            { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  navBtn:         { flexDirection: "row", alignItems: "center", gap: 4, padding: 10 },
  navBtnDisabled: { opacity: 0.4 },
  navText:        { color: BRAND, fontWeight: "600", fontSize: 15 },
  navTextDisabled:{ color: "#cbd5e1" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    gap: 12,
  },
  modalTitle: { color: "#1e293b", fontSize: 20, fontWeight: "800" },
  modalSub: { color: "#94a3b8", fontSize: 13 },
  selectAllText: { color: ACCENT, fontWeight: "600", fontSize: 14 },
  modalList: { maxHeight: 320 },
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
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkLabel: { color: "#1e293b", fontSize: 15, flex: 1 },
  applyBtn: { backgroundColor: BRAND, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 4 },
  applyBtnDisabled: { backgroundColor: "#cbd5e1" },
  applyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
