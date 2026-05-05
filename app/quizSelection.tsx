import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getQuizSubjects } from "./questionData";

const quizSubjects = getQuizSubjects();

type QuizSubject = (typeof quizSubjects)[number];

export default function QuizSelection() {
  const router = useRouter();

  const [selectedSubject, setSelectedSubject] = useState<QuizSubject | null>(
    null,
  );

  const handleStartQuiz = () => {
    if (!selectedSubject) {
      return;
    }

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
            <Ionicons name='arrow-back' size={24} color='#fff' />
          </Pressable>
        </View>

        <Text style={styles.headerTitle}>Quiz Subjects</Text>

        <View style={styles.headerSide} />
      </View>

      <View style={styles.screen}>
        <Text style={styles.subtitle}>
          Choose a subject to start your quiz.
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
                onPress={() => setSelectedSubject(item)}>
                <Text
                  style={[styles.title, isSelected && styles.selectedTitle]}>
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
          onPress={handleStartQuiz}>
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    backgroundColor: "#1e3a5f",
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
    color: "#64748b",
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
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  selectedCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  selectedTitle: {
    color: "#1e3a5f",
  },

  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },

  startButton: {
    backgroundColor: "#1e3a5f",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  disabledButton: {
    backgroundColor: "#94a3b8",
  },

  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
