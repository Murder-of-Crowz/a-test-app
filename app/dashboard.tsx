import { useFocusEffect, useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useStatsStore } from "@/src/statsStore";
import { useSettingsStore } from "@/src/settingsStore";
import { BRAND, ACCENT, BG, TEXT, SUBTLE, BORDER } from "@/src/theme/colors";

export default function DashboardScreen() {
  const router = useRouter();
  const spanish = useSettingsStore((state) => state.spanish);

  const savedExam = useStatsStore((s) => s.savedExam);
  const clearSavedExam = useStatsStore((s) => s.clearSavedExam);
  const [resumeVisible, setResumeVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (savedExam) setResumeVisible(true);
    }, [savedExam]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {spanish ? "Hola!" : "Welcome back"}
          </Text>

          <Text style={styles.sub}>
            {spanish
              ? "¿Qué te gustaría hacer hoy?"
              : "What would you like to do today?"}
          </Text>
        </View>

        <Pressable onPress={() => router.push("/settings")} hitSlop={12}>
          <Ionicons name="settings-outline" size={26} color="#93c5fd" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/flashcards")}
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>
            {spanish ? "Tarjetas" : "Flashcards"}
          </Text>
          <Text style={styles.cardSub}>
            {spanish ? "¡Comienza a estudiar!" : "Start your studying!"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/quizSelection")}
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>{spanish ? "Quiz" : "Quiz"}</Text>
          <Text style={styles.cardSub}>
            {spanish
              ? "¿Lista para tomar un quiz de práctica?"
              : "You ready to take a practice quiz?"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/exam")}
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>{spanish ? "Examen" : "Exam"}</Text>
          <Text style={styles.cardSub}>
            {spanish
              ? "¿Lista para tomar un examen de práctica?"
              : "You ready to take a practice exam?"}
          </Text>
        </Pressable>

        {/* Mock Exam */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/mockExam")}
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>Mock Exam</Text>
          <Text style={styles.cardSub}>Simulate the real board exam</Text>
        </Pressable>

        {/* Stats */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardDark,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/stats")}
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>
            {spanish ? "Progreso" : "Stats"}
          </Text>
          <Text style={styles.cardSub}>
            {spanish
              ? "Mira cuánto has avanzado"
              : "See how far you've gone"}
          </Text>
        </Pressable>
      </View>

      <Modal visible={resumeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={32} color="#f58e0b" />

            <Text style={styles.modalTitle}>
              {spanish ? "Examen interrumpido" : "Exam Interrupted"}
            </Text>

            <Text style={styles.modalSub}>
              {spanish
                ? "Tienes un examen sin terminar. ¿Te gustaría continuar donde lo dejaste?"
                : "You have an unfinished exam. Would you like to continue where you left off?"}
            </Text>

            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  setResumeVisible(false);
                  router.push("/exam");
                }}
              >
                <Text style={styles.modalBtnTextPrimary}>
                  {spanish ? "Continuar examen" : "Continue Exam"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setResumeVisible(false);
                  clearSavedExam();
                }}
              >
                <Text style={styles.modalBtnTextSecondary}>
                  {spanish ? "Abandonar" : "Abandon"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BRAND },

  header: {
    backgroundColor: BRAND,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "#fff", fontSize: 26, fontWeight: "800" },
  sub: { color: "#93c5fd", fontSize: 14, marginTop: 4 },

  body: { flex: 1, padding: 20, gap: 16, backgroundColor: BG },

  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "flex-end",
  },

  cardBlue: { backgroundColor: ACCENT },
  cardDark: { backgroundColor: BRAND },
  pressed: { opacity: 0.85 },

  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  cardSub: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: TEXT },
  modalSub: { fontSize: 14, color: SUBTLE, textAlign: "center", lineHeight: 20 },
  modalBtns: { width: "100%", gap: 10, marginTop: 8 },
  modalBtn: { borderRadius: 14, padding: 16, alignItems: "center" },
  modalBtnPrimary: { backgroundColor: BRAND },
  modalBtnSecondary: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  modalBtnTextPrimary: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalBtnTextSecondary: { color: SUBTLE, fontWeight: "600", fontSize: 15 },
});
