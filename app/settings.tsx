import { useState } from "react";
import { useRouter } from "expo-router";
import { 
  Text,
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

/*
Foundation is set for settings, everything you see here right now is just placeholders as stated below.

Language toggle from English to Spanish needs toggle function completion once JSON translation is good.

Once firebase is implemented the following changes need to happen on:
user = auth.currentUser;
USER_NAME = user?.displayName ?? "User";
USER_EMAIL = user?.email ?? "";

Change password onPress:
onPress={() => sendPasswordResetEmail(auth, user.email)}

Sign out confirm onPress:
await signOut(auth);
router.replace("/login");

Once RevenueCat is implemented, "Restore Purchase" onPresss needs changed.

Privacy Policy needs completion.
Terms of Service needs completion.

*/

const BRAND = "#1e3a5f";
const ACCENT = "#3b82f6";

// Placeholders
const USER_NAME = "Joe";
const USER_EMAIL = "joe@mama.com"
const IS_PREMIUM = false;
const APP_VERSION = "1.0.0";

type RowProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
};

function Row({ icon, label, onPress, right, danger }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={danger ? "#dc2626" : BRAND }
        style={styles.rowIcon}
      />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {right !== undefined
        ? right
        : <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />}
    </Pressable>
  );
}

function SectionHeader({ title } : { title : string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [spanish, setSpanish] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTile}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Account info */}
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER_NAME.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.accountName}>{USER_NAME}</Text>
            <Text style={styles.accountEmail}>{USER_EMAIL}</Text>
          </View>
        </View>

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <Row icon="key-outline" label="Change Password" onPress={() => {}} />
          <Row icon="log-out-outline" label="Sign Out" onPress={() => setSignOutVisible(true)} danger right={null} />
        </View>


        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <Row icon="language-outline" label="Spanish" right={
            <Switch 
              value={spanish}
              onValueChange={setSpanish}
              trackColor={{ false: "#cbd5e1", true: ACCENT }}
              thumbColor="#fff"
            />
          } />
        </View>

        <SectionHeader title="Premium" />
        <View style={styles.section}>
          <Row icon="star-outline" label="Current Plan" right={
            <View style={[styles.badge, IS_PREMIUM ? styles.badgePremium : styles.badgeFree]}>
              <Text style={styles.badgeText}>{IS_PREMIUM ? "Premium" : "Free"}</Text>
            </View>
          } />
          <Row icon="refresh-outline" label="Restore Purchase" onPress={() => {}} />
            {!IS_PREMIUM && (
              <Pressable style={styles.upgradeBtn} onPress={() => {}}>
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </Pressable>
            )}
        </View>

        <SectionHeader title="About" />
        <View style={styles.section}>
          <Row icon="document-text-outline" label="Privacy Policy" onPress={() => {}} />
          <Row icon="reader-outline" label="Terms of Service" onPress={() => {}} />
          <Row icon="information-circle-outline" label="Version" right={<Text style={styles.versionText}>{APP_VERSION}</Text>} /> 
        </View>

      </ScrollView>

      {/* Sign out confirm */}
      <Modal
        visible={signOutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSignOutVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalBody}>Are you sure you want to sign out?</Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setSignOutVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              {/* Below this needs configured after firebase implementation */}
              <Pressable style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={() => setSignOutVisible(false)}> 
                <Text style={styles.modalBtnConfirmText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
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
  headerTile: { color: "#fff", fontSize: 17, fontWeight: "700" },

  scroll: { padding: 20, gap: 8, paddingBottom: 40 },

  accountCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: ACCENT, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  accountName: { color: "#1e293b", fontSize: 16, fontWeight: "700" },
  accountEmail: { color: "#64748b", fontSize: 13, marginTop: 2 },

  sectionHeader: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 4,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowPressed: { backgroundColor: "#f8fafc" },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, color: "#1e293b",  fontSize: 15 },
  rowLabelDanger: { color: "#dc2626" },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeFree: { backgroundColor: "#f1f5f9" },
  badgePremium: { backgroundColor: "#f3f9c3" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#1e293b" },

  upgradeBtn: { margin: 12, backgroundColor: ACCENT, borderRadius: 12, padding: 14, alignItems: "center" },
  upgradeText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  versionText: { color: "#94a3b8", fontSize: 14 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 32 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", gap: 8 },
  modalTitle: { color: "#1e293b", fontSize: 18, fontWeight: "800" },
  modalBody: { color: "#64748b", fontSize: 14, lineHeight: 20 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  modalBtnCancel: { backgroundColor: "#f1f5f9" },
  modalBtnConfirm: { backgroundColor: "#dc2626" },
  modalBtnCancelText: { color: "#1d293b", fontWeight: "600" },
  modalBtnConfirmText: { color: "#fff", fontWeight: "700" },
});