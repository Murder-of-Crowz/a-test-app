import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BRAND, ACCENT, SUBTLE } from "@/src/theme/colors";

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY       = useRef(new Animated.Value(24)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(logoY,       { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(btnOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND} />

      <Animated.View style={[styles.center, { opacity: logoOpacity, transform: [{ translateY: logoY }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>SG</Text>
        </View>
        <Text style={styles.appName}>StudyGuide</Text>
        <Text style={styles.tagline}>Esthetician State Board Prep</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>
          1,100+ practice questions{"\n"}covering skin care, facials, waxing & more
        </Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: btnOpacity }]}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => router.push("/dashboard")}  // This needs changed to login-page once it's made
        >
          <Text style={styles.btnText}>Get Started</Text>
        </Pressable>
        <Text style={styles.footnote}>Login functionality not ready</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BRAND },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },

  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: 1 },

  appName:  { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: 0.5 },
  tagline:  { color: "#93c5fd", fontSize: 14, marginTop: 6, letterSpacing: 0.5 },

  divider: { width: 40, height: 2, backgroundColor: ACCENT, borderRadius: 2, marginVertical: 28 },

  subtitle: { color: "#cbd5e1", fontSize: 15, textAlign: "center", lineHeight: 24 },

  footer:     { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  btn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnPressed: { opacity: 0.85 },
  btnText:    { color: BRAND, fontSize: 16, fontWeight: "700" },
  footnote:   { color: SUBTLE, fontSize: 12, textAlign: "center" },
});