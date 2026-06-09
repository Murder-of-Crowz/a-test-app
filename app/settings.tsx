import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CustomerInfo } from "react-native-purchases";
import {
  BRAND,
  ACCENT,
  BG,
  TEXT,
  MUTED,
  DANGER,
} from "@/src/theme/colors";
import { SHADOW_MD } from "@/src/theme/shadows";
import {
  scheduleReminder,
  cancelReminder,
  getPermissionStatus,
  hasScheduledReminder,
  requestPermission,
  sendTestNotif,
} from "@/src/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSettingsStore } from "@/src/settingsStore";
import { useSubscription } from "@/src/hooks/useSubscription";
import { Paywall } from "@/src/components/Paywall";
import { CustomerCenter } from "@/src/components/CustomerCenter";
import { restorePurchases } from "@/src/revenuecat/subscriptionManager";

const APP_VERSION = "1.0.0";

type RowProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
};

const PRIVACY_POLICY_URL = "https://esthiapp.com/privacy.html";
const TERMS_OF_SERVICE_URL = "https://esthiapp.com/terms.html";
const SUPPORT_URL = "https://esthiapp.com/support.html";



function Row({ icon, label, onPress, right, danger }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && onPress && styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={danger ? DANGER : BRAND}
        style={styles.rowIcon}
      />

      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>

      {right !== undefined ? (
        right
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();

  const spanish = useSettingsStore((state) => state.spanish);
  const forceFreeForTesting = useSettingsStore((state) => state.forceFreeForTesting);
  const { hasEsthiPro, refresh, updateCustomerInfo } = useSubscription();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState({ hour: 8, minute: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [customerCenterVisible, setCustomerCenterVisible] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    hasScheduledReminder().then(setNotificationsEnabled);
  }, []);

  const handleSpanishToggle = (value: boolean) => {
    useSettingsStore.setState({ spanish: value });
  };

  const handleForceFreeToggle = (value: boolean) => {
    useSettingsStore.setState({ forceFreeForTesting: value });
  };

  const handleNotificationToggle = async (val: boolean) => {
    if (val) {
      const status = await getPermissionStatus();
      const granted = status === "granted" || (await requestPermission());

      if (!granted) return;

      await scheduleReminder(reminderTime.hour, reminderTime.minute);
      setNotificationsEnabled(true);
      setShowPicker(true);
    } else {
      await cancelReminder();
      setNotificationsEnabled(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoreLoading(true);
      const customerInfo = await restorePurchases();
      useSettingsStore.setState({ forceFreeForTesting: false });
      updateCustomerInfo(customerInfo);
      setRestoreLoading(false);
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      setRestoreLoading(false);
    }
  };

  const handlePurchaseSuccess = (customerInfo?: CustomerInfo) => {
    setPaywallVisible(false);
    useSettingsStore.setState({ forceFreeForTesting: false });

    if (customerInfo) {
      updateCustomerInfo(customerInfo);
      return;
    }

    refresh();
  };

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
        <SectionHeader title="Preferences" />

        <View style={styles.section}>
          <Row
            icon="language-outline"
            label="Spanish"
            right={
              <Switch
                value={spanish}
                onValueChange={handleSpanishToggle}
                trackColor={{ false: "#cbd5e1", true: ACCENT }}
                thumbColor="#fff"
              />
            }
          />

          <Row
            icon="notifications-outline"
            label="Daily Reminder"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#cbd5e1", true: ACCENT }}
                thumbColor="#fff"
              />
            }
          />

          {notificationsEnabled && showPicker && (
            <View style={styles.timePickerRow}>
              <DateTimePicker
                value={(() => {
                  const d = new Date();
                  d.setHours(reminderTime.hour, reminderTime.minute, 0, 0);
                  return d;
                })()}
                mode="time"
                display="spinner"
                onChange={(_, date) => {
                  setShowPicker(false);

                  if (!date) return;

                  const hour = date.getHours();
                  const minute = date.getMinutes();

                  setReminderTime({ hour, minute });
                  scheduleReminder(hour, minute);
                }}
                style={styles.timePicker}
              />
            </View>
          )}

          {__DEV__ && (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={sendTestNotif}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color={ACCENT}
                style={styles.rowIcon}
              />

              <Text style={styles.rowLabel}>Test Notification</Text>
              <Text style={{ color: MUTED, fontSize: 13 }}>Fires in 5s</Text>
            </Pressable>
          )}
        </View>

        <SectionHeader title="Premium" />

        <View style={styles.section}>
          <Row
            icon="star-outline"
            label="Current Plan"
            right={
              <View
                style={[
                  styles.badge,
                  hasEsthiPro ? styles.badgePremium : styles.badgeFree,
                ]}
              >
                <Text style={styles.badgeText}>
                  {hasEsthiPro ? "Esthi Pro" : "Free"}
                </Text>
              </View>
            }
          />

          {__DEV__ && (
            <Row
              icon="flask-outline"
              label="Remove Pro for Testing"
              right={
                <Switch
                  value={forceFreeForTesting}
                  onValueChange={handleForceFreeToggle}
                  trackColor={{ false: "#cbd5e1", true: DANGER }}
                  thumbColor="#fff"
                />
              }
            />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
            onPress={handleRestorePurchases}
            disabled={restoreLoading}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={restoreLoading ? MUTED : BRAND}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>
              {restoreLoading ? "Restoring..." : "Restore Purchase"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
            onPress={() => setCustomerCenterVisible(true)}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={BRAND}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Manage Subscription</Text>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </Pressable>

          {!hasEsthiPro && (
            <Pressable
              style={styles.upgradeBtn}
              onPress={() => setPaywallVisible(true)}
            >
              <Text style={styles.upgradeText}>Upgrade to Esthi Pro</Text>
            </Pressable>
          )}
        </View>

        <SectionHeader title="About" />

        <View style={styles.section}>
          <Row icon="document-text-outline" label="Privacy Policy" onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}/>
          <Row icon="reader-outline" label="Terms of Service" onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL)}/>
          <Row icon="help-circle-outline" label="Support" onPress={() => Linking.openURL(SUPPORT_URL)}/>


          <Row
            icon="information-circle-outline"
            label="Version"
            right={<Text style={styles.versionText}>{APP_VERSION}</Text>}
          />
        </View>
      </ScrollView>

      <Modal
        visible={paywallVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaywallVisible(false)}
      >
        <Paywall
          onPurchaseSuccess={handlePurchaseSuccess}
          onPurchaseError={(error) => {
            console.error("Purchase error:", error);
          }}
          onClose={() => setPaywallVisible(false)}
        />
      </Modal>

      <Modal
        visible={customerCenterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomerCenterVisible(false)}
      >
        <CustomerCenter
          onClose={() => setCustomerCenterVisible(false)}
          onError={(error) => {
            console.error("Customer center error:", error);
          }}
        />
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

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

  sectionHeader: {
    color: MUTED,
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
    ...SHADOW_MD,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BG,
  },

  rowPressed: { backgroundColor: "#f8fafc" },

  rowIcon: { marginRight: 12 },

  rowLabel: { flex: 1, color: TEXT, fontSize: 15 },

  rowLabelDanger: { color: DANGER },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  badgeFree: { backgroundColor: BG },

  badgePremium: { backgroundColor: "#f3f9c3" },

  badgeText: { fontSize: 12, fontWeight: "700", color: TEXT },

  upgradeBtn: {
    margin: 12,
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },

  upgradeText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  versionText: { color: MUTED, fontSize: 14 },

  timePickerRow: { backgroundColor: "#fff", alignItems: "center" },

  timePicker: { width: "100%", height: 120 },
});
