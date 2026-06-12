import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getQuestionData } from "@/src/data/questionData";
import { useSubscription } from "@/src/hooks/useSubscription";
import { useSettingsStore } from "@/src/settingsStore";
import { useStatsStore } from "@/src/statsStore";
import {
  ACCENT,
  BG,
  BORDER,
  BRAND,
  DANGER,
  SUCCESS,
  SUBTLE,
  TEXT,
  WARNING,
} from "@/src/theme/colors";
import { SHADOW_SM } from "@/src/theme/shadows";

type ActionRoute =
  | "/flashcards"
  | "/quizSelection"
  | "/exam"
  | "/mockExam"
  | "/stats";

type DashboardAction = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: ActionRoute;
  color: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const spanish = useSettingsStore((state) => state.spanish);
  const { hasEsthiPro } = useSubscription();
  const questionData = getQuestionData(spanish, hasEsthiPro);

  const savedExam = useStatsStore((s) => s.savedExam);
  const clearSavedExam = useStatsStore((s) => s.clearSavedExam);
  const flashcardRatings = useStatsStore((s) => s.flashcardRatings);
  const examHistory = useStatsStore((s) => s.examHistory);
  const quizHistory = useStatsStore((s) => s.quizHistory);
  const [resumeVisible, setResumeVisible] = useState(false);

  const questionKeys = useMemo(() => {
    const source = hasEsthiPro ? "prem" : "free";

    return new Set(
      questionData.flatMap((section) =>
        section.questions.map((question) => `${source}_${question.id}`),
      ),
    );
  }, [hasEsthiPro, questionData]);

  const reviewedCards = useMemo(() => {
    return Object.keys(flashcardRatings).filter((key) => questionKeys.has(key))
      .length;
  }, [flashcardRatings, questionKeys]);

  const totalCards = questionKeys.size;
  const readiness =
    totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

  const actions: DashboardAction[] = [
    {
      icon: "albums-outline",
      title: spanish ? "Tarjetas" : "Flashcards",
      subtitle: spanish ? "Repasa y marca progreso" : "Review and rate cards",
      route: "/flashcards",
      color: ACCENT,
    },
    {
      icon: "list-circle-outline",
      title: "Quiz",
      subtitle: spanish ? "Practica por tema" : "Practice by topic",
      route: "/quizSelection",
      color: SUCCESS,
    },
    {
      icon: "reader-outline",
      title: spanish ? "Examen" : "Practice Exam",
      subtitle: spanish ? "25 preguntas ponderadas" : "25 weighted questions",
      route: "/exam",
      color: WARNING,
    },
    {
      icon: "timer-outline",
      title: "Mock Exam",
      subtitle: spanish ? "100 preguntas cronometradas" : "100 timed questions",
      route: "/mockExam",
      color: DANGER,
    },
    {
      icon: "bar-chart-outline",
      title: spanish ? "Progreso" : "Stats",
      subtitle: spanish ? "Mira tu avance" : "Track your progress",
      route: "/stats",
      color: BRAND,
    },
  ];

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
          <Text style={styles.appName}>Esthi</Text>
          <Text style={styles.greeting}>
            {spanish ? "Hola!" : "Welcome back"}
          </Text>
          <Text style={styles.sub}>
            {spanish
              ? "Elige tu proxima sesion de estudio."
              : "Choose your next study session."}
          </Text>
        </View>

        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push("/settings")}
          hitSlop={12}
        >
          <Ionicons name="settings-outline" size={24} color="#bfdbfe" />
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <View style={styles.progressPanel}>
          <View style={styles.panelCopy}>
            <Text style={styles.panelEyebrow}>{spanish ? "Hoy" : "Today"}</Text>
            <Text style={styles.panelTitle}>
              {readiness}% {spanish ? "listo" : "ready"}
            </Text>
            <Text style={styles.panelSub}>
              {reviewedCards} / {totalCards}{" "}
              {spanish ? "tarjetas revisadas" : "cards reviewed"}
            </Text>
          </View>

          <View style={styles.progressRing}>
            <Text style={styles.progressRingText}>{readiness}%</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricChip}>
            <Ionicons name="albums-outline" size={16} color={ACCENT} />
            <Text style={styles.metricText}>
              {reviewedCards} {spanish ? "revisadas" : "reviewed"}
            </Text>
          </View>
          <View style={styles.metricChip}>
            <Ionicons name="checkmark-circle-outline" size={16} color={SUCCESS} />
            <Text style={styles.metricText}>{quizHistory.length} quizzes</Text>
          </View>
          <View style={styles.metricChip}>
            <Ionicons name="reader-outline" size={16} color={WARNING} />
            <Text style={styles.metricText}>
              {examHistory.length} {spanish ? "examenes" : "exams"}
            </Text>
          </View>
        </View>

        <View style={styles.actionList}>
          {actions.map((action) => (
            <Pressable
              key={action.route}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(action.route)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${action.color}18` },
                ]}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>

              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSub}>{action.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={resumeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={32} color={WARNING} />

            <Text style={styles.modalTitle}>
              {spanish ? "Examen interrumpido" : "Exam Interrupted"}
            </Text>

            <Text style={styles.modalSub}>
              {spanish
                ? "Tienes un examen sin terminar. Quieres continuar donde lo dejaste?"
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
    paddingTop: 22,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appName: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  greeting: { color: "#fff", fontSize: 27, fontWeight: "800", marginTop: 2 },
  sub: { color: "#bfdbfe", fontSize: 14, marginTop: 5 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  body: { flex: 1, backgroundColor: BG },
  content: { padding: 20, gap: 14, paddingBottom: 32 },
  pressed: { opacity: 0.85 },

  progressPanel: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOW_SM,
  },
  panelCopy: { flex: 1, paddingRight: 14 },
  panelEyebrow: {
    color: SUBTLE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  panelTitle: { color: TEXT, fontSize: 26, fontWeight: "800", marginTop: 4 },
  panelSub: { color: SUBTLE, fontSize: 13, marginTop: 2 },
  progressRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 7,
    borderColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
  },
  progressRingText: { color: BRAND, fontSize: 15, fontWeight: "800" },

  metricRow: { flexDirection: "row", gap: 8 },
  metricChip: {
    flex: 1,
    minHeight: 62,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    ...SHADOW_SM,
  },
  metricText: {
    color: SUBTLE,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  actionList: { gap: 10 },
  actionRow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...SHADOW_SM,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: { flex: 1, gap: 2 },
  actionTitle: { color: TEXT, fontSize: 16, fontWeight: "800" },
  actionSub: { color: SUBTLE, fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
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
