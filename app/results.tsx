import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStatsStore } from "@/src/statsStore";
import data from "@/assets/questions.json";
// @ts-ignore
import { getPremQuestions } from "@/src/premDB";

const BRAND = "#1e3a5f";

type FullQuestion = {
  id: number;
  question: string;
  answers: string[]
  answerIndex: number;
  category: string;
  source: "free" | "prem";
  correct: boolean;
  selectedAnswer: string;
};

function QuestionCard({ question, index }: { question: FullQuestion; index: number }) {
  const selectedIdx = question.answers.indexOf(question.selectedAnswer);
  return (
    <View style={[styles.card, !question.correct && styles.cardMissed]}>
      <Text style={styles.cardCategory}>{question.category}</Text>
      <Text style={styles.cardQuestion}>{index}. {question.question}</Text>
      {question.answers.map((ans, ai) => {
        const isCorrect = ai === question.answerIndex;
        const isSelected = ai === selectedIdx;
        return (
          <View key={ai} style={[styles.answer, isCorrect && styles.answerCorrect, isSelected && !isCorrect && styles.answerWrong]}>
            {isCorrect
            ? <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            : isSelected
              ? <Ionicons name="close-circle" size={16} color="#dc2626" />
              : <View style={styles.answerDot} />
          }
            <Text style={[styles.answerText, isCorrect && styles.answerTextCorrect, isSelected && !isCorrect && styles.answerTextWrong]}>
              {ans}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const { type, id } = useLocalSearchParams<{ type: "quiz" | "exam"; id: string }>();
  const [premQuestions, setPremQuestions] = useState<any[]>([]);

  const quizHistory = useStatsStore((s) => s.quizHistory);
  const examHistory = useStatsStore((s) => s.examHistory);

  useEffect(() => {
    try { setPremQuestions(getPremQuestions()); } catch {}
  }, []);

  const result = useMemo(() => {
    if (type === "quiz") return quizHistory.find(q => q.id === id);
    return examHistory.find(e => e.id === id);
  }, [type, id, quizHistory, examHistory]);

  const questionLookup = useMemo(() => {
    const lookup: Record<string, { question: string; answers: string[], answerIndex: number; category: string }> = {};
    data.forEach(section => {
      section.questions.forEach(q => {
        lookup[`free_${q.id}`] = { ...q, category: section.category };
      });
    });
    premQuestions.forEach(q => {
      lookup[`prem_${q.id}`] = { ...q };
    });
    return lookup;
  }, [premQuestions]);

  const questions = useMemo((): FullQuestion[] => {
    if (!result?.questions) return [];
    return result.questions
      .map(qr => {
        const full = questionLookup[`${qr.source}_${qr.questionId}`];
        if (!full) return null;
        return { ...full, id: qr.questionId, source: qr.source, correct: qr.correct, selectedAnswer: qr.selectedAnswer };
      })
      .filter(Boolean) as FullQuestion[];
  }, [result, questionLookup]);

  const missed = questions.filter(q => !q.correct);
  const correct = questions.filter(q => q.correct);
  const title = type === "quiz" ? "Quiz Review" : "Exam Review";

  if(!result) { 
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Result not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerScore}>{result.score} / {result.total}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {missed.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <Ionicons name="close-circle" size={16} color="#dc2626" />
              <Text style={[styles.sectionLabelText, { color: "#dc2626" }]}>
                Missed ({missed.length})
              </Text>
            </View>
            {missed.map((q, i) => (
              <QuestionCard key={`missed-${q.source}-${q.id}-${i}`} question={q} index={i + 1} />
            ))}
          </>
        )}

        {correct.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={[styles.sectionLabelText, { color: "#16a34a" }]}>
                Correct ({correct.length})
              </Text>
            </View>
            {correct.map((q, i) => (
              <QuestionCard key={`correct-${q.source}-${q.id}-${i}`} question={q} index={missed.length + i + 1} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
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
  headerScore: { color: "#93c5fd", fontSize: 14, fontWeight: "600" },

  scroll: { padding: 20, gap: 12, paddingBottom: 40 },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  sectionLabelText: { fontSize: 14, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  cardMissed: { borderLeftColor: "#dc2626" },
  cardCategory: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardQuestion: { color: "#1e293b", fontSize: 14, fontWeight: "600", lineHeight: 20 },

  answer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  answerCorrect: { backgroundColor: "#f0fdf4" },
  answerWrong: { backgroundColor: "#fef2f2" },
  answerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#cdb5e1",
  },
  answerText: { flex: 1, color: "#374151", fontSize: 13 },
  answerTextCorrect: { color: "#16a34a", fontWeight: "600" },
  answerTextWrong: { color: "#dc2626", fontWeight: "600" },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});