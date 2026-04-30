import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Pressable,
  StyleSheet,
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
  answer: string;
  choices: string[];
  answerIndex: number;
  topic: string;
};

const allCards = data.flatMap(section => section.questions.map(q => ({ ...q, topic: section.topic })));

function FlashCard({ card }: { card: Card }) {
  const [flipped, setFlipped] = useState(false);
  const anim = useRef(new Animated.Value(1)).current;

  const handleFlip = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => setFlipped(f => !f));
  };

  return (
    <Pressable onPress={handleFlip}>
      <Animated.View style={[styles.card, { transform: [{ scale: anim }] }]}>
        <Text style={styles.cardHint}>{flipped ? "Answer" : "Question — tap to flip"}</Text>

        {flipped
          ? <Text style={styles.cardQuestion}>{card.answers[card.answerIndex]}</Text>
          :  <Text style={styles.cardAnswer}>{card.question}</Text>
        }
      </Animated.View>
    </Pressable>
  );
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const current = allCards[index];
  const total = allCards.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.headerCount}>{index + 1} / {total}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.chapterLabel}>{current.topic}</Text>
        <FlashCard key={index} card={current} />

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
  headerCount: { color: "#93c5fd", fontSize: 14 },

  body:         { flex: 1, padding: 20, gap: 12 },
  chapterLabel: { color: "#64748b", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

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
});
