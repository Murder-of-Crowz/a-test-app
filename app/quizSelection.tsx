import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
type QuizSubject = {
  id: string;
  title: string;
  description: string;
};

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";

const quizSubjects: QuizSubject[] = [
  {
    id: "safety-infection-control",
    title: "Safety and Infection Control",
    description:
      "Sanitation, disinfection, sterilization, and safety procedures.",
  },
  {
    id: "skin-care",
    title: "Skin Care",
    description: "Skin analysis, facials, products, and equipment.",
  },
  {
    id: "skin-analysis",
    title: "Skin Analysis",
    description: "Identifying skin types and conditions.",
  },
  {
    id: "hair-removal",
    title: "Hair Removal",
    description: "Waxing and tweezers techniques.",
  },
  {
    id: "advanced-treatments",
    title: "Advanced Treatments",
    description: "Microdermabrasion and chemical peels.",
  },
  {
    id: "makeup",
    title: "Makeup",
    description: "Application techniques.",
  },
  {
    id: "client-consultation",
    title: "Client Consultation",
    description: "Consultation and documentation.",
  },
];

export default function Quiz() {
  const router = useRouter();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );

  const selectedSubject = quizSubjects.find(
    (subject) => subject.id === selectedSubjectId,
  );

  const handleStartQuiz = () => {
    if (!selectedSubjectId || !selectedSubject) {
      return;
    }

    router.push({
      pathname: "/quiz/[subjectId]",
      params: {
        subjectId: selectedSubjectId,
        title: selectedSubject.title,
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
        <View style={styles.screen}>
          <Text style={styles.subtitle}>
            Choose a subject to start your quiz.
          </Text>

          <FlatList
            data={quizSubjects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const isSelected = selectedSubjectId === item.id;

              return (
                <Pressable
                  style={[styles.card, isSelected && styles.selectedCard]}
                  onPress={() => setSelectedSubjectId(item.id)}>
                  <View style={styles.cardHeader}>
                    <Text
                      style={[
                        styles.title,
                        isSelected && styles.selectedTitle,
                      ]}>
                      {item.title}
                    </Text>
                  </View>

                  <Text style={styles.description}>{item.description}</Text>
                </Pressable>
              );
            }}
          />

          <Pressable
            style={[
              styles.startButton,
              !selectedSubjectId && styles.disabledButton,
            ]}
            disabled={!selectedSubjectId}
            onPress={handleStartQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },

  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 20,
    color: "#64748b",
    marginBottom: 16,
  },

  selectionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: 12,
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

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
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
});
