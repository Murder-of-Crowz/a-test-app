import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Linking,
  Alert,
  StatusBar,
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
  getNextReminderDate,
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

function formatReminderDate(date: Date | null, spanish: boolean) {
  if (!date) return spanish ? "Recordatorio programado." : "Reminder scheduled.";
  return `${spanish ? "Proximo recordatorio" : "Next reminder"}: ${date.toLocaleString(spanish ? "es-US" : undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

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
  const copy = spanish
    ? {
        about: "Acerca de",
        cancel: "Cancelar",
        currentPlan: "Plan actual",
        dailyReminder: "Recordatorio diario",
        firesIn5s: "Se activa en 5s",
        free: "Gratis",
        manageSubscription: "Administrar suscripcion",
        notificationsOffBody:
          "Activa las notificaciones en la configuracion del sistema para usar recordatorios diarios.",
        notificationsOffTitle: "Las notificaciones estan desactivadas",
        openSettings: "Abrir configuracion",
        preferences: "Preferencias",
        premium: "Premium",
        privacyPolicy: "Politica de privacidad",
        reminderOnTitle: "Recordatorio diario activado",
        reminderUpdatedTitle: "Recordatorio diario actualizado",
        removeProForTesting: "Quitar Pro para pruebas",
        restorePurchase: "Restaurar compra",
        restoring: "Restaurando...",
        settings: "Configuracion",
        spanish: "Espanol",
        support: "Soporte",
        termsOfService: "Terminos de servicio",
        testNotification: "Notificacion de prueba",
        upgradeToPro: "Actualizar a Esthi Pro",
        version: "Version",
      }
    : {
        about: "About",
        cancel: "Cancel",
        currentPlan: "Current Plan",
        dailyReminder: "Daily Reminder",
        firesIn5s: "Fires in 5s",
        free: "Free",
        manageSubscription: "Manage Subscription",
        notificationsOffBody:
          "Turn on notifications in system settings to use daily reminders.",
        notificationsOffTitle: "Notifications are off",
        openSettings: "Open Settings",
        preferences: "Preferences",
        premium: "Premium",
        privacyPolicy: "Privacy Policy",
        reminderOnTitle: "Daily reminder on",
        reminderUpdatedTitle: "Daily reminder updated",
        removeProForTesting: "Remove Pro for Testing",
        restorePurchase: "Restore Purchase",
        restoring: "Restoring...",
        settings: "Settings",
        spanish: "Spanish",
        support: "Support",
        termsOfService: "Terms of Service",
        testNotification: "Test Notification",
        upgradeToPro: "Upgrade to Esthi Pro",
        version: "Version",
      };

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState({ hour: 8, minute: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [customerCenterVisible, setCustomerCenterVisible] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const showNotificationSettingsAlert = useCallback(() => {
    Alert.alert(
      copy.notificationsOffTitle,
      copy.notificationsOffBody,
      [
        { text: copy.cancel, style: "cancel" },
        { text: copy.openSettings, onPress: () => Linking.openSettings() },
      ],
    );
  }, [
    copy.cancel,
    copy.notificationsOffBody,
    copy.notificationsOffTitle,
    copy.openSettings,
  ]);

  const syncNotificationState = useCallback(async () => {
    try {
      const [status, scheduled] = await Promise.all([
        getPermissionStatus(),
        hasScheduledReminder(),
      ]);
      const canShowReminder = status === "granted" && scheduled;

      if (scheduled && status !== "granted") {
        await cancelReminder();
      }

      setNotificationsEnabled(canShowReminder);
      if (!canShowReminder) setShowPicker(false);
    } catch (error) {
      console.error("Failed to sync notification state:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncNotificationState();
    }, [syncNotificationState]),
  );

  const ensureNotificationPermission = useCallback(async () => {
    const status = await getPermissionStatus();
    if (status === "granted") return true;

    const granted = await requestPermission();
    if (granted) return true;

    showNotificationSettingsAlert();
    return false;
  }, [showNotificationSettingsAlert]);

  const handleSpanishToggle = (value: boolean) => {
    useSettingsStore.setState({ spanish: value });
  };

  const handleForceFreeToggle = (value: boolean) => {
    useSettingsStore.setState({ forceFreeForTesting: value });
  };

  const handleNotificationToggle = async (val: boolean) => {
    if (val) {
      const granted = await ensureNotificationPermission();

      if (!granted) {
        setNotificationsEnabled(false);
        setShowPicker(false);
        return;
      }

      try {
        await scheduleReminder(reminderTime.hour, reminderTime.minute);
        const nextReminder = await getNextReminderDate(
          reminderTime.hour,
          reminderTime.minute,
        );
        setNotificationsEnabled(true);
        setShowPicker(true);
        Alert.alert(
          copy.reminderOnTitle,
          formatReminderDate(nextReminder, spanish),
        );
      } catch (error) {
        console.error("Failed to schedule reminder:", error);
        setNotificationsEnabled(false);
        setShowPicker(false);
      }
    } else {
      await cancelReminder();
      setNotificationsEnabled(false);
      setShowPicker(false);
    }
  };

  const handleReminderRowPress = async () => {
    if (notificationsEnabled) {
      setShowPicker(true);
      return;
    }

    await handleNotificationToggle(true);
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
      <StatusBar barStyle="light-content" backgroundColor={BRAND} />
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/dashboard")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.headerTile}>{copy.settings}</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scroll}>
        <SectionHeader title={copy.preferences} />

        <View style={styles.section}>
          <Row
            icon="language-outline"
            label={copy.spanish}
            right={
              <Switch
                value={spanish}
                onValueChange={handleSpanishToggle}
                trackColor={{ false: "#cbd5e1", true: ACCENT }}
                thumbColor="#fff"
              />
            }
          />

          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [
                styles.rowPressTarget,
                pressed && styles.rowPressed,
              ]}
              onPress={handleReminderRowPress}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={BRAND}
                style={styles.rowIcon}
              />

              <Text style={styles.rowLabel}>{copy.dailyReminder}</Text>
            </Pressable>

            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#cbd5e1", true: ACCENT }}
              thumbColor="#fff"
            />
          </View>

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
                  scheduleReminder(hour, minute)
                    .then(() => getNextReminderDate(hour, minute))
                    .then((nextReminder) => {
                      Alert.alert(
                        copy.reminderUpdatedTitle,
                        formatReminderDate(nextReminder, spanish),
                      );
                    })
                    .catch((error) => {
                      console.error("Failed to schedule reminder:", error);
                      setNotificationsEnabled(false);
                    });
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

              <Text style={styles.rowLabel}>{copy.testNotification}</Text>
              <Text style={{ color: MUTED, fontSize: 13 }}>{copy.firesIn5s}</Text>
            </Pressable>
          )}
        </View>

        <SectionHeader title={copy.premium} />

        <View style={styles.section}>
          <Row
            icon="star-outline"
            label={copy.currentPlan}
            right={
              <View
                style={[
                  styles.badge,
                  hasEsthiPro ? styles.badgePremium : styles.badgeFree,
                ]}
              >
                <Text style={styles.badgeText}>
                  {hasEsthiPro ? "Esthi Pro" : copy.free}
                </Text>
              </View>
            }
          />

          {__DEV__ && (
            <Row
              icon="flask-outline"
              label={copy.removeProForTesting}
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
              {restoreLoading ? copy.restoring : copy.restorePurchase}
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
            <Text style={styles.rowLabel}>{copy.manageSubscription}</Text>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </Pressable>

          {!hasEsthiPro && (
            <Pressable
              style={styles.upgradeBtn}
              onPress={() => setPaywallVisible(true)}
            >
              <Text style={styles.upgradeText}>{copy.upgradeToPro}</Text>
            </Pressable>
          )}
        </View>

        <SectionHeader title={copy.about} />

        <View style={styles.section}>
          <Row icon="document-text-outline" label={copy.privacyPolicy} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}/>
          <Row icon="reader-outline" label={copy.termsOfService} onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL)}/>
          <Row icon="help-circle-outline" label={copy.support} onPress={() => Linking.openURL(SUPPORT_URL)}/>


          <Row
            icon="information-circle-outline"
            label={copy.version}
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
  safe: { flex: 1, backgroundColor: BRAND },

  content: { flex: 1, backgroundColor: BG },

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

  rowPressTarget: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginVertical: -14,
    marginLeft: -16,
    paddingLeft: 16,
    paddingVertical: 14,
  },

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
