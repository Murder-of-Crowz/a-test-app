import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>Paul</Text>
          </View>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
        </View>

        {/* Hero card */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Welcome back!</Text>
          <Text style={styles.heroSub}>Here's what's new today.</Text>
          <TouchableOpacity style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Get started</Text>
          </TouchableOpacity>
        </View>

        {/* Section */}
        <Text style={styles.sectionTitle}>Featured</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {["Item A", "Item B", "Item C"].map((label) => (
            <TouchableOpacity key={label} style={styles.card}>
              <View style={styles.cardThumb} />
              <Text style={styles.cardLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <Text style={styles.sectionTitle}>Recent</Text>
        {["First entry", "Second entry", "Third entry"].map((item) => (
          <TouchableOpacity key={item} style={styles.listItem}>
            <View style={styles.listIcon} />
            <Text style={styles.listText}>{item}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20, gap: 12 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  greeting: { color: "#888", fontSize: 14 },
  name: { fontSize: 22, fontWeight: "700" },
  avatar: { width: 44, height: 44, borderRadius: 22 },

  hero: { backgroundColor: "#1a1a2e", borderRadius: 16, padding: 24, gap: 8 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  heroSub: { color: "#aaa", fontSize: 14 },
  heroCta: { marginTop: 8, backgroundColor: "#fff", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, alignSelf: "flex-start" },
  heroCtaText: { fontWeight: "600", color: "#1a1a2e" },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  row: { marginHorizontal: -20, paddingHorizontal: 20 },
  card: { marginRight: 12, width: 140 },
  cardThumb: { height: 100, backgroundColor: "#e8e8e8", borderRadius: 12, marginBottom: 8 },
  cardLabel: { fontWeight: "600" },

  listItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  listIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#e8e8e8" },
  listText: { fontSize: 15 },
});