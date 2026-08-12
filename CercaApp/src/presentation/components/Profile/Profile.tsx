import { StyleSheet, Text, View } from "react-native";

import type { ProfileProps } from "@/types/profile";

export function Profile({ user }: ProfileProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Account details</Text>
      <Text style={styles.label}>ID</Text>
      <Text selectable style={styles.value}>{user.id}</Text>
      <Text style={styles.label}>Platform role</Text>
      <Text style={styles.value}>{user.platformRole}</Text>
      <Text style={styles.label}>Capabilities</Text>
      <Text style={styles.value}>
        {user.capacities.length > 0
          ? user.capacities.join(", ")
          : "No capabilities assigned"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, gap: 6, padding: 20 },
  title: { color: "#111827", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  label: { color: "#6B7280", fontSize: 13, fontWeight: "600", marginTop: 8 },
  value: { color: "#111827", fontSize: 16 },
});
