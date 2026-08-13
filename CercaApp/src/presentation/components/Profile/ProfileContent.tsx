import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";

import { useProfile } from "@/presentation/hooks/useProfile";
import { Profile } from "./Profile";

export function ProfileContent() {
  const { error, isLoading, profile, reload } = useProfile();

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? "No profile details are available."}</Text>
        <Button title="Try again" onPress={() => { void reload(); }} />
      </View>
    );
  }

  return <View style={styles.container}><Profile user={profile} /></View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F3F4F6", flex: 1, padding: 20 },
  center: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center", padding: 20 },
  error: { color: "#B91C1C", fontSize: 16, textAlign: "center" },
});
