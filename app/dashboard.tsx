import { useRouter } from "expo-router";
import {
  Pressable,
  Settings,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";

const USER_NAME = "Joe";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle='light-content' backgroundColor={BRAND} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {USER_NAME}!</Text>
          <Text style={styles.sub}>What would you like to do today?</Text>
        </View>
        <Pressable onPress={() => router.push("/settings")} hitSlop={12}>
          <Ionicons name='settings-outline' size={26} color='#93c5fd' />
        </Pressable>
      </View>

      {/* Buttons */}
      <View style={styles.body}>
        {/* Flashcards */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/flashcards")} // Need this changed once flashcard page done
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>Flashcards</Text>
          <Text style={styles.cardSub}>Start your studying!</Text>
        </Pressable>

        {/* Practice Quiz */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/quizSelection")} // Need this changed once quiz page done
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>Quiz</Text>
          <Text style={styles.cardSub}>You ready to take a practice quiz?</Text>
        </Pressable>

        {/* Practice Exam */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardBlue,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/exam")} // Need this changed once exam page done
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>Exam</Text>
          <Text style={styles.cardSub}>You ready to take a practice exam?</Text>
        </Pressable>

        {/* Stats */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            styles.cardDark,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/stats")} // Need this changed once exam page done
        >
          <Text style={styles.cardIcon}>~</Text>
          <Text style={styles.cardTitle}>Stats</Text>
          <Text style={styles.cardSub}>See how far you&apos;ve gone</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },

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

  body: { flex: 1, padding: 20, gap: 16 },

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
  cardSub: { color: "rgba(255,255,255,0.7", fontSize: 14, marginTop: 4 },
});
