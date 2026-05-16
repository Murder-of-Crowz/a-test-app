import { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BRAND,
  ACCENT,
  BG,
  MUTED,
  SUBTLE,
  BORDER,
} from "@/src/theme/colors";
import { getQuizSubjects } from "@/src/data/questionData";
import { SHADOW_MD } from "@/src/theme/shadows";
import { useSettingsStore } from "@/src/settingsStore";

export default function QuizSelection() {
  const router = useRouter();
  const spanish = useSettingsStore((state) => state.spanish);

  const quizSubjects = useMemo(() => {
    return getQuizSubjects();
  }, [spanish]);

  type QuizSubject = (typeof quizSubjects)[number];

  const [selectedSubject, setSelectedSubject] = useState<QuizSubject | null>(
    null,
  );

  const handleStartQuiz = () => {
    if (!selectedSubject) return;

    router.push({
      pathname: "/quiz/[subjectId]",
      params: {
        subjectId: String(selectedSubject.index),
        title: selectedSubject.title,
        index: String(selectedSubject.index),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.headerTitle}>
          {spanish ? "Temas del Quiz" : "Quiz Subjects"}
        </Text>

        <View style={styles.headerSide} />
      </View>

      <View style={styles.screen}>
        <Text style={styles.subtitle}>
          {spanish
            ? "Elige un tema para comenzar tu quiz."
            : "Choose a subject to start your quiz."}
        </Text>

        <FlatList
          data={quizSubjects}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isSelected = selectedSubject?.index === item.index;

            return (
              <Pressable
                style={[styles.card, isSelected && styles.selectedCard]}
                onPress={() => setSelectedSubject(item)}
              >
                <Text
                  style={[styles.title, isSelected && styles.selectedTitle]}
                >
                  {item.title}
                </Text>
              </Pressable>
            );
          }}
        />

        <Pressable
          style={[
            styles.startButton,
            !selectedSubject && styles.disabledButton,
          ]}
          disabled={!selectedSubject}
          onPress={handleStartQuiz}
        >
          <Text style={styles.startButtonText}>
            {spanish ? "Comenzar Quiz" : "Start Quiz"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: BRAND,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerSide: {
    width: 40,
    alignItems: "flex-start",
  },

  headerTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },

  subtitle: {
    fontSize: 20,
    color: SUBTLE,
    marginBottom: 16,
  },

  listContainer: {
    gap: 14,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW_MD,
  },

  selectedCard: {
    borderColor: ACCENT,
    backgroundColor: "#eff6ff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  selectedTitle: {
    color: BRAND,
  },

  description: {
    fontSize: 14,
    color: SUBTLE,
    lineHeight: 20,
  },

  startButton: {
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  disabledButton: {
    backgroundColor: MUTED,
  },

  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});